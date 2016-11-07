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
var db_000 = mysql.createPool(cfg.db_000)
var db_001 = mysql.createPool(cfg.db_001)
app.set('db_000', db_000)
app.set('db_001', db_001)

var redis = require('redis')
var rd_000 = redis.createClient(cfg.rd_000.port, cfg.rd_000.host)
var rd_001 = redis.createClient(cfg.rd_001.port, cfg.rd_001.host)
app.set('rd_000', rd_000)
app.set('rd_001', rd_001)

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
  db_000.end(function (err) {
  })

  db_001.end(function (err) {
  })

  rd_000.quit()
  rd_001.quit()
  
  server.close(function () {
    process.exit()
  });

  setTimeout(function () {
    process.exit()
  }, 10 * 1000);
}

process.on('SIGTERM', gracefulShutdown) // kill -15
process.on('SIGINT', gracefulShutdown) // Ctrl + c