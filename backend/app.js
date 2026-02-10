const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const httpErr = require('http-errors')
require('dotenv').config()

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('connect-history-api-fallback')())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/tiles', express.static(path.join(__dirname, 'tileset')))
app.use('/trenchmap', express.static(path.join(__dirname, 'trenchmap')))
app.use('/districtmap', require('./apis/districtmap/router')(express.static, express.Router, httpErr))
app.use('/doubt', require('./apis/doubt/router')(express.Router, httpErr))
app.use('/iuu', require('./apis/iuu/router')(express.Router, httpErr))
app.use('/tracing', require('./apis/tracing/router')(express.Router, httpErr))

module.exports = app
