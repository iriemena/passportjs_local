const express = require('express')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../model/User')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('welcome', { title: 'Home Page' })
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Dashboard', username: req.user.username })
})

router.get('/user/register', (req, res) => {
  res.render('register', { title: 'Register' })
})

router.get('/user/login', (req, res) => {
  res.render('login', { title: 'Login' })
})

router.post('/user/register', (req, res) => {
  // user authentication
  let { username, email, password, password2 } = req.body
  let error = []
  if (!username || !email || !password || !password2) {
    error.push({ msg: 'Please, enter all fields' })
  }
  if (password !== password2) {
    error.push({ msg: 'Password do not match' })
  }
  if (password < 6) {
    error.push({ msg: 'Password must be atleast 6 characters' })
  }
  if (error.length > 0) {
    res.render('register', {
      error,
      email,
      username,
      password,
      password2
    })
  } else {
    User.findOne({ email }).then(user => {
      if (user) {
        error.push({ msg: 'Email already exist' })
        res.render('register', {
          error,
          email,
          username,
          password,
          password2
        })
      } else {
        let newUser = new User(req.body)
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                req.flash('success_msg', 'Registration successfull! Login')
                res.redirect('/user/login')
              })
              .catch(err => console.log(err))
          })
        )
      }
    })
  }
})

// passport autentication for login
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Email not found!' })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            return done(null, user)
          }
          return done(null, false, { message: 'Password incorrect' })
        })
      })
      .catch(err => console.log(err))
  })
)
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

//   login handle
router.post('/user/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next)
})

// logout handle
router.get('/user/logout', (req, res) => {
  req.logout()
  req.flash('error_msg', 'You are logged out')
  res.redirect('/user/login')
})
// router protection using ensure autenticated
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error_msg', 'Login to continue')
  res.redirect('/user/login')
}

module.exports = router
