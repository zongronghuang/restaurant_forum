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
        res.redirect('back')
      } else {
        res.redirect('/admin/categories')
      }
    })
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('Category name cannot be empty')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update(req.body)
            .then(category => res.redirect('/admin/categories'))
        })
        .catch(error => console.log(error))
    }
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(category => res.redirect('/admin/categories'))
      })
      .catch(error => console.log(error))
  }
}

module.exports = categoryController