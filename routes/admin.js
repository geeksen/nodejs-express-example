
var express = require('express')
var router = express.Router()

// var async = require('async')

router.get('/login', function (req, res, next) {
  res.render('admin/login', {})
})

module.exports = router
