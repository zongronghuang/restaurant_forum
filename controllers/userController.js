const fs = require('fs')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const imgur = require('imgur-node-api')
const { createRestaurant } = require('./adminController')
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
  }
}


module.exports = userController