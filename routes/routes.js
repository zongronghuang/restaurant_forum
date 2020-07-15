const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')


const multer = require('multer')
const upload = multer({ dest: 'temp/' })


// User authentication
const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }

  res.redirect('/signin')
}

// Admin authentication
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }

    return res.redirect('/')
  }
  res.redirect('/signin')
}

// Admin management
router.get('/admin', authenticatedAdmin, (req, res) => {
  res.redirect('/admin/restaurants')
})
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)

// Users
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id/edit', authenticated, upload.single('image'), userController.putUser)

// Restaurants
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)


router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

// Categories
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

// Comments
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

// Favorites
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// Likes
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// Followships
router.post('/followed/:userId', authenticated, userController.addFollowee)
router.delete('/followed/:userId', authenticated, userController.removeFollowee)

// Most favorited


// Registration
router.get('/signup', userController.getSignUpPage)
router.post('/signup', userController.signUp)

// Login
router.get('/signin', userController.getSignInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/',
  failureFlash: true
}), userController.signIn)

// Logout
router.get('/logout', userController.logOut)

module.exports = router