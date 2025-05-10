const bcrypt = require('bcryptjs')
const connectionDB = require('../database/connectDBwithAdmin')

function registration(request, response) {
    const SQL_QUERY = 'SELECT * FROM users'
    connectionDB.query(SQL_QUERY, (error, result) => {
        if (error) { response.status(500).send('Ошибка базы данных') }
        else {
            if (result.length == 0) {
                const { email, password, phone_number, first_name, last_name } = request.body

                const salt = bcrypt.genSaltSync(5) // Генерируем соль
                const hashPass = bcrypt.hashSync(password, salt) // Хешируем пароль


                const SQL_QUERY = `INSERT INTO users (user_id, email, password, phone_number, first_name, last_name, role, access_token)
                    VALUES (NULL, '${email}', '${hashPass}', '${phone_number}', '${first_name}','${last_name}', 'admin', 'null')`

                connectionDB.query(SQL_QUERY, (error, result) => {
                    if (error) { response.status(500).send('Ошибка базы данных') }
                    else { response.status(200).send('Регистрация прошла успешно') }
                })
            } else { response.status(403).send('Доступ запрещен') }
        }
    })
}

module.exports = { registration }