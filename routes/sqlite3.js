
'use strict'

let express = require('express')
let router = express.Router()

let fs = require('fs')
let sqlite3 = require('sqlite3').verbose()

router.get('/show_databases', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  fs.readdir('./sqlite3', function (err, aFiles) {
    let aDatabases = []

    let aFilenameSplit = []
    for (let i = 0; i < aFiles.length; ++i) {
      aFilenameSplit = aFiles[i].split('.')
      if (aFilenameSplit.pop() !== 'db') {
        continue
      }

      aDatabases.push(aFilenameSplit.join('.'))
    }

    return res.render('sqlite3/show_databases', { req: req, aDatabases: aDatabases })
  })
})

router.get('/database_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('sqlite3/database_form', { req: req })
})

router.post('/create_database', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  if (req.body.database_name === '') {
    return res.render('message', { message: 'database_name is required' })
  }

  let db = new sqlite3.Database(['./sqlite3/', req.body.database_name, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      return res.closeRedirect(db, '/sqlite3/show_databases')
    })
})

router.post('/drop_database', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  fs.unlink(['./sqlite3/', req.body.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      fs.unlink(['./sqlite3/', req.body.database, '.db-journal'].join(''),
        function (err) {
          if (err) { return res.redirect('/sqlite3/show_databases') }

          return res.redirect('/sqlite3/show_databases')
        })
    })
})

router.get('/show_tables', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.query.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }
      
      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('SELECT name FROM sqlite_master WHERE type = ?', ['table'],
            function (err, aRows) {
              if (err) { return res.closeSend(db, err) }

              return res.closeRender(db, 'sqlite3/show_tables', { req: req, aRows: aRows })
            })
        })
    })
})

router.get('/table_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('sqlite3/table_form', { req: req })
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

  let db = new sqlite3.Database(['./sqlite3/', req.query.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('SELECT name FROM sqlite_master WHERE type = ?', ['table'],
            function (err, aRows) {
              if (err) { return res.closeSend(db, err) }

              for (let i = 0; i < aRows.length; ++i) {
                if (req.body.table_name === aRows[i].name) {
                  return res.closeRender(db, 'message', { message: 'table already exists' })
                }
              }

              return res.closeRender(db, 'sqlite3/columns_form', { req: req })
            })
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

  if (req.body.name.length !== req.body.key.length) {
    return res.render('message', { message: 'number of keys is not matched' })
  }

  let getDefaultValue = function (sType) {
    if (sType.indexOf('int(') > -1) {
      return ' DEFAULT 0'
    } else if (sType === 'double') {
      return ' DEFAULT 0'
    } else if (sType === 'char(1)') {
      return " DEFAULT 'N'"
    } else if (sType === 'varchar(255)' || sType === 'text') {
      return " DEFAULT ''"
    } else if (sType === 'datetime') {
      return " DEFAULT '1970-01-01 00:00:00'"
    } else {
      return ''
    }
  }
  
  let db = new sqlite3.Database(['./sqlite3/', req.body.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          let aColumns = []
          let aPrimaryKeys = []

          for (let i = 0; i < req.body.name.length; ++i) {
            aColumns.push('`' + req.body.name[i] + '` ' + req.body.type[i] + ' NOT NULL' + getDefaultValue(req.body.type[i]))

            if (req.body.key[i] === 'PRIMARY') {
              aPrimaryKeys.push('`' + req.body.name[i] + '`')
            }
          }

          if (aPrimaryKeys.length > 0) {
            aColumns.push('PRIMARY KEY (' + aPrimaryKeys.join(',') + ')')
          }

          let sQuery = 'CREATE TABLE IF NOT EXISTS `' + req.body.table_name + '` ('
          sQuery += aColumns.join(',\n')
          sQuery += '\n)'

          // return res.closeSend(db, sQuery)

          db.run(sQuery,
            function (err) {
              if (err) { return res.closeSend(db, err) }

              return res.closeRedirect(db, '/sqlite3/show_tables?database=' + req.body.database)
            })
        })
    })
})

router.post('/rename_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.body.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.run('ALTER TABLE `' + req.body.table_name + '` RENAME TO `' + req.body.new_table_name + '`',
            function (err, aRows) {
              if (err) { return res.closeSend(db, err) }

              return res.closeRedirect(db, '/sqlite3/show_tables?database=' + req.body.database)
            })
        })
    })
})

router.post('/drop_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.body.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.run('DROP TABLE `' + req.body.table + '`',
            function (err, aRows) {
              if (err) { return res.closeSend(db, err) }

              return res.closeRedirect(db, '/sqlite3/show_tables?database=' + req.body.database)
            })
        })
    })
})

router.get('/desc_table', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.query.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('PRAGMA table_info(' + req.query.table + ')',
            function (err, aRows) {
              if (err) { return res.closeSend(db, err) }

              return res.closeRender(db, 'sqlite3/desc_table', { req: req, aRows: aRows })
            })
        })
    })
})

router.get('/select_limit', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.query.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('PRAGMA table_info(' + req.query.table + ')',
            function (err, aColumns) {
              if (err) { return res.closeSend(db, err) }

              db.all('SELECT rowid, * FROM `' + req.query.table + '` LIMIT ?, ?', [parseInt(req.query.offset), parseInt(req.query.row_count)],
                function (err, aRows) {
                  if (err) { return res.closeSend(db, err) }

                  return res.closeRender(db, 'sqlite3/select_limit', { req: req, aColumns: aColumns, aRows: aRows })
                })
            })
        })
    })
})

router.get('/select_form', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  return res.render('sqlite3/select_form', { req: req })
})

router.get('/select_where', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.query.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('PRAGMA table_info(' + req.query.table + ')',
            function (err, aColumns) {
              if (err) { return res.closeSend(db, err) }

              db.all('SELECT rowid, * FROM `' + req.query.table + '` WHERE `' + req.query.key + '` = ? LIMIT 0, 1', [req.query.value],
                function (err, aRows) {
                  if (err) { return res.closeSend(db, err) }

                  return res.closeRender(db, 'sqlite3/select_limit', { req: req, aColumns: aColumns, aRows: aRows })
                })
            })
        })
    })
})

router.post('/execute', function (req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin/login')
  }

  let db = new sqlite3.Database(['./sqlite3/', req.body.database, '.db'].join(''),
    function (err) {
      if (err) { return res.send(err) }

      db.run('PRAGMA journal_mode = PERSIST',
        function (err) {
          if (err) { return res.closeSend(db, err) }

          db.all('PRAGMA table_info(' + req.body.table + ')',
            function (err, aColumns) {
              if (err) { return res.closeSend(db, err) }
              
              let aInsertColumns = []
              let aParams = []
              let aValues = []
              let sQuery = ''

              if (req.body.insert === '1') {
                for (let i = 0; i < aColumns.length; ++i) {
                  aInsertColumns.push(aColumns[i].name)
                  aParams.push('?')
                  aValues.push(req.body[aColumns[i].name])
                }

                sQuery += 'INSERT INTO `' + req.body.table + '`(`' + aInsertColumns.join('`, `') + '`) VALUES(' + aParams.join(', ') + ')'
              } else if (req.body.update === '1') {
                for (let i = 0; i < aColumns.length; ++i) {
                  aParams.push('`' + aColumns[i].name + '` = ?')
                  aValues.push(req.body[aColumns[i].name])
                }
                aValues.push(req.body.rowid)

                sQuery += 'UPDATE `' + req.body.table + '` SET ' + aParams.join(', ') + ' WHERE `rowid` = ?'
              } else if (req.body.delete === '1') {
                aValues.push(req.body.rowid)

                sQuery += 'DELETE FROM `' + req.body.table + '` WHERE `rowid` = ?'
              }

              // return res.closeSend(db, sQuery)

              db.run(sQuery, aValues,
                function (err, aRows) {
                  if (err) { return res.closeSend(db, err) }

                  return res.closeRender(db, 'sqlite3/execute_query', { req: req })
                })
            })
        })
    })
})

module.exports = router
