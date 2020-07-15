let routes = require('./routes.js')
let apis = require('./apis.js')

module.exports = (app) => {
  app.use('/', routes)
  app.use('/api', apis)
}