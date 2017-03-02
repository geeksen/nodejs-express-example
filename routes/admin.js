
'use strict'

let express = require('express')
let router = express.Router()
let md5 = require('md5')

router.get('/login', function (req, res, next) {
  let remoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let remoteAddrs = remoteAddr.split(':')[3].split('.')

  remoteAddrs.pop()
  remoteAddrs.push('*')
  remoteAddr = remoteAddrs.join('.')

  req.app.get('db000').getConnection(
    function selectAccess (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [remoteAddr, 'N'],
        function doResponse (err, rows, fields) {
          dbConnShard.release()
          if (err) { return res.send(err.message) }
          if (rows.length === 0) { return res.render('message', { message: 'access denied' }) }

          return res.render('admin/login', { req: req })
        })
    })
})

router.post('/auth', function (req, res, next) {
  let remoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let remoteAddrs = remoteAddr.split(':')[3].split('.')

  remoteAddrs.pop()
  remoteAddrs.push('*')
  remoteAddr = remoteAddrs.join('.')

  if (!req.body.admin_id || !req.body.passwd) {
    return res.render('message', { message: 'admin_id and passwd required' })
  }

  req.app.get('db000').getConnection(
    function selectAccess (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [remoteAddr, 'N'],
        function selectAdmin (err, rows, fields) {
          if (err) { return res.send(err.message) }
          if (rows.length === 0) { return res.render('message', { message: 'access denied' }) }

          dbConnShard.query('SELECT admin_id FROM admin WHERE admin_id = ? AND passwd = ? AND is_deleted = ?', [req.body.admin_id, md5(md5(req.body.passwd)), 'N'],
            function doResponse (err, rows, fields) {
              dbConnShard.release()
              if (err) { return res.send(err.message) }
              if (rows.length === 0) { return res.render('message', { message: 'login failed' }) }

              req.session.admin_id = req.body.admin_id
              return res.redirect('/')
            })
        })
    })
})

router.get('/logout', function (req, res, next) {
  res.clearCookie('session')
  return res.redirect('/admin/login')
})

module.exports = router
