const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  getSignUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    })
      .then(user => {
        return res.redirect('/signin')
      })
      .catch(error => console.log(error))
  }
}

module.exports = userController