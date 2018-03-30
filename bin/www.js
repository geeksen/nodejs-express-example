
'use strict'

/**
 * Module dependencies.
 */

let app = require('../app')
let debug = require('debug')('nodejs-express-example:server')
let http = require('http')

/**
 * Get port from environment and store in Express.
 */

let cfg = require('../cfg')
let port = process.env.PORT || cfg.server.port.toString()
app.set('port', parseInt(port))

/**
 * Create HTTP server.
 */

let server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  let sBind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(sBind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(sBind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  let addr = server.address()
  let sBind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + sBind)
}

function gracefulShutdown () {
  server.close(function () {
    process.exit()
  })

  setTimeout(function () {
    process.exit()
  }, 3 * 1000)
}

process.on('SIGTERM', gracefulShutdown) // kill -15
process.on('SIGINT', gracefulShutdown) // Ctrl + c
