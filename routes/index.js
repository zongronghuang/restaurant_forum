const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')


const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  // 一般使用者驗證
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }

    res.redirect('/signin')
  }

  // Admin 驗證
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) { return next() }

      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  ////////// restaurant 路由 \\\\\\\\\\
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

  app.get('/restaurants', authenticated, restController.getRestaurants)

  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  //////////// Admin 管理路由 \\\\\\\\\\
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/restaurants')
  })

  // Users
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)

  app.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)

  // Restaurants
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)

  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // Categories
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // Comments
  app.post('/comments', authenticated, commentController.postComment)

  // Registration
  app.get('/signup', userController.getSignUpPage)

  app.post('/signup', userController.signUp)

  // Login
  app.get('/signin', userController.getSignInPage)

  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }), userController.signIn)

  // Logout
  app.get('/logout', userController.logOut)

}