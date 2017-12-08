
'use strict'

let cfg = require('./cfg')
let express = require('express')
let path = require('path')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let cookieSession = require('cookie-session')
let bodyParser = require('body-parser')
let aws = require('aws-sdk')

express.response.releaseRedirect = function (dbConn, url) {
  dbConn.release()

  if (url === undefined) {
    return this.send('releaseRedirect : not enough params')
  }

  return this.redirect(url)
}

express.response.releaseRender = function (dbConn, view, data) {
  dbConn.release()

  if (view === undefined) {
    return this.send('releaseRender : not enough params')
  }

  return this.render(view, data)
}

express.response.releaseSend = function (dbConn, message) {
  dbConn.release()

  if (message === undefined) {
    return this.send('releaseSend : not enough params')
  }

  return this.send(message)
}

let app = express()
app.disable('x-powered-by')
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

app.set('cfg', cfg)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

let mysql = require('mysql')
let db000 = mysql.createPool(cfg.db000)
let db001 = mysql.createPool(cfg.db001)
app.set('db000', db000)
app.set('db001', db001)

/*
let redis = require('redis')
let rd000 = redis.createClient(cfg.rd000.port, cfg.rd000.host)
let rd001 = redis.createClient(cfg.rd001.port, cfg.rd001.host)
app.set('rd000', rd000)
app.set('rd001', rd001)
*/

aws.config.update({
    region: cfg.aws.region_name,
    endpoint: cfg.dynamodb.endpoint_url
})

let ddbTable = new aws.DynamoDB()
app.set('ddbTable', ddbTable)

let ddbItem = new aws.DynamoDB.DocumentClient()
app.set('ddbItem', ddbItem)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/admin', require('./routes/admin'))
app.use('/mysql', require('./routes/mysql'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
