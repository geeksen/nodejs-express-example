
let express = require('express')
let router = express.Router()

router.get('/login', function (req, res, next) {
  // req.session.user_id = 0
  res.render('admin/login', {})
})

router.get('/logout', function (req, res, next) {
  req.session.destory()

  res.clearCookie('session')
  res.render('admin/login', {})
})

module.exports = router
