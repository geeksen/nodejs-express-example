
'use strict'

let express = require('express')
let router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('index', { req: req })
})

module.exports = router
