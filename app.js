const express = require('express')
const ejsLayout = require('express-ejs-layouts')
const dotenv = require('dotenv')
const flash = require('connect-flash')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const router = require('./route/user')

// app initialization
const app = express()

// passport
// require('./passport')

// ejs middleware
app.use(ejsLayout)
app.set('view engine', 'ejs')

// flash middleware
app.use(flash())

// express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// global variables for flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

// config
require('dotenv/config')

// static file
app.use(express.static('public'))

// body parser
app.use(express.urlencoded({ extended: false }))

// router
app.use(router)

// DB database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connected...'))
  .catch(err => console.log(err))

//   PORT
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('server running...'))
