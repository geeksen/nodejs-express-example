
'use strict'

let cfg = require('./cfg')
let extended = require('./libs/extended')

let express = require('express')
let path = require('path')
let logger = require('morgan')
let cookieSession = require('cookie-session')
let bodyParser = require('body-parser')
let aws = require('aws-sdk')

express.request.sIP = extended.sIP

express.response.closeRedirect = extended.closeRedirect
express.response.closeRender = extended.closeRender
express.response.closeSend = extended.closeSend

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
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/admin', require('./routes/admin'))
app.use('/mysql', require('./routes/mysql'))
app.use('/sqlite3', require('./routes/sqlite3'))
app.use('/board', require('./routes/board'))
app.use('/calendar', require('./routes/calendar'))
// app.use('/photo', require('./routes/photo'))
// app.use('/video', require('./routes/video'))

app.use(extended.notFound) // catch 404 and forward to error handler
app.use(extended.errorHandler) // error handler

module.exports = app
