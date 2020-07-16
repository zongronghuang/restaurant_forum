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
  },

  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: 'Category name cannot be empty' })
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update(req.body)
            .then(category => callback({ status: 'success', message: 'Category name updated' }))
        })
        .catch(error => console.log(error))
    }
  },

  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(category => callback({ status: 'success', message: 'Category deleted' }))
      })
      .catch(error => {
        console.log(error)
        callback({ status: 'error', message: `${error}` })
      })
  }
}

module.exports = categoryService