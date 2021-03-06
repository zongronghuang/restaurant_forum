const fs = require('fs')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const { createRestaurant } = require('./adminController')
const user = require('../models/user')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const defaultIcon = "/images/defaultIcon.png"

const userController = {
  getSignUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) {
      req.flash('success_messages', 'Unmatched passwords!')

      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', 'User already registered')
            return res.redirect('/signup')
          } else {
            User.create({
              name,
              email,
              password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
            })
              .then(user => {
                req.flash('success_messages', 'Registration done')
                return res.redirect('/signin')
              })
              .catch(error => console.log(error))
          }
        })
        .catch(error => console.log(error))
    }
  },

  getSignInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', 'You just signed in!')
    res.redirect('/restaurants')
  },

  logOut: (req, res) => {
    req.flash('success_messages', 'You just signed out')
    req.logout()
    res.redirect('/signin')
  },

  // 取得 profile owner 的資料
  // 區分 profile owner 與登入者，避免 main 頁面權限跑掉
  // eager loading 取得 profile owner comments 和評論過的 restaurants
  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: { model: Comment, include: { model: Restaurant } }
    })
      .then(profileOwner => profileOwner.toJSON())
      .then(profileOwner => {
        // 取得評論過的餐廳資料，且餐廳不重複
        const restaurants = []
        profileOwner.Comments.forEach(comment => {
          if (restaurants.every(restaurant => restaurant.id !== comment.Restaurant.id)) {
            restaurants.push(comment.Restaurant)
          }
        })

        // 登入者 = profile 擁有者 => 有權限修改 profile
        const editRight = req.user.id === profileOwner.id

        // profile 擁有者沒上傳圖片 => 顯示預設圖片
        if (!profileOwner.image) profileOwner.image = defaultIcon

        return res.render('profile', {
          profileOwner,
          editRight,
          count: restaurants.length,
          restaurants
        })
      })
      .catch(error => console.log(error))
  },

  // 前往編輯 profile owner 資料的頁面
  editUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(profileOwner => {
        res.render('edit', { profileOwner: profileOwner.toJSON() })
      })
      .catch(error => console.log(error))
  },

  // 修改 profile owner 的資料
  putUser: (req, res) => {
    const { name, image } = req.body

    if (!name) {
      req.flash('error_messages', 'Username cannot be empty')
      return res.redirect('back')
    }

    const { file } = req

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(profileOwner => profileOwner.update({
            name,
            image: file ? img.data.link : null
          }))
          .then(profileOwner => {
            req.flash('success_messgaes', 'Profile updated!')
            res.redirect(`/users/${req.params.id}`)
          })
          .catch(error => console.log(error))
      })
    } else {
      return User.findByPk(req.params.id)
        .then(profileOwner => {
          profileOwner.update({
            name,
            image: profileOwner.image
          })
            .then(profileOwner => {
              req.flash('success_messages', 'Profile updated!')
              res.redirect(`/users/${req.params.id}`)
            })
        })
        .catch(error => console.log(error))
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(favorite => res.redirect('back'))
      .catch(error => console.log(error))
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(favorite => res.redirect('back'))
      })
      .catch(error => console.log(error))
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => res.redirect('back'))
      .catch(error => console.log(error))
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => res.redirect('back'))
      })
      .catch(error => console.log(error))
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followees.map(d => d.id).includes(user.id)
        }))

        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

        // 如果使用者沒有頭像，改用 defaultIcon 作為頭像
        users.forEach(user => {
          if (!user.image) user.image = defaultIcon
        })

        return res.render('topUser', { users })
      })
      .catch(error => console.log(error))
  },

  addFollowee: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followedId: req.params.userId
    })
      .then(followship => res.redirect('back'))
      .catch(error => console.log(error))
  },

  removeFollowee: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followedId: req.params.userId
      }
    })
      .then(followship => {
        followship.destroy()
          .then(followship => res.redirect('back'))
      })
      .catch(error => console.log(error))
  }
}


module.exports = userController