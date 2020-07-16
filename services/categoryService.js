const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => callback({
              categories,
              category: category.toJSON()
            }))
        } else {
          callback({ categories })
        }
      })
      .catch(error => console.log(error))
  },

  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: 'Category name cannot be empty' })
    } else {
      return Category.create({
        name: req.body.name
      })
        .then(category => callback({ status: 'success', message: 'Category created' }))
        .catch(error => console.log(error))
    }
  }
}

module.exports = categoryService