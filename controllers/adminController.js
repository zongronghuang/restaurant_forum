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
    adminService.postRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        res.redirect('back')
      } else {
        req.flash('success_messages', data.message)
        res.redirect('/admin/restaurants')
      }
    })
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
    adminService.putRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        res.redirect('back')
      } else {
        res.redirect('/admin/restaurants')
      }
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data.status === 'success') res.redirect('/admin/restaurants')
    })
  }

}

module.exports = adminController