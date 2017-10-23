
'use strict'

let express = require('express')
let path = require('path')

let logger = require('morgan')

let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let cookieSession = require('cookie-session')

express.response.releaseRedirect = function (dbConn, url) {
  if (url === undefined) {
    return this.send('releaseRedirect : not enough params')
  }

  dbConn.release()
  return this.redirect(url)
}

express.response.releaseRender = function (dbConn, view, data) {
  if (view === undefine || data === undefined) {
    return this.send('releaseRender : not enough params')
  }

  dbConn.release()
  return this.render(view, data)
}

express.response.releaseSend = function (dbConn, message) {
  if (message === undefined) {
    return this.send('releaseSend : not enough params')
  }

  dbConn.release()
  return this.send(message)
}

let app = express()
app.disable('x-powered-by')


// view engine setup
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

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
