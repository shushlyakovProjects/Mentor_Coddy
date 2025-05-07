const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const connectionDB = require('./connectionDB')


const jwt = require('jsonwebtoken')
const { SECRET_ACCESS_KEY, CRM_URL, authkey_getTeachers, authkey_getEdUnits, authkey_googleTables } = require('../config')
const axios = require('axios')

// Проверка токена доступа
router.use((request, response, next) => {
    const token = request.cookies.ACCESS_TOKEN
    jwt.verify(token, SECRET_ACCESS_KEY, (error, decodeData) => {
        if (error) { response.status(401).send('Токен доступа недействителен') }
        else { request.dataFromChecking = decodeData; next() }
    })
})

router.post('/downloadFeedbackFromDatabase', async (request, response) => {
    console.log('Загрузка обратной связи с базы данных');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'moderator') {

        const SQL_QUERY = `SELECT * FROM feedbacks`

        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).json(result) }
        })

    } else { { response.status(403).send('Доступ запрещен') } }
})


router.post('/downloadSummaryFromDataBase', async (request, response) => {
    console.log('Загрузка предыдущей сводки...');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'moderator') {
        let ALL_SUMMARY = {
            prev_summary_weekly: null,
            prev_summary_monthly: null,
        }

        // Получение сводки сначала за неделю
        const SQL_QUERY_WEEKLY = `SELECT * FROM summary_weekly ORDER BY SummaryId DESC LIMIT 1`
        connectionDB.query(SQL_QUERY_WEEKLY, (err, result) => {
            if (err) { response.status(500).send('Ошибка базы данных') }
            else {
                ALL_SUMMARY.prev_summary_weekly = result

                // Если данные за неделю успешно получены, то получение за месяц
                const SQL_QUERY_MONTHLY = `SELECT * FROM summary_monthly ORDER BY DateOfUpdate DESC LIMIT 1`
                connectionDB.query(SQL_QUERY_MONTHLY, (err, result) => {
                    if (err) { response.status(500).send('Ошибка базы данных') }
                    else {
                        ALL_SUMMARY.prev_summary_monthly = result
                        response.status(200).json(ALL_SUMMARY)
                    }
                })
            }
        })
    } else { { response.status(403).send('Доступ запрещен') } }
})

router.post('/downloadEveryTrialLesson', async (request, response) => {
    console.log('Загрузка пробных уроков за полгода...');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'moderator') {

        const { IDs_MENTEES_LIST } = request.body

        const days = 180
        let dateFrom = new Date(new Date() - days * 24 * 60 * 60 * 1000)
        let dateTo = new Date()

        await axios.post(CRM_URL + `/GetEdUnits`, null, {
            params: { authkey: authkey_getEdUnits, dateFrom, dateTo, types: 'TrialLesson' }
        })
            .then((result) => {
                const ALL_UNITS = result.data.EdUnits

                // Фильтрация. Необходимы только те учебные единицы, которые принадлежат менти
                const ALL_TRIAL_BY_MENTEES_LIST = ALL_UNITS.filter((unit, index) => {
                    return IDs_MENTEES_LIST.includes(unit.ScheduleItems[0].TeacherId)
                })

                let TRIALS_LIST = new Map()
                ALL_TRIAL_BY_MENTEES_LIST.forEach((trial, index) => {
                    const TeacherId = trial.ScheduleItems[0].TeacherId
                    let oldValue = TRIALS_LIST.get(TeacherId)
                    if (oldValue == undefined) { oldValue = 0 }
                    else { oldValue++ }
                    TRIALS_LIST.set(TeacherId, oldValue)
                })

                TRIALS_LIST = Object.fromEntries(TRIALS_LIST)
                console.log(`Всего пробных занятий за ${days} дней: ${ALL_UNITS.length}`);
                console.log(`Пробнных занятий, проведенных менти: ${ALL_TRIAL_BY_MENTEES_LIST.length}!`);
                response.status(200).json({ TRIALS_LIST })
            })
            .catch((error) => {
                console.log(error);
                response.status(500).send('Ошибка получения данных')
            })
    } else { response.status(403).send('Доступ запрещен') }
})

// Загрузка менти
router.post('/downloadMenteeData', async (request, response) => {
    console.log('Загрузка менти...');
    const { Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'moderator') {
        // ЗАГРУЗКА МЕНТИ
        const startTime = performance.now()

        await axios.post(CRM_URL + `/GetTeachers`, null, { params: { authkey: authkey_getTeachers, take: 2000 } })
            .then(async (result) => {
                const TEACHERS_LIST = result.data.Teachers
                let MENTEES_LIST = []
                let UserIds_MENTEES_LIST = []

                // Очистка массива со всеми преподавателями, получение ТОЛЬКО МЕНТИ
                MENTEES_LIST = TEACHERS_LIST.filter((elem) => elem.Status == 'Под менторством')

                // Получение массива идентификаторов менти
                TEACHERS_LIST.forEach(element => { UserIds_MENTEES_LIST.push(element.Id) });

                console.log(`Получено ${TEACHERS_LIST.length} преподавателей`);
                console.log(`Из них ${MENTEES_LIST.length} находятся под менторством`);
                console.log('Попытка получения учебных единиц...');

                // ЗА ПОСЛЕДНЮЮ НЕДЕЛЮ
                let dateFrom = new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                let dateTo = new Date()

                // ЗАГРУЗКА УЧЕБНЫХ ЕДИНИЦ
                await axios.post(CRM_URL + `/GetEdUnits`, null, { params: { authkey: authkey_getEdUnits, dateFrom, dateTo } })
                    .then((result) => {
                        const ALL_UNITS = result.data.EdUnits

                        // Фильтрация. Необходимы только те учебные единицы, которые принадлежат менти
                        const ALL_UNITS_BY_MENTEES_LIST = ALL_UNITS.filter(unit => {
                            return UserIds_MENTEES_LIST.includes(unit.ScheduleItems[0].TeacherId)
                        })

                        let added_mentee = []
                        let excluded_mentee = []

                        const SQL_QUERY = `SELECT * FROM mentees`
                        connectionDB.query(SQL_QUERY, (err, result) => {
                            if (err) { response.status(500).send('Ошибка базы данных') }
                            else {
                                const menteeFromDataBase = result

                                // Перебор списка менти
                                MENTEES_LIST.forEach((mentee, index) => {

                                    // Объект для учета учебных единиц
                                    let info_mentee_units = {
                                        CountAllEdUnits: 0,
                                        CountTrialUnitsForWeek: 0,
                                        CountConstantUnits: 0,
                                    }

                                    // Определение новых менти
                                    mentee.PrevBrief = menteeFromDataBase.find((infoFromDB) => { return infoFromDB.MenteeId == mentee.Id })
                                    if (mentee.PrevBrief == undefined) { added_mentee.push(mentee) }
                                    if (mentee.PrevBrief != undefined) { menteeFromDataBase.splice(menteeFromDataBase.findIndex(menteeFromDB => menteeFromDB.MenteeId == mentee.Id), 1) }

                                    // Перебор всех учебных единиц, распределение по разным менти
                                    ALL_UNITS_BY_MENTEES_LIST.forEach((unit) => {
                                        const teacherUserIdOfUnit = unit.ScheduleItems[0].TeacherId
                                        if (teacherUserIdOfUnit == mentee.Id) {
                                            info_mentee_units.CountAllEdUnits++
                                            if (unit.Type == 'TrialLesson') { info_mentee_units.CountTrialUnitsForWeek++ }
                                            if (unit.Type != 'TrialLesson') { info_mentee_units.CountConstantUnits++ }
                                        }
                                    })

                                    mentee.InfoEdUnits = info_mentee_units

                                    if (index == MENTEES_LIST.length - 1) {
                                        // Определение выпущенных менти 
                                        excluded_mentee = menteeFromDataBase.filter(item => !added_mentee.includes(item))
                                        console.log('Учебные единицы получены успешно');
                                        const endTime = performance.now()
                                        console.log(`Call took ${endTime - startTime} milliseconds`)
                                        response.status(200).json({ MENTEES_LIST, added_mentee, excluded_mentee })
                                    }
                                })
                            }
                        })
                    })
                    .catch((error) => { response.status(523).send('API Hollihop недоступен') })
            })
            .catch((error) => { response.status(523).send('API Hollihop недоступен') })
    } else { response.status(403).send('Доступ запрещен') }
})

// Редактирование профиля
router.post('/edit-profile', (request, response) => {
    const { UserId, Role } = request.dataFromChecking
    const { Email, Password, Phone, FirstName, LastName } = request.body

    let SQL_QUERY = null

    if (Password) {
        const salt = bcrypt.genSaltSync(5) // Генерируем соль
        const hashPass = bcrypt.hashSync(Password, salt) // Хешируем пароль

        SQL_QUERY = `UPDATE users SET Email='${Email}', Password='${hashPass}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}' WHERE UserId='${UserId}'`

    }
    else { SQL_QUERY = `UPDATE users SET Email='${Email}', Phone='${Phone}', FirstName='${FirstName}', LastName='${LastName}' WHERE UserId='${UserId}'` }


    connectionDB.query(SQL_QUERY, (error, result) => {
        if (error) { response.status(500).send('Ошибка базы данных') }
        else { response.status(200).send('Данные обновлены успешно!') }
    })
})




module.exports = router