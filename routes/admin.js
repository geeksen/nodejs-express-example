
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
    function selectAccess (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [remoteAddr, 'N'],
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }
          if (rows.length === 0) { return res.send('access denied') }

          return res.render('admin/login', { req: req })
        })
    })
})

router.post('/auth', function (req, res, next) {
  let remoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let remoteAddrs = remoteAddr.split(':')[3].split('.')
  let adminId = req.body.admin_id
  let passwd = req.body.passwd

  remoteAddrs.pop()
  remoteAddrs.push('*')
  remoteAddr = remoteAddrs.join('.')

  if (!adminId || !passwd) {
    return res.send('admin_id and passwd required')
  }
  passwd = md5(md5(passwd))

  req.app.get('db000').getConnection(
    function selectAccess (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [remoteAddr, 'N'],
        function selectAdmin (err, rows, fields) {
          if (err) { return res.send(err.message) }
          if (rows.length === 0) { return res.send('access denied') }

          dbConn.query('SELECT admin_id FROM admin WHERE admin_id = ? AND passwd = ? AND is_deleted = ?', [adminId, passwd, 'N'],
            function doResponse (err, rows, fields) {
              dbConn.release()
              if (err) { return res.send(err.message) }
              if (rows.length === 0) { return res.send('login failed') }

              req.session.admin_id = adminId
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
