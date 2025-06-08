const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { CronJob } = require('cron')
const connectDBwithMentor = require('../database/connectDBwithMentor')
const connectDBwithReader = require('../database/connectDBwithReader')


const jwt = require('jsonwebtoken')
const { SECRET_ACCESS_KEY, CRM_URL, authkey_getTeachers, authkey_getEdUnits } = process.env
const axios = require('axios')

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
        else {
            const findUserQuery = `SELECT * FROM users WHERE UserId = '${decodeData.UserId}'`
            connectDBwithMentor.query(findUserQuery, (err, result) => {
                if (err) { response.status(503).send('Ошибка базы при проверки авторизации') }
                else {
                    if (result.length == 0) { response.cookie('ACCESS_TOKEN', '', { maxAge: -1 }).status(401).send('Пользователь не существует в базе') }
                    else { request.dataFromChecking = decodeData; next() }
                }
            })
        }
    })
})


// Только ментор (+ Администратор)
router.post('/deleteCheckedFeedbackFromDatabase', (request, response) => {
    console.log('Удаление записей обратной связи...');
    const { Role } = request.dataFromChecking
    const { checkedList } = request.body
    if (Role == 'admin' || Role == 'mentor') {
        const SQL_QUERY = `DELETE FROM feedbacks WHERE FeedBackID IN (${checkedList})`
        connectDBwithMentor.query(SQL_QUERY, (error, result) => {
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
        const SQL_QUERY = `INSERT INTO ${table} (DateOfUpdate, CountOfMentee, СountOfNewTrials, 
                CountOfMenteeWithConstantUnits, CountOfConstantUnits, CountOfPaidModules) 
                VALUES ('${getDateNow()}', '${data.countOfMentee}','${data.countOfNewTrials}','${data.countOfMenteeWithConstantUnits}',
                '${data.countOfConstantUnits}','${data.countOfPaUserIdModules}')`

        connectDBwithMentor.query(SQL_QUERY, (error, result) => {
            if (error) {
                if (error.sqlMessage.includes('Duplicate')) { response.status(409).send('Данные сегодня уже загружались') }
                else { response.status(500).send('Ошибка базы данных') }
            }
            else {
                console.log('Сводка загружена успешно!');
                response.status(201).send('Сводка загружена в базу успешно!')
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
        connectDBwithMentor.query(GET_EXISTING_SQL_QUERY, (error, result) => {
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

                    connectDBwithMentor.query(SQL_QUERY, (error, result) => {
                        if (error) { response.status(500).send('Ошибка базы данных') }
                        else {
                            if (result.affectedRows > 0) { changedRows++; }

                            if (index == DATALIST_FORTRACKING.length - 1) {

                                if (UserIds_EXISTING_MENTEES.length) {
                                    const SQL_QUERY_FORDELETE = `DELETE FROM mentees WHERE MenteeId IN (${UserIds_EXISTING_MENTEES})`
                                    let deletedRows = 0
                                    connectDBwithMentor.query(SQL_QUERY_FORDELETE, (error, result) => {
                                        if (error) {
                                            console.log(error);
                                            response.status(500).send('Ошибка базы данных')
                                        }
                                        else {
                                            deletedRows = result.affectedRows
                                            response.status(201).send(`Обновлено записей: ${changedRows} Удалено записей: ${deletedRows}`)
                                        }
                                    })
                                } else {
                                    response.status(201).send(`Обновлено записей: ${changedRows}`)
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

router.post('/uploadCommentToDataBase', (request, response) => {
    console.log('Обновление комментария...');
    const { UserId, Role } = request.dataFromChecking
    const { MenteeId, Content, Color } = request.body

    if (Role == 'admin' || Role == 'mentor') {
        console.log(MenteeId, Content, Color);

        if (Content) {
            const SQL_QUERY_CHECK = `SELECT * FROM comments WHERE CommentMenteeId='${MenteeId}'`
            connectDBwithMentor.query(SQL_QUERY_CHECK, (err, result) => {
                if (err) { response.status(500).send('Ошибка базы данных') }
                else {
                    let SQL_QUERY = null

                    if (result.length == 0) {
                        SQL_QUERY = `INSERT INTO comments(CommentId, CommentMenteeId, CommentDate, CommentContent, CommentColor) 
                        VALUES(null, '${MenteeId}', '${new Date()}', '${Content}', '${Color}')`
                    } else {
                        SQL_QUERY = `UPDATE comments SET CommentDate='${new Date()}', CommentContent='${Content}', CommentColor='${Color}' 
                        WHERE CommentMenteeId='${MenteeId}'`
                    }
                    connectDBwithMentor.query(SQL_QUERY, (err, result) => {
                        if (err) { response.status(500).send('Ошибка при обновлении комментария!') }
                        else { response.status(201).send('Комментарий обновлен успешно!') }
                    })
                }
            })
        } else {
            SQL_QUERY = `DELETE FROM comments WHERE CommentMenteeId='${MenteeId}'`
            connectDBwithMentor.query(SQL_QUERY, (err, result) => {
                if (err) { response.status(500).send('Ошибка при удалении комментария!') }
                else { response.status(200).send('Комментарий удален успешно!') }
            })
        }

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
        connectDBwithReader.query(SQL_QUERY_WEEKLY, (err, result) => {
            if (err) { response.status(500).send('Ошибка базы данных') }
            else {
                ALL_SUMMARY.prev_summary_weekly = result

                // Если данные за неделю успешно получены, то получение за месяц
                const SQL_QUERY_MONTHLY = `SELECT * FROM summary_monthly ORDER BY DateOfUpdate DESC LIMIT 1`
                connectDBwithReader.query(SQL_QUERY_MONTHLY, (err, result) => {
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

        connectDBwithReader.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).json(result) }
        })

    } else { { response.status(403).send('Доступ запрещен') } }
})

router.post('/downloadMenteeData', async (request, response) => {
    console.log('Загрузка менти...');
    const { Role } = request.dataFromChecking
    if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {
        // ЗАГРУЗКА МЕНТИ
        const startTime = performance.now()

        // Получение всех преподавателей
        await axios.post(CRM_URL + `/GetTeachers`, null, { params: { authkey: authkey_getTeachers, take: 2000 } })
            .then(async (result) => {
                const TEACHERS_LIST = result.data.Teachers
                let MENTEES_LIST = []
                let UserIds_MENTEES_LIST = []

                // Очистка массива со всеми преподавателями, получение ТОЛЬКО МЕНТИ
                MENTEES_LIST = TEACHERS_LIST.filter((elem) => elem.Status == 'Под менторством')

                // Получение массива идентификаторов менти
                MENTEES_LIST.forEach(element => { UserIds_MENTEES_LIST.push(element.Id) });

                console.log(`Получено ${TEACHERS_LIST.length} преподавателей`);
                console.log(`Из них ${MENTEES_LIST.length} находятся под менторством`);
                console.log('Попытка получения учебных единиц...');

                // ЗА ПОСЛЕДНЮЮ НЕДЕЛЮ
                let dateFrom = new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                let dateTo = new Date()

                // ЗАГРУЗКА УЧЕБНЫХ ЕДИНИЦ ЗА НЕДЕЛЮ
                await axios.post(CRM_URL + `/GetEdUnits`, null, { params: { authkey: authkey_getEdUnits, dateFrom, dateTo } })
                    .then((result) => {
                        const ALL_UNITS = result.data.EdUnits

                        // Фильтрация. Необходимы только те учебные единицы, которые принадлежат менти
                        const ALL_UNITS_BY_MENTEES_LIST = new Set()
                        ALL_UNITS.forEach(unit => {
                            if (UserIds_MENTEES_LIST.includes(unit.ScheduleItems[0].TeacherId)) {
                                ALL_UNITS_BY_MENTEES_LIST.add({
                                    UnitId: unit.Id,
                                    Name: unit.Name,
                                    Type: unit.Type,
                                    Discipline: unit.Discipline,
                                    TeacherId: unit.ScheduleItems[0].TeacherId,
                                    TeacherName: unit.ScheduleItems[0].Teachers
                                })
                            }
                        })

                        // Maps для оптимального хранения показателей по ID преподавателей
                        const CountAllEdUnits = new Map()
                        const CountTrialUnitsForWeek = new Map()
                        const CountConstantUnits = new Map()

                        // Наполнение Maps
                        for (let unit of ALL_UNITS_BY_MENTEES_LIST) {
                            const MenteeId = unit.TeacherId
                            CountAllEdUnits.set(MenteeId, CountAllEdUnits.has(MenteeId) ? CountAllEdUnits.get(MenteeId) + 1 : 0)
                            if (unit.Type == 'TrialLesson') { CountTrialUnitsForWeek.set(MenteeId, CountTrialUnitsForWeek.has(MenteeId) ? CountTrialUnitsForWeek.get(MenteeId) + 1 : 0) }
                            if (unit.Type != 'TrialLesson') { CountConstantUnits.set(MenteeId, CountConstantUnits.has(MenteeId) ? CountConstantUnits.get(MenteeId) + 1 : 1) }
                        }


                        let added_mentee = []
                        let excluded_mentee = []

                        const SQL_QUERY = `SELECT * FROM mentees LEFT JOIN comments ON mentees.MenteeId=comments.CommentMenteeId UNION 
                            SELECT * FROM mentees RIGHT JOIN comments ON mentees.MenteeId=comments.CommentMenteeId;`

                        connectDBwithReader.query(SQL_QUERY, (err, result) => {
                            if (err) { response.status(500).send('Ошибка базы данных') }
                            else {
                                const menteeList_FromDataBase = result
                                // console.log(menteeList_FromDataBase);


                                // Перебор списка менти
                                MENTEES_LIST.forEach((mentee, index) => {
                                    const menteOne_FromDataBase = menteeList_FromDataBase.find((infoFromDB) => { return infoFromDB.MenteeId == mentee.Id || infoFromDB.CommentMenteeId == mentee.Id })

                                    // Объект для учета учебных единиц
                                    mentee.InfoEdUnits = {
                                        CountAllEdUnits: CountAllEdUnits.has(mentee.Id) ? CountAllEdUnits.get(mentee.Id) : 0,
                                        CountTrialUnitsForWeek: CountTrialUnitsForWeek.has(mentee.Id) ? CountTrialUnitsForWeek.get(mentee.Id) : 0,
                                        CountConstantUnits: CountConstantUnits.has(mentee.Id) ? CountConstantUnits.get(mentee.Id) : 0,
                                        CountTrialLessonsForSixMonths: menteOne_FromDataBase ? menteOne_FromDataBase.CountTrialLessonsForSixMonths : 0,
                                    }

                                    // Определение новых менти
                                    mentee.PrevBrief = menteOne_FromDataBase

                                    // Если менти не неопределен => удаляем его из списка менти
                                    if (menteOne_FromDataBase != undefined) { menteeList_FromDataBase.splice(menteeList_FromDataBase.findIndex(menteeFromDB => menteeFromDB.MenteeId == mentee.Id), 1) }
                                    // Если менти неопределен => он новенький и в БД его ещё нет. Отмечаем его как "Добавленного"
                                    if (menteOne_FromDataBase == undefined) {
                                        added_mentee.push(mentee)

                                        // ВОЗМОЖНО УБРАТЬ
                                        // menteOne_FromDataBase = menteeList_FromDataBase.find((infoFromDB) => { return infoFromDB.CommentMenteeId == mentee.Id })
                                    }



                                    if (index == MENTEES_LIST.length - 1) {
                                        // Определение выпущенных менти 
                                        excluded_mentee = menteeList_FromDataBase.filter(item => !added_mentee.includes(item) && item.MenteeId != null)
                                        console.log('Учебные единицы получены успешно');
                                        const endTime = performance.now()
                                        console.log(`Получение заняло ${(endTime - startTime).toFixed(3)} ms`)
                                        response.status(200).json({ MENTEES_LIST, added_mentee, excluded_mentee })
                                    }
                                })
                            }
                        })
                    })
                    .catch((error) => { response.status(503).send('API Hollihop недоступен') })
            })
            .catch((error) => { response.status(503).send('API Hollihop недоступен') })
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


        connectDBwithMentor.query(SQL_QUERY, (error, result) => {
            if (error) { response.status(500).send('Ошибка базы данных') }
            else { response.status(200).send('Данные обновлены успешно!') }
        })
    } else { response.status(403).send('Доступ запрещен') }
})


// Отправка запроса на получение списка учебных единиц за полгода
// Запрос необходим для сбора информации по пробным урокам и отработанным часам
const UpdateWorkHours = CronJob.from({
    // Обновление данных каждый день в 12:00 МСК
    cronTime: '0 0 12 * * *',
    onTick: async () => {
        // Получение данных за 180 дней
        const days = 180
        let dateFrom = new Date(new Date() - days * 24 * 60 * 60 * 1000)
        let dateTo = new Date()
        const startTime = performance.now()
        console.log('--- Плановое получение данных по учебным единицам...');

        connectDBwithMentor.query(`SELECT * FROM mentees`, async (error, result) => {
            if (error) { console.log('Ошибка при получении списка менти!') }
            else {
                const MENTEES_LIST = result // Список менти из базы
                const IDs_MENTEES_LIST = new Map() // Map с ID менти из базы
                MENTEES_LIST.forEach(mentee => IDs_MENTEES_LIST.set(mentee.MenteeId, 0))

                console.log(`Всего менти в БД: ${IDs_MENTEES_LIST.size}`);

                // Получение всех учебных единиц
                await axios.post(CRM_URL + `/GetEdUnits`, null, {
                    params: { authkey: authkey_getEdUnits, dateFrom, dateTo, queryDays: true }
                }).then((result) => {
                    const ALL_UNITS = result.data.EdUnits

                    // Фильтрация. Необходимы только ИНДИВИДУАЛЬНЫЕ УРОКИ, которые принадлежат менти
                    const ALL_INDIVIDLESSON_BY_MENTEES_LIST = ALL_UNITS.filter((unit, index) => {
                        return IDs_MENTEES_LIST.has(unit.ScheduleItems[0].TeacherId) && unit.Type != 'TrialLesson'
                    })

                    // Фильтрация. Необходимы только ПРОБНЫЕ УРОКИ, которые принадлежат менти
                    const ALL_TRIALLESSON_BY_MENTEES_LIST = ALL_UNITS.filter((unit, index) => {
                        return IDs_MENTEES_LIST.has(unit.ScheduleItems[0].TeacherId) && unit.Type == 'TrialLesson'
                    })

                    const ALL_FIRST_LESSONS = []
                    // Определение первого постоянного ученика
                    MENTEES_LIST.forEach(mentee => {
                        // if (mentee.DateOfFirstUnit == null) {
                        if (true) {
                            const FirstLesson = ALL_INDIVIDLESSON_BY_MENTEES_LIST.find(unit => {
                                return unit.ScheduleItems[0].TeacherId == mentee.MenteeId
                            })
                            if (FirstLesson != undefined) {
                                ALL_FIRST_LESSONS.push({
                                    MenteeId: mentee.MenteeId,
                                    DateOfFirstunitMentee: `${FirstLesson.ScheduleItems[0].BeginDate.split('-')[2]}-${FirstLesson.ScheduleItems[0].BeginDate.split('-')[1]}-${FirstLesson.ScheduleItems[0].BeginDate.split('-')[0]}`
                                })
                            }
                        }
                    })

                    // Расчет отработанных часов
                    const MenteeWorkHours = new Map()
                    ALL_INDIVIDLESSON_BY_MENTEES_LIST.forEach(unit => {
                        const MenteeId = unit.ScheduleItems[0].TeacherId
                        let AllMins = 0
                        unit.Days.forEach(day => {
                            AllMins += day.Minutes;
                        })
                        let WorkHours = +(AllMins / 60).toFixed(1)
                        const currentHours = MenteeWorkHours.has(MenteeId) ? +MenteeWorkHours.get(MenteeId) : 0;
                        MenteeWorkHours.set(MenteeId, (currentHours + WorkHours).toFixed(1))
                    })

                    // Расчет пробных занятий
                    const MenteeTrials = new Map()
                    ALL_TRIALLESSON_BY_MENTEES_LIST.forEach(unit => {
                        const MenteeId = unit.ScheduleItems[0].TeacherId
                        const currentTrials = MenteeTrials.has(MenteeId) ? +MenteeTrials.get(MenteeId) : 0;
                        MenteeTrials.set(MenteeId, currentTrials + 1)
                    })

                    // SQL запрос - обновляет поля WorkHours и CountTrialLessonsForSixMonths
                    let SQL_QUERY = `UPDATE mentees SET WorkHours = CASE`
                    for (let id of MenteeWorkHours.keys()) {
                        SQL_QUERY += ` WHEN MenteeId = ${id} THEN ${MenteeWorkHours.get(id)}`
                    }
                    SQL_QUERY += ' END,'
                    SQL_QUERY += `CountTrialLessonsForSixMonths = CASE`
                    for (let id of MenteeTrials.keys()) {
                        SQL_QUERY += ` WHEN MenteeId = ${id} THEN ${MenteeTrials.get(id)}`
                    }
                    if (ALL_FIRST_LESSONS.length) {
                        SQL_QUERY += ' END,'
                        SQL_QUERY += `DateOfFirstUnit = CASE`
                        for (let lesson of ALL_FIRST_LESSONS) {
                            SQL_QUERY += ` WHEN MenteeId = ${lesson.MenteeId} THEN '${lesson.DateOfFirstunitMentee}'`
                        }
                        SQL_QUERY += ' END;'
                    } else {
                        SQL_QUERY += ' END;'
                    }

                    // console.log(SQL_QUERY);


                    connectDBwithMentor.query(SQL_QUERY, (error, result) => {
                        if (error) {
                            // console.log(error);
                            console.log('Ошибка при плановом обновлении!')
                        }
                        else {
                            console.log('Часы обновлены');
                            const endTime = performance.now()
                            console.log(`Обновление потребовало ${(endTime - startTime).toFixed(3)} ms`)
                        }
                    })

                }).catch((error) => {
                    console.log('Ошибка при получении данных по учебным единицам \n' + error);
                })
            }
        })

    },
    runOnInit: false,
    start: true,
    timeZone: 'UTC+3'
})


module.exports = router



// Получение ПУ 180. Функция удалена 03.06.25

// router.post('/downloadEveryTrialLesson', async (request, response) => {
//     console.log('Загрузка пробных уроков за полгода...');
//     const { UserId, Role } = request.dataFromChecking
//     if (Role == 'admin' || Role == 'mentor' || Role == 'reader') {
//         const startTime = performance.now()

//         const { IDs_MENTEES_LIST } = request.body

//         const days = 180
//         let dateFrom = new Date(new Date() - days * 24 * 60 * 60 * 1000)
//         let dateTo = new Date()

//         await axios.post(CRM_URL + `/GetEdUnits`, null, {
//             params: { authkey: authkey_getEdUnits, dateFrom, dateTo, types: 'TrialLesson' }
//         })
//             .then((result) => {
//                 const ALL_UNITS = result.data.EdUnits

//                 // Фильтрация. Необходимы только те учебные единицы, которые принадлежат менти
//                 const ALL_TRIAL_BY_MENTEES_LIST = ALL_UNITS.filter((unit, index) => {
//                     return IDs_MENTEES_LIST.includes(unit.ScheduleItems[0].TeacherId)
//                 })

//                 let TRIALS_LIST = new Map()
//                 ALL_TRIAL_BY_MENTEES_LIST.forEach((trial, index) => {
//                     const TeacherId = trial.ScheduleItems[0].TeacherId
//                     let oldValue = TRIALS_LIST.get(TeacherId)
//                     if (oldValue == undefined) { oldValue = 0 }
//                     else { oldValue++ }
//                     TRIALS_LIST.set(TeacherId, oldValue)
//                 })

//                 TRIALS_LIST = Object.fromEntries(TRIALS_LIST)
//                 console.log(`Всего пробных занятий за ${days} дней: ${ALL_UNITS.length}`);
//                 console.log(`Пробных занятий менти: ${ALL_TRIAL_BY_MENTEES_LIST.length}!`);
//                 const endTime = performance.now()
//                 console.log(`Получение заняло ${(endTime - startTime).toFixed(3)} ms`)
//                 response.status(200).json({ TRIALS_LIST })
//             })
//             .catch((error) => {
//                 console.log(error);
//                 response.status(500).send('Ошибка получения данных')
//             })
//     } else { response.status(403).send('Доступ запрещен') }
// })