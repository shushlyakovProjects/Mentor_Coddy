const mysql = require('mysql') // Пакет для работы с mysql (БД)

// Устанавливаем соединение с базой данных
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_READER,
    password: process.env.DB_READER_PASSWORD
})

module.exports = connection