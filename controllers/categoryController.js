const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => res.render('admin/category', {
              categories,
              category: category.toJSON()
            }))
        } else {
          return res.render('admin/cateogry', { categories })
        }
      })
      .catch(error => console.log(error))
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'Category name cannot be empty!')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then(category => res.redirect('/admin/categories'))
        .catch(error => console.log(error))
    }
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('Category name cannot be empty')
      return res.redirect('back')
    } else {
      return Category.findByPK(req.params.id)
        .then(category => {
          category.update(req.body)
            .then(category => res.redirect('/admin/categories'))
        })
    }
  }
}

module.exports = categoryController