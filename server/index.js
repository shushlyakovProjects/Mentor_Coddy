const express = require('express')
const cookieParser = require('cookie-parser')
require('dotenv').config()

// Импорт внешних модулей
const { registration } = require('./controllers/registration')
const { authorization } = require('./controllers/authorization')
const adminController = require('./controllers/fromAdmin')
const mentorController = require('./controllers/fromMentor')
const menteeController = require('./controllers/fromMentee')
const log = require('./logs/log')

const app = express()

// Middlewares
app.use(express.json()) // Для корректного чтения JSON
app.use(cookieParser()) // Для корректного чтения Cookies
app.use(log) // Логирование

// Перенаправление на внешние контроллеры
app.post('/registration', registration)
app.post('/authorization', authorization)
app.use('/from-admin', adminController)
app.use('/from-mentor', mentorController)
app.use('/from-mentee', menteeController)

// Базоый путь, индикатор активности
app.get('/', (request, response) => { response.status(200).send(`<H1>Server is running on ${PORT}...</H1>`) })


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


const PORT = process.env.SERVER_PORT
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})