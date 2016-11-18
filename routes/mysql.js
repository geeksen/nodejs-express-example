
let express = require('express')
let router = express.Router()

router.get('/show_databases', function (req, res, next) {
  req.app.get('db000').getConnection(
    function showDatabases (err, dbConn) {
      if (err) {
        dbConn.release()
        res.send(err.message)
        return
      }

      dbConn.query('SHOW DATABASES',
        function renderPage (err, rows, fields) {
          dbConn.release()

          if (err) { res.send(err.message) }
          res.render('mysql/show_databases', { req: req, rows: rows })
        })
    })
})

router.get('/show_tables', function (req, res, next) {
  req.app.get('db000').getConnection(
    function showTables (err, dbConn) {
      if (err) {
        dbConn.release()
        res.send(err.message)
        return
      }

      dbConn.query('SHOW TABLES IN ' + req.query.database,
        function renderPage (err, rows, fields) {
          dbConn.release()

          if (err) { res.send(err.message) }
          res.render('mysql/show_tables', { req: req, rows: rows })
        })
    })
})

router.get('/desc_table', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) {
        dbConn.release()
        res.send(err.message)
        return
      }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function renderPage (err, rows, fields) {
          dbConn.release()

          if (err) { res.send(err.message) }
          res.render('mysql/desc_table', { req: req, rows: rows })
        })
    })
})

router.get('/select_limit', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) {
        dbConn.release()
        res.send(err.message)
        return
      }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function selectLimit (err, rows, fields) {
          if (err) { res.send(err.message) }

          let columns = []
          let keys = []
          for (let i = 0; i < rows.length; ++i) {
            columns.push(rows[i].Field)
            if (['PRI', 'UNI'].indexOf(rows[i].Key) > -1) {
              keys.push(rows[i].Fields)
            }
          }

          let offset = parseInt(req.query.offset)
          let rowCount = parseInt(req.query.row_count)
          dbConn.query('SELECT * FROM ' + req.query.database + '.' + req.query.table + ' LIMIT ?, ?', [offset, rowCount],
            function renderPage (err, rows, fields) {
              dbConn.release()

              if (err) { res.send(err.message) }
              res.render('mysql/select_limit', { req: req, columns: columns, keys: keys, rows: rows })
            })
        })
    })
})

router.get('/select_form', function (req, res, next) {
  res.render('mysql/select_form', { req: req })
})

router.get('/select_where', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) {
        dbConn.release()
        res.send(err.message)
        return
      }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function selectWhere (err, rows, fields) {
          if (err) { res.send(err.message) }

          let columns = []
          let keys = []
          for (let i = 0; i < rows.length; ++i) {
            columns.push(rows[i].Field)
            if (['PRI', 'UNI'].indexOf(rows[i].Key) > -1) {
              keys.push(rows[i].Fields)
            }
          }

          dbConn.query('SELECT * FROM ' + req.query.database + '.' + req.query.table + ' WHERE ' + req.query.key + ' = ? LIMIT 0, 1', [req.query.value],
            function renderPage (err, rows, fields) {
              dbConn.release()

              if (err) { res.send(err.message) }
              res.render('mysql/select_limit', { req: req, columns: columns, keys: keys, rows: rows })
            })
        })
    })
})

module.exports = router
