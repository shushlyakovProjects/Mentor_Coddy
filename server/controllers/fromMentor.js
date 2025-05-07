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


// Только ментор (+ Администратор)
router.post('/deleteCheckedFeedbackFromDatabase', (request, response) => {
    console.log('Удаление записей обратной связи...');
    const { Role } = request.dataFromChecking
    const { checkedList } = request.body
    if (Role == 'admin' || Role == 'mentor') {
        console.log(checkedList);

        const SQL_QUERY = `DELETE FROM feedbacks WHERE FeedBackID IN (${checkedList})`
        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).send('Записи обратной связи удалены успешно!') }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/uploadToDataBaseForSummary', (request, response) => {
    console.log('Загрузка сводки в базу...');
    const { UserId, Role } = request.dataFromChecking
    const { data } = request.body

    if (Role == 'admin' || Role == 'mentor') {
        const table = data.period == 'weekly' ? 'summary_weekly' : 'summary_monthly'
        const SQL_QUERY = `INSERT INTO ${table} (DateOfUpdate, CountOfMentee, СountOfNewEdUnits, СountOfNewTrials, 
                CountOfMenteeWithConstantUnits, CountOfConstantUnits, CountOfPaidModules) 
                VALUES ('${getDateNow()}', '${data.countOfMentee}','${data.countOfNewEdUnits}','${data.countOfNewTrials}','${data.countOfMenteeWithConstantUnits}',
                '${data.countOfConstantUnits}','${data.countOfPaUserIdModules}')`

        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) {
                if (error.sqlMessage.includes('Duplicate')) { response.status(409).send('Данные сегодня уже загружались') }
                else { response.status(500).send('Ошибка базы данных') }
            }
            else {
                console.log('Сводка загружена успешно!');
                response.status(200).send('Сводка загружена в базу успешно!')
            }
        })

    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

router.post('/uploadToDataBaseForTracking', (request, response) => {
    console.log('Загрузка информации в базу...');
    const { UserId, Role } = request.dataFromChecking
    const { DATALIST_FORTRACKING } = request.body

    if (Role == 'admin' || Role == 'mentor') {

        // Определение UserId существующих преподавателей в базе
        let UserIds_EXISTING_MENTEES = []
        const GET_EXISTING_SQL_QUERY = 'SELECT * FROM mentees'
        connectionDB.query(GET_EXISTING_SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else {
                result.forEach(mentee => { UserIds_EXISTING_MENTEES.push(mentee.MenteeId) })

                // Перебор, определение, кого обновить, кого добавить
                let SQL_QUERY = ''
                let changedRows = 0

                DATALIST_FORTRACKING.forEach((mentee, index) => {
                    if (UserIds_EXISTING_MENTEES.includes(mentee.Id)) {
                        // Удаление ID из списка. Нужно для определения ID тех, кто вышел из-под менторства (они останутся нетронутыми)
                        UserIds_EXISTING_MENTEES = UserIds_EXISTING_MENTEES.filter(id => id != mentee.Id)
                        SQL_QUERY = `UPDATE mentees SET 
                        LastName='${mentee.LastName}', 
                        FirstName='${mentee.FirstName}',  
                        Disciplines='${mentee.Disciplines}', 
                        CountAllEdUnits='${mentee.CountAllEdUnits}', 
                        CountTrialUnitsForWeek='${mentee.CountTrialUnitsForWeek}', 
                        CountTrialLessonsForSixMonths='${mentee.CountTrialLessonsForSixMonths}', 
                        CountConstantUnits='${mentee.CountConstantUnits}',
                        LastUpdate='${getDateNow()}'
                        WHERE MenteeId='${mentee.Id}' AND 
                        (LastName<>'${mentee.LastName}' OR FirstName<>'${mentee.FirstName}' 
                        OR Disciplines<>'${mentee.Disciplines}' OR CountAllEdUnits<>'${mentee.CountAllEdUnits}' 
                        OR CountTrialUnitsForWeek<>'${mentee.CountTrialUnitsForWeek}' OR CountConstantUnits<>'${mentee.CountConstantUnits}'
                        OR CountTrialLessonsForSixMonths<>'${mentee.CountTrialLessonsForSixMonths}')`
                    } else {
                        // Удаление ID из списка. Нужно для определения ID тех, кто вышел из-под менторства (они останутся нетронутыми)
                        UserIds_EXISTING_MENTEES = UserIds_EXISTING_MENTEES.filter(id => id != mentee.Id)
                        SQL_QUERY = `INSERT INTO mentees (MenteeId, LastName, FirstName, Disciplines, CountAllEdUnits, 
                        CountTrialUnitsForWeek, CountTrialLessonsForSixMonths, CountConstantUnits, LastUpdate) 
                        VALUES ('${mentee.Id}', '${mentee.LastName}', '${mentee.FirstName}', '${mentee.Disciplines}', 
                        '${mentee.CountAllEdUnits}', '${mentee.CountTrialUnitsForWeek}', '${mentee.CountTrialLessonsForSixMonths}', 
                        '${mentee.CountConstantUnits}', '${getDateNow()}')`
                    }

                    connectionDB.query(SQL_QUERY, (error, result) => {
                        if (error) { response.status(500).send('Ошибка базы данных') }
                        else {
                            if (result.affectedRows > 0) { changedRows++; }

                            if (index == DATALIST_FORTRACKING.length - 1) {

                                if (UserIds_EXISTING_MENTEES.length) {
                                    const SQL_QUERY_FORDELETE = `DELETE FROM mentees WHERE MenteeId IN (${UserIds_EXISTING_MENTEES})`
                                    let deletedRows = 0
                                    connectionDB.query(SQL_QUERY_FORDELETE, (error, result) => {
                                        if (error) { response.status(500).send('Ошибка базы данных') }
                                        else {
                                            deletedRows = result.affectedRows
                                            response.status(200).send(`Обновлено записей: ${changedRows} Удалено записей: ${deletedRows}`)
                                        }
                                    })
                                } else {
                                    response.status(200).send(`Обновлено записей: ${changedRows}`)
                                }
                            }
                        }
                    })
                });
            }
        })
    }
    else {
        response.status(403).send('Доступ запрещен!')
    }
})

// Ментор и Читатель (+ Администратор)
router.post('/downloadSummaryFromDataBase', async (request, response) => {
    console.log('Загрузка предыдущей сводки...');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {
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

router.post('/downloadFeedbackFromDatabase', async (request, response) => {
    console.log('Загрузка обратной связи с базы данных');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {

        const SQL_QUERY = `SELECT * FROM feedbacks`

        connectionDB.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).json(result) }
        })

    } else { { response.status(403).send('Доступ запрещен') } }
})

router.post('/downloadEveryTrialLesson', async (request, response) => {
    console.log('Загрузка пробных уроков за полгода...');
    const { UserId, Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {

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

router.post('/downloadMenteeData', async (request, response) => {
    console.log('Загрузка менти...');
    const { Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {
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

router.post('/edit-profile', (request, response) => {
    const { UserId, Role } = request.dataFromChecking
    const { Email, Password, Phone, FirstName, LastName } = request.body

    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {
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
    } else { response.status(403).send('Доступ запрещен') }
})




module.exports = router