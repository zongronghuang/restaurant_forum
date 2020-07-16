const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService.js')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      res.render('admin/category', data)
    })
  },

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', 'Category name cannot be empty')
        res.redirect('back')
      } else {
        res.redirect('/admin/categories')
      }
    })
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('Category name cannot be empty')
        res.redirect('back')
      } else {
        res.redirect('/admin/categories')
      }
    })
  },

  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', 'Failed to delete the category')
        res.redirect('back')
      } else {
        res.redirect('/admin/categories')
      }
    })
  }
}

module.exports = categoryController