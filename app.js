const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const app = express()
const bodyParser = require('body-parser')
const port = 3000

app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'main' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, () => {
  // db.sequelize.sync() 確認與 database 連線是否正常 
  console.log(`App up and running on http://localhost:${port}`)
})

require('./routes')(app)