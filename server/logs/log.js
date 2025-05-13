const express = require('express')
const router = express.Router()
const morgan = require('morgan'); // Библиотека для логирования
const fs = require('fs') // Библиотека для работы с файловой системой сервера

const pathToInfolog = __dirname + '/info.log'
const pathToErrorslog = __dirname + '/errors.log'

const infoLogStream = fs.createWriteStream(pathToInfolog, { flags: 'a' });
const errorsLogStream = fs.createWriteStream(pathToErrorslog, { flags: 'a' });

// const connectDBwithAdmin = require('../database/connectDBwithAdmin')
// const connectDBwithMentor = require('../database/connectDBwithMentor')
// const connectDBwithReader = require('../database/connectDBwithReader')


morgan.token('myDate', (req, res) => { return new Date() })

morgan.token('myMessage', (req, res) => {
    // 200 - Успех
    // 201 - Создан новый ресурс
    // 302 - Переадресация
    // 401 - Требуется авторизация
    // 403 - Отказ доступа
    // 404 - Ресурс не найден
    // 409 - Конфликтное обращение (дублирование уникальной записи)
    // 500 - Внутренняя ошибка сервера
    // 501 - Запрос не реализован
    // 503 - Сервер временно недоступен по техническим причинам

    let message = ''

    switch (res.statusCode) {
        case 200:
            message = 'Успешная операция'
            break;
        case 201:
            message = 'Создан новый ресурс'
            break;
        case 302:
            message = 'Выполнена переадресация'
            break;
        case 401:
            message = 'Попытка доступа без авторизации'
            break;
        case 403:
            message = 'Доступ запрещен'
            break;
        case 404:
            message = 'Ресурс не найден'
            break;
        case 409:
            message = 'Конфликт вызван несоблюдением правил'
            break;
        case 500:
            message = 'Внутренняя ошибка базы данных'
            break;
        case 501:
            message = 'Запрос не реализован'
            break;
        case 503:
            message = 'Сервер временно недоступен по техническим причинам'
            break;


        default:
            message = 'Неизвестная ошибка'
            break;
    }

    return message
})

router.use((req, res, next) => {
    const currentNumberDay = new Date().getDate()
    const currentHour = new Date().getHours()

    const maxLines = 200 // МАКСИМАЛЬНОЕ КОЛИЧЕСТВО СТРОК В ЛОГ ФАЙЛАХ
    // const countForDelete = 100 // КОЛИЧЕСТВО УДАЛЯЕМЫХ СТРОК В ЛОГ ФАЙЛАХ
    const everyWhich = 3 // Каждый который день проверять?
    const hourToClear = 20 // Час чистки логов

    if (currentNumberDay % everyWhich == 0 && currentHour == hourToClear) {
        console.log('Проверка лог файлов...');

        // Проверка лог-инфо записей
        fs.readFile(pathToInfolog, 'utf-8', (error, data) => {
            if (error) { console.log('Ошибка чтения логов! ' + error); }
            else {
                const lines = data.split('\n');
                if (lines.length > maxLines) {
                    const newData = lines.slice(lines.length - maxLines).join('\n');
                    fs.writeFile(pathToInfolog, newData, 'utf8', (err) => {
                        if (error) { console.log('Ошибка чистки логов! ' + error); }
                        else { console.log('Старые логи удалены'); }
                    });
                }
            }
        })
        // Проверка лог-ошибки записей
        fs.readFile(pathToErrorslog, 'utf-8', (error, data) => {
            if (error) { console.log('Ошибка чтения логов! ' + error); }
            else {
                const lines = data.split('\n');
                if (lines.length > maxLines) {
                    const newData = lines.slice(countForDelete).join('\n');
                    fs.writeFile(pathToErrorslog, newData, 'utf8', (err) => {
                        if (error) { console.log('Ошибка чистки логов! ' + error); }
                        else { console.log('Старые логи удалены'); }
                    });
                }
            }
        })
    }
    next()
})

router.use(morgan(':status | :myMessage | ":url" | [Дата: :myDate] | :response-time ms |', { stream: infoLogStream, skip: (req, res) => { return res.statusCode >= 400 } }));
router.use(morgan(':status | :myMessage | ":url" | [Дата: :myDate] | :response-time ms | :remote-addr', { stream: errorsLogStream, skip: (req, res) => { return res.statusCode < 400 } }));

module.exports = router