
let express = require('express')
let router = express.Router()

router.get('/show_databases', function (req, res, next) {
  req.app.get('db000').getConnection(
    function showDatabases (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW DATABASES',
        function resRender (err, rows, fields) {
          dbConn.release()

          if (err) { return res.send(err.message) }
          return res.render('mysql/show_databases', { req: req, rows: rows })
        })
    })
})

router.get('/database_form', function (req, res, next) {
  return res.render('mysql/database_form', { req: req })
})

router.post('/create_database', function (req, res, next) {
  if (req.body.database_name === '') {
    return res.render('message', { message: 'database_name is required' })
  }

  req.app.get('db000').getConnection(
    function createDatabase (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('CREATE DATABASE IF NOT EXISTS `' + req.body.database_name + '` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci',
        function resRedirect (err, result) {
          dbConn.release()

          if (err) { return res.send(err.message) }
          return res.redirect('/mysql/show_databases')
        })
    })
})

router.get('/show_tables', function (req, res, next) {
  req.app.get('db000').getConnection(
    function showTables (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW TABLES IN ' + req.query.database,
        function resRender (err, rows, fields) {
          dbConn.release()

          if (err) { return res.send(err.message) }
          return res.render('mysql/show_tables', { req: req, rows: rows })
        })
    })
})

router.get('/table_form', function (req, res, next) {
  return res.render('mysql/table_form', { req: req })
})

router.post('/columns_form', function (req, res, next) {
  if (req.body.table_name === '') {
    return res.render('message', { message: 'table_name is required' })
  }

  if (req.body.num_of_columns === '' || parseInt(req.body.num_of_columns) === 0) {
    return res.render('message', { message: 'num_of_columns is required' })
  }

  req.app.get('db000').getConnection(
    function showTables (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW TABLES IN ' + req.body.database,
        function resRender (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          for (let i = 0; i < rows.length; ++i) {
            if (req.body.table_name === rows[i]['Tables_in_' + req.body.database]) {
              return res.render('message', { message: 'table already exists' })
            }
          }

          return res.render('mysql/columns_form', { req: req })
        })
    })
})

router.post('/create_table', function (req, res, next) {
  if (req.body.name.length === 0) {
    return res.render('message', { message: 'columns are required' })
  }

  if (req.body.name.length !== req.body.type.length) {
    return res.render('message', { message: 'number of types are not matched' })
  }

  if (req.body.name.length !== req.body.index.length) {
    return res.render('message', { message: 'number of indexes are not matched' })
  }

  if (req.body.name.length !== req.body.auto_increment.length) {
    return res.render('message', { message: 'number of auto_increments are not matched' })
  }

  req.app.get('db000').getConnection(
    function showTables (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW TABLES IN ' + req.query.database,
        function resRender (err, rows, fields) {
          dbConn.release()

          if (err) { return res.send(err.message) }
          return res.render('mysql/show_tables', { req: req, rows: rows })
        })
    })
})

router.get('/desc_table', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function resRender (err, rows, fields) {
          dbConn.release()

          if (err) { return res.send(err.message) }
          return res.render('mysql/desc_table', { req: req, rows: rows })
        })
    })
})

router.get('/select_limit', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function selectLimit (err, rows, fields) {
          if (err) { return res.send(err.message) }

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
            function resRender (err, rows, fields) {
              dbConn.release()

              if (err) { return res.send(err.message) }
              return res.render('mysql/select_limit', { req: req, columns: columns, keys: keys, rows: rows })
            })
        })
    })
})

router.get('/select_form', function (req, res, next) {
  return res.render('mysql/select_form', { req: req })
})

router.get('/select_where', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC ' + req.query.database + '.' + req.query.table,
        function selectWhere (err, rows, fields) {
          if (err) { return res.send(err.message) }

          let columns = []
          let keys = []
          for (let i = 0; i < rows.length; ++i) {
            columns.push(rows[i].Field)
            if (['PRI', 'UNI'].indexOf(rows[i].Key) > -1) {
              keys.push(rows[i].Fields)
            }
          }

          dbConn.query('SELECT * FROM ' + req.query.database + '.' + req.query.table + ' WHERE ' + req.query.key + ' = ? LIMIT 0, 1', [req.query.value],
            function resRender (err, rows, fields) {
              dbConn.release()

              if (err) { return res.send(err.message) }
              return res.render('mysql/select_limit', { req: req, columns: columns, keys: keys, rows: rows })
            })
        })
    })
})

module.exports = router
