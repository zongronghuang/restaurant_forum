const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category],
    })
      .then(restaurants => {
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          categoryName: r.Category.name
        }))

        return res.render('restaurants', {
          restaurants: data
        })
      })
      .catch(error => console.log(error))
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        return res.render('restaurant', {
          restaurant: restaurant.toJSON()
        })
      })
  }
}

module.exports = restController