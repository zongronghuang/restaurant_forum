const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render('admin/category', { categories })
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
  }
}

module.exports = categoryController