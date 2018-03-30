
'use strict'

let Type = require('../libs/type')

exports.sIP = function () {
  let sIP = this.ip

  let sXForwardedFor = this.headers['x-forwarded-for']
  if (Type.bIsUndef(sXForwardedFor)) {
    return sIP
  }

  let iIndex = sXForwardedFor.indexOf(',')
  if (iIndex === -1) {
    return sIP
  }

  return sXForwardedFor.substr(0, iIndex)
}

exports.releaseRedirect = function (dbConn, url) {
  dbConn.release()

  if (url === undefined) {
    return this.send('releaseRedirect : not enough params')
  }

  return this.redirect(url)
}

exports.releaseRender = function (dbConn, view, data) {
  dbConn.release()

  if (view === undefined) {
    return this.send('releaseRender : not enough params')
  }

  return this.render(view, data)
}

exports.releaseSend = function (dbConn, message) {
  dbConn.release()

  if (message === undefined) {
    return this.send('releaseSend : not enough params')
  }

  return this.send(message)
}

exports.closeJson = function (db, data) {
  db.close()

  if (Type.bIsUndef(data)) {
    return this.render('message', { message: 'closeJson: params not enough' })
  }

  return this.json(data)
}

exports.closeRedirect = function (db, sUrl) {
  db.close()

  if (Type.bIsUndef(sUrl)) {
    return this.render('message', { message: 'closeRedirect: params not enough' })
  }

  return this.redirect(sUrl)
}

exports.closeRender = function (db, view, data) {
  db.close()

  if (Type.bIsUndef(view)) {
    return this.render('message', { message: 'closeRender: params not enough' })
  }

  return this.render(view, data)
}

exports.closeSend = function (db, sMessage) {
  db.close()

  if (Type.bIsUndef(sMessage)) {
    return this.send('closeSend: not enough params')
  }

  return this.send(sMessage)
}

exports.notFound = function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
}

exports.errorHandler = function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
}
