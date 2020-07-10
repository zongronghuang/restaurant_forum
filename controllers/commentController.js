const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then(comment => res.redirect(`/restaurants/${req.body.restaurantId}`))
      .catch(error => console.log(error))
  },

  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(comment => res.redirect(`/restaurants/${comment.RestaurantId}`))
      })
      .catch(error => console.log(error))
  }
}

module.exports = commentController