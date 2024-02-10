const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../models/user.model')
const ResetPassword = require('../models/reset-password.model')
const router = express.Router()


router.get('/login', (req, res) => {
    res.render('login') // /views/login.ejs
});

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
  const {  email, password, firstname, lastname, username } = req.body;
  const user = await User.findOne({
      where: {
          email
      }
  })
  if (user) {
      res.render('register', { "errorMessage": 'user already exists' });
  } else {
      const user = await User.create({
        lastName: lastname,
        firstName: firstname,
        password,
        email,
        username
      })
      res.redirect("/auth/login")
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const secretKey = 'your_secret_key';

    const user = await User.findOne({
      where: {
          email
      }
    })
    if (user) {
      if (user.password === password) {
          const payload = {
            "id": user._id,
            "email": user.email
          }
          const token = jwt.sign(payload, secretKey, { expiresIn: '3h' });
          res.cookie('token', token, {maxAge: 3 * 60 *60 *1 *1000, path: '/'})
          res.redirect('/user/profile');
      } else {
          res.render('login', { "errorMessage": 'The password is incorrect!' });
      }
    } else {
      res.render('login', { "errorMessage": 'user not found' });
    }
})

router.post('/forget-password', async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({
      where: {
          email
      }
    })
    if (user) {
      const token = await generateStrongPassword(32);
      await ResetPassword.create({
        email, token
      })
      res.send({"message": "OK"})
    } else {
      res.redirect("/auth/login")
    }
})

router.get('/forget-password', (req, res) => {
  res.render('forget-password')
})

router.get('/forget-password/:token', (req, res) => {
  res.render('password-change', {token: req.params.token})
})

router.post('/forget-password/:token', async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  const reset_passsword = await ResetPassword.findOne({
    where: {
        token
    }
  })
  if (reset_passsword) {
    const user = await User.findOne({
      where: {
        email: reset_passsword.email
      }
    })
    if (user) {
      user.password = password

      await user.save()
      res.redirect("/auth/login")
    } else {
      res.redirect("/auth/login")
    }
  } else {
    res.redirect("/auth/login")
  }
})

function generateStrongPassword(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let password = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      password += chars[randomIndex];
  }

  return password;
}

module.exports = router