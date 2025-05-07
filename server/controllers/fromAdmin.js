const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const connectionDB = require('./connectionDB')

const jwt = require('jsonwebtoken')
const { SECRET_ACCESS_KEY } = require('../config')

function getDateNow() {
    const fullDate = new Date()
    const year = fullDate.getFullYear()
    const month = fullDate.getMonth() + 1 < 10 ? '0' + (fullDate.getMonth() + 1) : (fullDate.getMonth() + 1)
    const day = fullDate.getDate() < 10 ? '0' + fullDate.getDate() : fullDate.getDate()
    return `${day}-${month}-${year}`
}

// Проверка токена доступа
router.use((request, response, next) => {
    const token = request.cookies.ACCESS_TOKEN
    jwt.verify(token, SECRET_ACCESS_KEY, (error, decodeData) => {
        if (error) { response.status(401).send('Токен доступа недействителен') }
        else { request.dataFromChecking = decodeData; next() }
    })
})

// Только Администратор
router.post('/downloadUsers', (request, response) => {
    console.log('Загрузка пользователей...');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin') {
        const SQL_QUERY = `SELECT * FROM users`
        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).json(result) }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/addNewUser', (request, response) => {
    console.log('Добавление нового пользователя...');
    const { UserId, Role: currentRole } = request.dataFromChecking
    if (currentRole == 'admin') {

        const { Email, Password, Phone, FirstName, LastName, Role } = request.body
        const salt = bcrypt.genSaltSync(5) // Генерируем соль
        const hashPass = bcrypt.hashSync(Password, salt) // Хешируем пароль

        const SQL_QUERY = `INSERT INTO users (UserId, Email, Password, Phone, FirstName, LastName, Role) 
            VALUES (null, '${Email}', '${hashPass}', '${Phone}', '${FirstName}', '${LastName}', '${Role}')`
        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) {
                if (error.sqlMessage.includes('Duplicate')) { response.status(409).send('Данный Email уже занят') }
                else { response.status(500).send('Ошибка базы данных') }
            }
            else { response.status(200).send('Пользователь добавлен') }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/edit-user', (request, response) => {
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin') {
        const { UserId, Email, Password, Phone, FirstName, LastName, Role } = request.body

        if (UserId == 1) { response.status(403).send('Доступ запрещен!') }
        let SQL_QUERY = null

        if (Password) {
            const salt = bcrypt.genSaltSync(5) // Генерируем соль
            const hashPass = bcrypt.hashSync(Password, salt) // Хешируем пароль

            SQL_QUERY = `UPDATE users SET Email='${Email}', Password='${hashPass}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}', Role='${Role}' WHERE UserId='${UserId}'`
        }
        else { SQL_QUERY = `UPDATE users SET Email='${Email}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}', Role='${Role}' WHERE UserId='${UserId}'` }

        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) {
                if (error.sqlMessage.includes('Duplicate')) { response.status(409).send('Данный Email уже занят') }
                else { response.status(500).send('Ошибка базы данных') }
            }
            else { response.status(200).send('Данные обновлены успешно!') }
        })
    } else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/deleteUser', (request, response) => {
    console.log('Удаление пользователя...');
    const { Role } = request.dataFromChecking
    const { UserId } = request.body
    if (UserId == 1) { response.status(403).send('Доступ запрещен!') } // Запрет удаление админа №1
    if (Role == 'admin') {
        const SQL_QUERY = `DELETE FROM users WHERE UserId='${UserId}'`
        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).send('Пользователь удален успешно!') }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/edit-admin', (request, response) => {
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin') {
        const { Email, Password, Phone, FirstName, LastName } = request.body

        let SQL_QUERY = null

        if (Password) {
            const salt = bcrypt.genSaltSync(5) // Генерируем соль
            const hashPass = bcrypt.hashSync(Password, salt) // Хешируем пароль

            SQL_QUERY = `UPDATE users SET Email='${Email}', Password='${hashPass}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}' WHERE UserUserId='${UserId}'`
        }
        else { SQL_QUERY = `UPDATE users SET Email='${Email}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}' WHERE UserUserId='${UserId}'` }


        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).send('Данные обновлены успешно!') }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})



module.exports = router