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

// API 라우터 연결
app.use('/districtmap', require('./apis/districtmap/router')(express.static, express.Router, httpErr))
app.use('/vessel', require('./apis/vessel/router')(express.Router, httpErr))       // 💡 일반 선박 API
app.use('/services', require('./apis/services/router')(express.Router, httpErr))   // 💡 10대 VAMS 서비스 API

module.exports = app
