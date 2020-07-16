const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../../services/adminService.js')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      res.json(data)
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => { res.json(data) })
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => res.json({ status: 'success', message: '' }))
      })
      .catch(error => console.log(error))
  }

}

module.exports = adminController