﻿
'use strict'

let express = require('express')
let router = express.Router()

let fs = require('fs')
let sqlite3 = require('sqlite3').verbose()

router.get('/show_databases', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  fs.readdir('./sqlite3', function (err, files) {
    return res.render(dbConnShard, 'sqlite3/show_databases', { req: req, aRows: aRows })
    return res.send(files)
  })

  /*
  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SHOW DATABASES',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRender(dbConnShard, 'mysql/show_databases', { req: req, aRows: aRows })
        })
    })
  */
})

router.get('/database_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('mysql/database_form', { req: req })
})

router.post('/create_database', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  if (req.body.database_name === '') {
    return res.render('message', { message: 'database_name is required' })
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('CREATE DATABASE IF NOT EXISTS `' + req.body.database_name + '` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci',
        function (err, result) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/show_databases')
        })
    })
})

router.post('/drop_database', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DROP DATABASE `' + req.body.database + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/show_databases')
        })
    })
})

router.get('/show_tables', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SHOW TABLES IN `' + req.query.database + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRender(dbConnShard, 'mysql/show_tables', { req: req, aRows: aRows })
        })
    })
})

router.get('/table_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('mysql/table_form', { req: req })
})

router.post('/columns_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  if (req.body.table_name === '') {
    return res.render('message', { message: 'table_name is required' })
  }

  if (req.body.num_of_columns < 2) {
    return res.render('message', { message: 'num_of_columns must be bigger than 1' })
  }

  if (req.body.num_of_columns === '' || parseInt(req.body.num_of_columns) === 0) {
    return res.render('message', { message: 'num_of_columns is required' })
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('SHOW TABLES IN `' + req.body.database + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          for (let i = 0; i < aRows.length; ++i) {
            if (req.body.table_name === aRows[i]['Tables_in_' + req.body.database]) {
              return res.releaseRender(dbConnShard, 'message', { message: 'table already exists' })
            }
          }

          return res.releaseRender(dbConnShard, 'mysql/columns_form', { req: req })
        })
    })
})

router.post('/create_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

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

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      let aColumnsAndIndexes = []
      let aPrimaryKeys = []
      let aUniqueKeys = []
      let aKeys = []
      let aAutoIncrements = []

      for (let i = 0; i < req.body.name.length; ++i) {
        aColumnsAndIndexes.push('`' + req.body.name[i] + '` ' + req.body.type[i] + ' NOT NULL ' + req.body.auto_increment[i])

        if (req.body.index[i] === 'PRIMARY') {
          aPrimaryKeys.push('`' + req.body.name[i] + '`')
        } else if (req.body.index[i] === 'UNIQUE') {
          aUniqueKeys.push('`' + req.body.name[i] + '`')
        } else if (req.body.index[i] === 'INDEX') {
          aKeys.push('`' + req.body.name[i] + '`')
        }

        if (req.body.auto_increment[i] === 'AUTO_INCREMENT') {
          aAutoIncrements.push(req.body.auto_increment[i])
        }
      }

      if (aPrimaryKeys.length > 0) {
        aColumnsAndIndexes.push('PRIMARY KEY (' + aPrimaryKeys.join(',') + ')')
      }

      if (aUniqueKeys.length > 0) {
        aColumnsAndIndexes.push('UNIQUE KEY ' + aUniqueKeys[0] + ' (' + aUniqueKeys.join(',') + ')')
      }

      if (aKeys.length > 0) {
        aColumnsAndIndexes.push('KEY ' + aKeys[0] + ' (' + aKeys.join(',') + ')')
      }

      if (aAutoIncrements.length > 1) {
        return res.render('message', { message: 'too many auto_increments' })
      }

      let sQuery = 'CREATE TABLE IF NOT EXISTS `' + req.body.database + '`.`' + req.body.table_name + '` ('
      sQuery += aColumnsAndIndexes.join(',\n')
      sQuery += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8'

      if (aAutoIncrements.length > 0) {
        sQuery += ' AUTO_INCREMENT=1'
      }

      dbConnShard.query(sQuery,
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.post('/rename_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('RENAME TABLE `' + req.body.database + '`.`' + req.body.table_name + '` TO `' + req.body.database + '`.`' + req.body.new_table_name + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.post('/drop_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DROP TABLE `' + req.body.database + '`.`' + req.body.table + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/show_tables?database=' + req.body.database)
        })
    })
})

router.get('/desc_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRender(dbConnShard, 'mysql/desc_table', { req: req, aRows: aRows })
        })
    })
})

router.get('/alter_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRender(dbConnShard, 'mysql/alter_form', { req: req, aRows: aRows })
        })
    })
})

router.all('/alter_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let sDatabase = ''
  let sTable = ''
  let sQuery = 'ALTER TABLE `'

  if (req.query.add_primary === '1') {
    sDatabase = req.query.database
    sTable = req.query.table
    sQuery += req.query.database + '`.`' + req.query.table + '` ADD PRIMARY KEY(`' + req.query.field + '`)'
  } else if (req.query.drop_primary === '1') {
    sDatabase = req.query.database
    sTable = req.query.table
    sQuery += req.query.database + '`.`' + req.query.table + '` DROP PRIMARY KEY'
  } else if (req.query.add_unique === '1') {
    sDatabase = req.query.database
    sTable = req.query.table
    sQuery += req.query.database + '`.`' + req.query.table + '` ADD UNIQUE KEY(`' + req.query.field + '`)'
  } else if (req.query.add_index === '1') {
    sDatabase = req.query.database
    sTable = req.query.table
    sQuery += req.query.database + '`.`' + req.query.table + '` ADD INDEX(`' + req.query.field + '`)'
  } else if (req.query.drop_index === '1') {
    sDatabase = req.query.database
    sTable = req.query.table
    sQuery += req.query.database + '`.`' + req.query.table + '` DROP INDEX `' + req.query.field + '`'
  } else if (req.body.add_first === '1') {
    sDatabase = req.body.database
    sTable = req.body.table
    sQuery += req.body.database + '`.`' + req.body.table + '` ADD `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL FIRST'
  } else if (req.body.add_after === '1') {
    sDatabase = req.body.database
    sTable = req.body.table
    sQuery += req.body.database + '`.`' + req.body.table + '` ADD `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL AFTER `' + req.body.field + '`'
  } else if (req.body.change_column === '1') {
    sDatabase = req.body.database
    sTable = req.body.table
    sQuery += req.body.database + '`.`' + req.body.table + '` CHANGE `' + req.body.field + '` `' + req.body.new_name + '` ' + req.body.new_type + ' NOT NULL'
  } else if (req.body.drop_column === '1') {
    sDatabase = req.body.database
    sTable = req.body.table
    sQuery += req.body.database + '`.`' + req.body.table + '` DROP `' + req.body.field + '`'
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query(sQuery,
        function (err, aRows, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          return res.releaseRedirect(dbConnShard, '/mysql/alter_form?database=' + sDatabase + '&table=' + sTable)
        })
    })
})

router.get('/select_limit', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function (err, aColumns, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          let sKey = ''
          for (let i = 0; i < aColumns.length; ++i) {
            if (aColumns[i].Key === 'PRI') {
              sKey = aColumns[i].Field
              break
            }
          }

          let iOffset = parseInt(req.query.offset)
          let iRowCount = parseInt(req.query.row_count)
          dbConnShard.query('SELECT * FROM `' + req.query.database + '`.`' + req.query.table + '` LIMIT ?, ?', [iOffset, iRowCount],
            function (err, aRows, aFields) {
              if (err) { return res.releaseSend(dbConnShard, err.message) }

              return res.releaseRender(dbConnShard, 'mysql/select_limit', { req: req, aColumns: aColumns, aRows: aRows, sKey: sKey })
            })
        })
    })
})

router.get('/select_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('mysql/select_form', { req: req })
})

router.get('/select_where', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DESC `' + req.query.database + '`.`' + req.query.table + '`',
        function (err, aColumns, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          let sKey = ''
          for (let i = 0; i < aColumns.length; ++i) {
            if (aColumns[i].Key === 'PRI') {
              sKey = aColumns[i].Field
              break
            }
          }

          dbConnShard.query('SELECT * FROM `' + req.query.database + '`.`' + req.query.table + '` WHERE `' + req.query.key + '` = ? LIMIT 0, 1', [req.query.value],
            function (err, aRows, aFields) {
              if (err) { return res.releaseSend(dbConnShard, err.message) }

              return res.releaseRender(dbConnShard, 'mysql/select_limit', { req: req, aColumns: aColumns, aRows: aRows, sKey: sKey })
            })
        })
    })
})

router.post('/execute', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  req.app.get(Shard.sByNum(req)).getConnection(
    function (err, dbConnShard) {
      if (err) { return res.send(err.message) }

      dbConnShard.query('DESC `' + req.body.database + '`.`' + req.body.table + '`',
        function (err, aColumns, aFields) {
          if (err) { return res.releaseSend(dbConnShard, err.message) }

          let sKey = ''
          let aInsertColumns = []
          let aParams = []
          let aValues = []
          let sQuery = ''

          if (req.body.insert === '1') {
            for (let i = 0; i < aColumns.length; ++i) {
              if (aColumns[i].Key === 'PRI') {
                sKey = aColumns[i].Field
              }

              if (aColumns[i].Extra === 'auto_increment') {
                continue
              }

              aInsertColumns.push(aColumns[i].Field)
              aParams.push('?')
              aValues.push(req.body[aColumns[i].Field])
            }

            sQuery += 'INSERT INTO `' + req.body.database + '`.`' + req.body.table + '`(`' + aInsertColumns.join('`, `') + '`) VALUES(' + aParams.join(', ') + ')'
          } else if (req.body.update === '1') {
            for (let i = 0; i < aColumns.length; ++i) {
              if (aColumns[i].Key === 'PRI') {
                sKey = aColumns[i].Field
              }

              aParams.push('`' + aColumns[i].Field + '` = ?')
              aValues.push(req.body[aColumns[i].Field])
            }
            aValues.push(req.body[sKey])

            sQuery += 'UPDATE `' + req.body.database + '`.`' + req.body.table + '` SET ' + aParams.join(', ') + ' WHERE `' + sKey + '` = ?'
          } else if (req.body.delete === '1') {
            for (let i = 0; i < aColumns.length; ++i) {
              if (aColumns[i].Key === 'PRI') {
                sKey = aColumns[i].Field
                break
              }
            }
            aValues.push(req.body[sKey])

            sQuery += 'DELETE FROM `' + req.body.database + '`.`' + req.body.table + '` WHERE `' + sKey + '` = ?'
          }

          // return res.releaseSend(dbConnShard, sQuery)

          dbConnShard.query(sQuery, aValues,
            function (err, aRows, aFields) {
              if (err) { return res.releaseSend(dbConnShard, err.message) }

              return res.releaseRedirect(dbConnShard, '/mysql/select_limit?database=' + req.body.database + '&table=' + req.body.table + '&offset=0&row_count=10')
            })
        })
    })
})

module.exports = router
