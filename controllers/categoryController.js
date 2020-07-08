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
  }
}

module.exports = categoryController