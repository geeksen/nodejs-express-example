
'use strict'

let express = require('express')
let router = express.Router()
let md5 = require('md5')

router.get('/login', function (req, res, next) {
  let sRemoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let aRemoteAddrs = sRemoteAddr.split(':')[3].split('.')

  aRemoteAddrs.pop()
  aRemoteAddrs.push('*')
  sRemoteAddr = aRemoteAddrs.join('.')

  req.app.get('db000').getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [sRemoteAddr, 'N'],
        function (err, rows, fields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }
          if (rows.length === 0) { return res.releaseRender(dbConnShard, 'message', { message: 'access denied' }) }

          return res.releaseRender(dbConnShard, 'admin/login', { req: req })
        })
    })
})

router.post('/auth', function (req, res, next) {
  let sRemoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let aRemoteAddrs = sRemoteAddr.split(':')[3].split('.')

  aRemoteAddrs.pop()
  aRemoteAddrs.push('*')
  sRemoteAddr = aRemoteAddrs.join('.')

  if (!req.body.admin_id || !req.body.passwd) {
    return res.render('message', { message: 'admin_id and passwd required' })
  }

  req.app.get('db000').getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SELECT ip_addr FROM access WHERE ip_addr = ? AND is_deleted = ?', [sRemoteAddr, 'N'],
        function (err, rows, fields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }
          if (rows.length === 0) { return res.releaseRender(dbConnShard, 'message', { message: 'access denied' }) }

          dbConnShard.query('SELECT admin_id FROM admin WHERE admin_id = ? AND passwd = ? AND is_deleted = ?', [req.body.admin_id, md5(md5(req.body.passwd)), 'N'],
            function (err, rows, fields) {
              if (err) { return res.releaseSend(dbConnShard, err.message) }
              if (rows.length === 0) { return res.releaseRender(dbConnShard, 'message', { message: 'login failed' }) }

              req.session.admin_id = req.body.admin_id
              req.session.shard_key_num_for_test = 0
              req.session.shard_key_str_for_test = 0
              return res.releaseRedirect(dbConnShard, '/')
            })
        })
    })
})

router.get('/logout', function (req, res, next) {
  res.clearCookie('session')
  return res.redirect('/admin/login')
})

module.exports = router
