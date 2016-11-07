
var express = require('express')
var router = express.Router()

var async = require('async')

router.get('/show_databases', function (req, res, next) {
  var db = null

  async.waterfall([
    function (next) {
      return req.app.get('db000').getConnection(next)
    },
    function (db_, next) {
      db = db_
      return db.query('SHOW DATABASES', next)
    },
    function (rows, fields, next) {
      db.release()
      return res.render('mysql/show_databases', { req: req, rows: rows })
    }
  ],
    function (err) {
      if (db != null) {
        db.release()
      }
      return res.send(err.message)
    }
  )
})

router.get('/show_tables', function (req, res, next) {
  var db = null

  async.waterfall([
    function (next) {
      return req.app.get('db000').getConnection(next)
    },
    function (db_, next) {
      db = db_
      return db.query('SHOW TABLES IN ' + req.query.database, next)
    },
    function (rows, fields, next) {
      db.release()
      return res.render('mysql/show_tables', { req: req, rows: rows })
    }
  ],
    function (err) {
      if (db != null) {
        db.release()
      }
      return res.send(err.message)
    }
  )
})

router.get('/desc_table', function (req, res, next) {
  var db = null

  async.waterfall([
    function (next) {
      return req.app.get('db000').getConnection(next)
    },
    function (db_, next) {
      db = db_
      return db.query('DESC ' + req.query.database + '.' + req.query.table, next)
    },
    function (rows, fields, next) {
      db.release()
      return res.render('mysql/desc_table', { req: req, rows: rows })
    }
  ],
    function (err) {
      if (db != null) {
        db.release()
      }
      return res.send(err.message)
    }
  )
})

router.get('/select_limit', function (req, res, next) {
  var db = null
  var columns = []
  var keys = []

  async.waterfall([
    function (next) {
      return req.app.get('db000').getConnection(next)
    },
    function (db_, next) {
      db = db_
      return db.query('DESC ' + req.query.database + '.' + req.query.table, next)
    },
    function (rows, fields, next) {
      for (var i = 0; i < rows.length; ++i) {
        columns.push(rows[i].Field)
        if (['PRI', 'UNI'].indexOf(rows[i].Key) > -1) {
          keys.push(rows[i].Field)
        }
      }

      var offset = parseInt(req.query.offset)
      var rowCount = parseInt(req.query.row_count)

      return db.query('SELECT * FROM ' + req.query.database + '.' + req.query.table + ' LIMIT ?, ?', [offset, rowCount], next)
    },

    function (rows, fields, next) {
      db.release()
      return res.render('mysql/select_limit', { req: req, columns: columns, keys: keys, rows: rows })
    }
  ],
    function (err) {
      if (db != null) {
        db.release()
      }
      return res.send(err.message)
    }
  )
})

router.get('/select_form', function (req, res, next) {
  res.render('mysql/select_form', { req: req })
})

router.get('/select_where', function (req, res, next) {
  var db = null
  var columns = []
  var keys = []

  async.waterfall([
    function (next) {
      return req.app.get('db000').getConnection(next)
    },
    function (db_, next) {
      db = db_
      return db.query('DESC ' + req.query.database + '.' + req.query.table, next)
    },
    function (rows, fields, next) {
      for (var i = 0; i < rows.length; ++i) {
        columns.push(rows[i].Field)
        if (['PRI', 'UNI'].indexOf(rows[i].Key) > -1) {
          keys.push(rows[i].Field)
        }
      }

      return db.query('SELECT * FROM ' + req.query.database + '.' + req.query.table + ' WHERE ' + req.query.key + ' = ? LIMIT 0, 1', [req.query.value], next)
    },
    function (rows, fields, next) {
      db.release()

      if (rows.length === 0) {
        return res.render('message', { message: 'not found' })
      }

      return res.render('mysql/select_where', { req: req, columns: columns, keys: keys, rows: rows })
    }
  ],
    function (err) {
      if (db != null) {
        db.release()
      }
      return res.send(err.message)
    }
  )
})

module.exports = router
