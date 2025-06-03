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



// app.get('/', (request, response) => { response.status(200).send(`<H1>Server is running on ${PORT}...</H1>`) })
// -----
// app.post('/testAdmin', (request, response) => {
//     console.log('Проверка существования пользователей');
//     const SQL_QUERY = 'SELECT * FROM users'
//     connectionDB.query(SQL_QUERY, (error, result) => {
//         if (error) {
//             console.log('Database error! Occurred while checking the admin. ');
//             response.status(500).send('Database error!')
//         }
//         else {
//             if (result.length == 0) {
//                 console.log('Moving to registration of a new administator...');
//                 response.status(302).send('/reg-admin')
//             }
//         }
//     })
// })
