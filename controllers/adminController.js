const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getUsers: (req, res) => {

  },

  putUsers: (req, res) => {

  },

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

    const { file } = req
    // console.log('req.file', file)
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)

      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null
        })
          .then(restaurant => {
            req.flash('success_messages', 'Created a restaurant item')
            res.redirect('/admin/restaurants')
          })
          .catch(error => console.log(error))
      })
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null
      })
        .then(restaurant => {
          req.flash('success_messages', 'Created a restaurant item')

          return res.redirect('/admin/restaurants')
        })
    }
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

    const { file } = req
    // console.log('req.file', file)

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image
            })
              .then(restaurant => {
                req.flash('success_messages', 'Restaurant info edited')
                res.redirect('/admin/restaurants')
              })
              .catch(error => console.log(error))
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image
          })
            .then(restaurant => {
              req.flash('success_messages', 'Restaurant info edited')
              res.redirect('/admin/restaurants')
            })
        })
    }
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