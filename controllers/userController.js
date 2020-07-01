const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

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
    }
  }
}

module.exports = userController