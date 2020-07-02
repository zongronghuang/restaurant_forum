const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')

module.exports = (app, passport) => {
  app.get('/', (req, res) => res.redirect('/restaurants'))

  app.get('/restaurants', restController.getRestaurants)

  app.get('/admin', (req, res) => {
    res.redirect('/admin/restaurants')
  })

  app.get('/admin/restaurants', adminController.getRestaurants)


  app.get('/signup', userController.getSignUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.getSignInPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }), userController.signIn)
  app.get('/logout', userController.logOut)

}