
'use strict'

let express = require('express')
let router = express.Router()

let sqlite3 = require('sqlite3')

router.get('/list', function (req, res, next) {
  let db = new sqlite3.Database(['./database/', req.body.database_name, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      return res.closeRedirect(db, '/sqlite3/show_databases')
    })
})

module.exports = router
