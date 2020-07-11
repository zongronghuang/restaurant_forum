const fs = require('fs')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
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
  // 分別 profile owner 與登入者，避免 main 頁面權限跑掉
  getUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(profileOwner => {
        // 登入者 = profile 擁有者 => 有權限修改 profile
        const editRight = req.user.id === profileOwner.id ? true : false

        // profile 擁有者沒上傳圖片 => 顯示預設圖片
        if (!profileOwner.image) profileOwner.image = defaultIcon

        return res.render('profile', {
          profileOwner: profileOwner.toJSON(),
          editRight
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
  }
}


module.exports = userController