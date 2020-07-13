const db = require('../models')
const restaurant = require('../models/restaurant')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10


const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    Restaurant.findAndCountAll({
      raw: true,
      nest: true,
      include: [Category],
      where: whereQuery,
      offset,
      limit: pageLimit
    })
      .then(result => {
        let page = Number(req.query.page) || 1
        let pages = Math.ceil(result.count / pageLimit)
        let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        let prev = (page - 1) < 1 ? 1 : (page - 1)
        let next = (page + 1) > pages ? pages : (page + 1)

        const data = result.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id),
          categoryName: r.Category.name
        }))

        Category.findAll({
          raw: true,
          nest: true
        })
          .then(categories => {
            return res.render('restaurants', {
              restaurants: data,
              categories,
              categoryId,
              page,
              totalPage,
              prev,
              next
            })
          })
      })
      .catch(error => console.log(error))
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }]
    })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)

        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)

        // 瀏覽次數 + 1
        restaurant.viewCounts = Number(restaurant.viewCounts) + 1

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })

        // 更新瀏覽次數
        return restaurant.save()
          .then(restaurant => console.log(`==${restaurant.name} has ${restaurant.viewCounts} views`))
      })
      .catch(error => console.log(error))
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [Category]
    })
      .then(restaurants => {
        Comment.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [User, Restaurant]
        })
          .then(comments => {
            return res.render('feeds', {
              restaurants,
              comments,
            })
          })
      })
      .catch(error => console.log(error))
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, {
        model: Comment, include: [User]
      }
      ]
    })
      .then(restaurant => res.render('dashboard', { restaurant: restaurant.toJSON() }))
      .catch(error => console.log(error))
  },

  getTopRestaurant: (req, res) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          FavoritedUserCount: restaurant.FavoritedUsers.length,
          isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
        }))

        // 排序：最多人加入最愛的餐廳，取前十名
        restaurants = restaurants.sort((a, b) => b.FavoritedUserCount - a.FavoritedUserCount).slice(0, 10)

        // 餐廳 description 最多顯示 100 字元
        restaurants.map(restaurant => restaurant.description = restaurant.description.slice(0, 100))

        // console.log('===top 10 restaurants', restaurants)
        res.render('topRestaurant', { restaurants })
      })
      .catch(error => console.log(error))

  }
}

module.exports = restController