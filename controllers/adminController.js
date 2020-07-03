const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      })
      .catch(error => console.log(error))
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body

    if (!name) {
      req.flash('error_messages', 'No restaurant info')

      return res.redirect('back')
    }

    return Restaurant.create({
      name,
      tel,
      address,
      opening_hours,
      description
    })
      .then(restaurant => {
        req.flash('success_messages', 'Created a restaurant item')
        res.redirect('/admin/restaurants')
      })
      .catch(error => console.log(error))
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        return res.render('admin/restaurant', {
          restaurant
        })
      })
      .catch(error => console.log(error))
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        return res.render('admin/create', { restaurant })
      })
      .catch(error => console.log(error))
  },

  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body

    if (!name) {
      req.flash('error_messages', 'No restaurant info')
      return res.redirect('back')
    }

    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.update({
          name,
          tel,
          address,
          opening_hours,
          description
        })
      })
      .then(restaurant => {
        req.flash('success_messages', 'Restaurant info edited')
        res.redirect('/admin/restaurants')
      })
      .catch(error => console.log(error))
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => restaurant.destroy()
        .then(restaurant => res.redirect('/admin/restaurants'))
      )
      .catch(error => console.log(error))
  }

}

module.exports = adminController