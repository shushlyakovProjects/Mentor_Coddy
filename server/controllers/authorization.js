const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connectionDB = require('./connectionDB')

const { SECRET_ACCESS_KEY } = require('../config')

// Генерация токена доступа
function generateAccessToken(UserId, Role) {
    const payload = {
        UserId, Role
    }
    return jwt.sign(payload, SECRET_ACCESS_KEY)
}

function authorization(request, response) {
    // console.log('Авторизация...');

    if (request.cookies.ACCESS_TOKEN) {
        // Токен доступа обнаружен, значит пользователь уже проходил авторизацию
        const token = request.cookies.ACCESS_TOKEN

        // Проверяем действительность токена
        jwt.verify(token, SECRET_ACCESS_KEY, (error, decodeData) => {
            if (error) { response.status(401).send('Токен доступа недействителен') }
            else {
                // Достаем данные из токена
                const { UserId, Role } = decodeData
                if (Role == 'admin') {
                    const findUserQuery = `SELECT * FROM users WHERE UserId = '${UserId}'`
                    connectionDB.query(findUserQuery, (err, result) => {
                        if (err) { response.status(500).send('Пользователь не найден в базе') }
                        else { response.status(200).json(result) }
                    })
                } else {
                    const findUserQuery = `SELECT * FROM users WHERE UserId = '${UserId}'`
                    connectionDB.query(findUserQuery, (err, result) => {
                        if (err) { response.status(500).send('Пользователь не найден в базе') }
                        else { response.status(200).json(result) }
                    })
                }
            }
        })
    } else {
        // Авторизация впервые (токена нет!)
        // Достаем данные из запроса
        const { Email, Password } = request.body

        // Подготавливаем SQL-запрос на проверку существования пользователя
        const SQL_QUERY = `SELECT * FROM users WHERE Email = '${Email}'`

        // Запускаем запрос на проверку
        connectionDB.query(SQL_QUERY, (err, result) => {
            // Если ошибка, то отвечаем на клиент
            if (err) {
                // toLog('Ошибка базы данных. Блок авторизации', 'Error')
                // console.log('Database error! Occurred while authorization.');
                response.status(500).send('Ошибка базы данных')
            }
            // Если ошибок нет, идем дальше
            else {
                // Проверяем result. Если логин найден, то идентификация выполнена
                if (result.length > 0) {
                    // Идентификация выполнена! 
                    const candUserIdate = result[0]
                    // Проверка пароля
                    if (bcrypt.compareSync(Password, candUserIdate.Password)) {
                        // Аутентификация выполнена! 
                        const token = generateAccessToken(candUserIdate.UserId, candUserIdate.Role)
                        response.cookie('ACCESS_TOKEN', token, { maxAge: 18000000 }).status(200).json(candUserIdate)
                        // Авторизация выполнена! 
                    } else {
                        response.status(403).send('Пароль неверный')
                    }
                } else {
                    response.status(404).send('Пользователь с таким Email не найден')
                }
            }
        })
    }
}

module.exports = { authorization }