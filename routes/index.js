const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')

module.exports = (app, passport) => {
  // 一般使用者認證方法
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }

    res.redirect('/signin')
  }

  // Admin 認證方法
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) { return next() }

      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  // 通過認證前往首頁路由
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)

  // Admin 路由
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/restaurants')
  })
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

  // 註冊路由
  app.get('/signup', userController.getSignUpPage)
  app.post('/signup', userController.signUp)

  // 登入路由
  app.get('/signin', userController.getSignInPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }), userController.signIn)

  // 登出路由
  app.get('/logout', userController.logOut)

}