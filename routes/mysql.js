
'use strict'

let express = require('express')
let router = express.Router()

router.get('/show_databases', function (req, res, next) {
  req.app.get('db000').getConnection(
    function showDatabases (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW DATABASES',
        function doResponse (err, rows, fields) {
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
        function doResponse (err, result) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.redirect('/mysql/show_databases')
        })
    })
})

router.post('/drop_database', function (req, res, next) {
  req.app.get('db000').getConnection(
    function dropDatabase (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DROP DATABASE `' + req.body.database + '`',
        function doResponse (err, rows, fields) {
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

      dbConn.query('SHOW TABLES IN `' + req.query.database + '`',
        function doResponse (err, rows, fields) {
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

  if (req.body.num_of_columns < 2) {
    return res.render('message', { message: 'num_of_columns must be bigger than 1' })
  }

  if (req.body.num_of_columns === '' || parseInt(req.body.num_of_columns) === 0) {
    return res.render('message', { message: 'num_of_columns is required' })
  }

  req.app.get('db000').getConnection(
    function showTables (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('SHOW TABLES IN `' + req.body.database + '`',
        function doResponse (err, rows, fields) {
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
    return res.render('message', { message: 'number of types is not matched' })
  }

  if (req.body.name.length !== req.body.index.length) {
    return res.render('message', { message: 'number of indexes is not matched' })
  }

  if (req.body.name.length !== req.body.auto_increment.length) {
    return res.render('message', { message: 'number of auto_increments is not matched' })
  }

  req.app.get('db000').getConnection(
    function createTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      let columnsAndIndexes = []
      let primaryKeys = []
      let uniqueKeys = []
      let keys = []
      let autoIncrements = []

      for (let i = 0; i < req.body.name.length; ++i) {
        columnsAndIndexes.push('`' + req.body.name[i] + '` ' + req.body.type[i] + ' NOT NULL ' + req.body.auto_increment[i])

        if (req.body.index[i] === 'PRIMARY') {
          primaryKeys.push('`' + req.body.name[i] + '`')
        } else if (req.body.index[i] === 'UNIQUE') {
          uniqueKeys.push('`' + req.body.name[i] + '`')
        } else if (req.body.index[i] === 'INDEX') {
          keys.push('`' + req.body.name[i] + '`')
        }

        if (req.body.auto_increment[i] === 'AUTO_INCREMENT') {
          autoIncrements.push(req.body.auto_increment[i])
        }
      }

      if (primaryKeys.length > 0) {
        columnsAndIndexes.push('PRIMARY KEY (' + primaryKeys.join(',') + ')')
      }

      if (uniqueKeys.length > 0) {
        columnsAndIndexes.push('UNIQUE KEY ' + uniqueKeys[0] + ' (' + uniqueKeys.join(',') + ')')
      }

      if (keys.length > 0) {
        columnsAndIndexes.push('KEY ' + keys[0] + ' (' + keys.join(',') + ')')
      }

      if (autoIncrements.length > 1) {
        return res.render('message', { message: 'too many auto_increments' })
      }

      let sql = 'CREATE TABLE IF NOT EXISTS `' + req.body.database + '`.`' + req.body.table_name + '` ('
      sql += columnsAndIndexes.join(',\n')
      sql += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8'

      if (autoIncrements.length > 0) {
        sql += ' AUTO_INCREMENT=1'
      }

      dbConn.query(sql,
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.redirect('/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.post('/rename_table', function (req, res, next) {
  req.app.get('db000').getConnection(
    function renameTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('RENAME TABLE `' + req.body.database + '`.`' + req.body.table_name + '` TO `' + req.body.database + '`.`' + req.body.new_table_name + '`',
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.redirect('/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.post('/drop_table', function (req, res, next) {
  req.app.get('db000').getConnection(
    function dropTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DROP TABLE `' + req.body.database + '`.`' + req.body.table + '`',
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.redirect('/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.get('/desc_table', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.render('mysql/desc_table', { req: req, rows: rows })
        })
    })
})

router.get('/alter_form', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.render('mysql/alter_form', { req: req, rows: rows })
        })
    })
})

router.all('/alter_table', function (req, res, next) {
  let database = ''
  let table = ''
  let sql = 'ALTER TABLE `'

  if (req.query.add_primary === '1') {
    database = req.query.database
    table = req.query.table
    sql += req.query.database + '`.`' + req.query.table + '` ADD PRIMARY KEY(`' + req.query.field + '`)'
  } else if (req.query.drop_primary === '1') {
    database = req.query.database
    table = req.query.table
    sql += req.query.database + '`.`' + req.query.table + '` DROP PRIMARY KEY'
  } else if (req.query.add_unique === '1') {
    database = req.query.database
    table = req.query.table
    sql += req.query.database + '`.`' + req.query.table + '` ADD UNIQUE KEY(`' + req.query.field + '`)'
  } else if (req.query.add_index === '1') {
    database = req.query.database
    table = req.query.table
    sql += req.query.database + '`.`' + req.query.table + '` ADD INDEX(`' + req.query.field + '`)'
  } else if (req.query.drop_index === '1') {
    database = req.query.database
    table = req.query.table
    sql += req.query.database + '`.`' + req.query.table + '` DROP INDEX `' + req.query.field + '`'
  } else if (req.body.add_first === '1') {
    database = req.body.database
    table = req.body.table
    sql += req.body.database + '`.`' + req.body.table + '` ADD `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL FIRST'
  } else if (req.body.add_after === '1') {
    database = req.body.database
    table = req.body.table
    sql += req.body.database + '`.`' + req.body.table + '` ADD `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL AFTER `' + req.body.field + '`'
  } else if (req.body.change_column === '1') {
    database = req.body.database
    table = req.body.table
    sql += req.body.database + '`.`' + req.body.table + '` CHANGE `' + req.body.field + '` `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL'
  } else if (req.body.drop_column === '1') {
    database = req.body.database
    table = req.body.table
    sql += req.body.database + '`.`' + req.body.table + '` DROP `' + req.body.field + '`'
  }

  req.app.get('db000').getConnection(
    function alterTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query(sql,
        function doResponse (err, rows, fields) {
          dbConn.release()
          if (err) { return res.send(err.message) }

          return res.redirect('/mysql/alter_form?database=' + database + '&table=' + table)
        })
    })
})

router.get('/select_limit', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function selectLimit (err, columns, fields) {
          if (err) { return res.send(err.message) }

          let key = ''
          for (let i = 0; i < columns.length; ++i) {
            if (columns[i].Key === 'PRI') {
              key = columns[i].Field
              break
            }
          }

          let offset = parseInt(req.query.offset)
          let rowCount = parseInt(req.query.row_count)
          dbConn.query('SELECT * FROM `' + req.query.database + '`.`' + req.query.table + '` LIMIT ?, ?', [offset, rowCount],
            function doResponse (err, rows, fields) {
              dbConn.release()
              if (err) { return res.send(err.message) }

              return res.render('mysql/select_limit', { req: req, columns: columns, rows: rows, key: key })
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

      dbConn.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function selectWhere (err, columns, fields) {
          if (err) { return res.send(err.message) }

          let key = ''
          for (let i = 0; i < columns.length; ++i) {
            if (columns[i].Key === 'PRI') {
              key = columns[i].Field
              break
            }
          }

          dbConn.query('SELECT * FROM `' + req.query.database + '`.`' + req.query.table + '` WHERE `' + req.query.key + '` = ? LIMIT 0, 1', [req.query.value],
            function doResponse (err, rows, fields) {
              dbConn.release()
              if (err) { return res.send(err.message) }

              return res.render('mysql/select_limit', { req: req, columns: columns, rows: rows, key: key })
            })
        })
    })
})

router.post('/execute', function (req, res, next) {
  req.app.get('db000').getConnection(
    function descTable (err, dbConn) {
      if (err) { return res.send(err.message) }

      dbConn.query('DESC `' + req.body.database + '`.`' + req.body.table + '`',
        function execute (err, columns, fields) {
          if (err) { return res.send(err.message) }

          let key = ''
          let insertColumns = []
          let params = []
          let values = []
          let sql = ''

          if (req.body.insert === '1') {
            for (let i = 0; i < columns.length; ++i) {
              if (columns[i].Key === 'PRI') {
                key = columns[i].Field
              }

              if (columns[i].Extra === 'auto_increment') {
                continue
              }

              insertColumns.push(columns[i].Field)
              params.push('?')
              values.push(req.body[columns[i].Field])
            }

            sql += 'INSERT INTO `' + req.body.database + '`.`' + req.body.table + '`(`' + insertColumns.join('`, `') + '`) VALUES(' + params.join(', ') + ')'
          } else if (req.body.update === '1') {
            for (let i = 0; i < columns.length; ++i) {
              if (columns[i].Key === 'PRI') {
                key = columns[i].Field
              }

              params.push('`' + columns[i].Field + '` = ?')
              values.push(req.body[columns[i].Field])
            }
            values.push(req.body[key])

            sql += 'UPDATE `' + req.body.database + '`.`' + req.body.table + '` SET ' + params.join(', ') + ' WHERE `' + key + '` = ?'
          } else if (req.body.delete === '1') {
            for (let i = 0; i < columns.length; ++i) {
              if (columns[i].Key === 'PRI') {
                key = columns[i].Field
                break
              }
            }
            values.push(req.body[key])

            sql += 'DELETE FROM `' + req.body.database + '`.`' + req.body.table + '` WHERE `' + key + '` = ?'
          }

          // return res.send(sql)

          dbConn.query(sql, values,
            function doResponse (err, rows, fields) {
              dbConn.release()
              if (err) { return res.send(err.message) }

              return res.redirect('/mysql/select_limit?database=' + req.body.database + '&table=' + req.body.table + '&offset=0&row_count=10')
            })
        })
    })
})

module.exports = router
