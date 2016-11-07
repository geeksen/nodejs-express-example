#!/usr/bin/env node

/**
 * Module dependencies.
 */

var cfg = require('../cfg')
var app = require('../app')
var debug = require('debug')('nodejs-express-example:server')
var http = require('http')

/**
 * Get port from environment and store in Express.
 */

var port = cfg.server.port // normalizePort(process.env.PORT || '3000')
app.set('port', port)

var mysql = require('mysql')
var db000 = mysql.createPool(cfg.db000)
var db001 = mysql.createPool(cfg.db001)
app.set('db_000', db000)
app.set('db_001', db001)

var redis = require('redis')
var rd000 = redis.createClient(cfg.rd000.port, cfg.rd000.host)
var rd001 = redis.createClient(cfg.rd001.port, cfg.rd001.host)
app.set('rd000', rd000)
app.set('rd001', rd001)

/**
 * Create HTTP server.
 */

var server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

/*
function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}
*/

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}

function gracefulShutdown () {
  db000.end()
  db001.end()

  rd000.quit()
  rd001.quit()

  server.close(function () {
    process.exit()
  })

  setTimeout(function () {
    process.exit()
  }, 10 * 1000)
}

process.on('SIGTERM', gracefulShutdown) // kill -15
process.on('SIGINT', gracefulShutdown) // Ctrl + c
