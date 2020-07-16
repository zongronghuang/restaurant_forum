const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const categoryService = require('../services/categoryService.js')
const adminService = require('../services/adminService.js')

router.get('/admin/restaurants', adminController.getRestaurants)

router.get('/admin/restaurants/:id', adminController.getRestaurant)

router.get('/admin/categories', categoryController.getCategories)

router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

module.exports = router