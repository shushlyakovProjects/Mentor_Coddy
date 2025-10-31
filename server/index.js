// Подключение основных библиотек
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')

// Импорт внешних контроллеров
require('dotenv').config()
const { registration } = require('./controllers/registration')
const { authorization } = require('./controllers/authorization')
const adminController = require('./controllers/fromAdmin')
const mentorController = require('./controllers/fromMentor')
const menteeController = require('./controllers/fromMentee')
const log = require('./logs/log')

// Создание серверного приложения
const app = express()

// Middlewares - функии промежуточной обработки
app.use(express.static(path.join(__dirname, '../client/dist')))
app.use(express.json())
app.use(cookieParser())
app.use(log)

// Базовый запрос, отдача клиента после сборки
app.get('*', (request, response) => { response.sendFile(path.join(__dirname, '../client/dist/index.html')) })

// Перенаправление на внешние контроллеры
app.post('/server/registration', registration)
app.post('/server/authorization', authorization)
app.use('/server/from-admin', adminController)
app.use('/server/from-mentor', mentorController)
app.use('/server/from-mentee', menteeController)

// Старт серверного приложения
const PORT = process.env.SERVER_PORT
app.listen(PORT, () => { console.log(`Server is running on PORT: ${PORT}`); })