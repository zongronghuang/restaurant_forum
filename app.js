const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const app = express()
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport.js')
const methodOverride = require('method-override')
const port = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers.js')
}))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use('/upload', express.static(__dirname + '/upload'))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user

  next()
})

app.use(methodOverride('_method'))

app.listen(port, () => {
  // db.sequelize.sync() 讓 model 和 資料庫 schema 同步
  // 可能導致 pending migration files 的問題
  console.log(`App up and running on http://localhost:${port}`)
})

require('./routes')(app, passport)