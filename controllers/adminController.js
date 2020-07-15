const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
// const { userInfo } = require('os')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const adminService = require('../services/adminService.js')


const adminController = {
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        // console.log('Users', users)
        res.render('admin/users', { users })
      })
      .catch(error => console.log(error))
  },

  putUsers: (req, res) => {
    // console.log('req.body', req.body)
    const { name, email, password, isAdmin } = req.body

    return User.findByPk(req.params.id)
      .then(user => {
        user.update({
          name,
          email,
          password,
          isAdmin: req.body.role
        })
          .then(user => {
            req.flash('success_messages', 'Updated user role!')
            res.redirect('/admin/users')
          })
      })
      .catch(error => console.log(error))
  },

  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render('admin/create', { categories })
      })
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
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
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
        image: null,
        CategoryId: req.body.categoryId
      })
        .then(restaurant => {
          req.flash('success_messages', 'Created a restaurant item')

          return res.redirect('/admin/restaurants')
        })
    }
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      res.render('admin/restaurant', data)
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            return res.render('admin/create', {
              categories,
              restaurant: restaurant.toJSON()
            })
          })
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
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
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
            image: restaurant.image,
            CategoryId: req.body.categoryId
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