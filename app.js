const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const app = express()
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport.js')
const port = 3000

app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'main' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user

  next()
})

app.listen(port, () => {
  // db.sequelize.sync() 確認與 database 連線是否正常 
  console.log(`App up and running on http://localhost:${port}`)
})

require('./routes')(app, passport)