const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        callback({ restaurants })
      })
      .catch(error => console.log(error))
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      })
      .catch(error => console.log(error))
  },

  postRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body

    if (!name) {
      return callback({ status: 'error', message: 'Empty restaurant name' })
    }

    const { file } = req

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
            callback({ status: 'success', message: 'Created one restaurant' })
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
          callback({ status: 'success', message: 'Created one restaurant' })
        })
    }
  },

  putRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body

    if (!name) {
      callback({ status: 'error', message: 'No restaurant info' })
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
                callback({ status: 'success', message: 'Restaurant info edited' })
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
              callback({ status: 'success', message: 'Restaurant info edited' })
            })
        })
    }
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = adminService
