// Хранилище данных о преподавателях на испытательном сроке
import axios from 'axios';

export default {
    actions: {
        async downloadFeedbackFromDatabase(context) {
            if (context.state.FEEDBACK_LIST.length == 0) { this.commit('updateMessageSuccess', { info: 'Загрузка данных...', isReady: false }) }
            await axios.post('/server/from-mentor/downloadFeedbackFromDatabase')
                .then((result) => { context.commit('updateFeedbackList', result.data) })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async deleteCheckedFeedbackFromDatabase(context, checkedList) {
            await axios.post('/server/from-admin/deleteCheckedFeedbackFromDatabase', { checkedList })
                .then((result) => {
                    context.commit('updateMessageSuccess', { info: result.data, isReady: true })
                    this.dispatch('downloadFeedbackFromDatabase')
                })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async downloadMenteeData(context) {
            this.commit('updateMessageSuccess', { info: 'Загрузка данных...', isReady: false })
            await axios.post('/server/from-mentor/downloadMenteeData')
                .then((result) => {
                    // console.log(result);
                    context.commit('updateAddedMenteeList', result.data.added_mentee)
                    context.commit('updateExcludedMenteeList', result.data.excluded_mentee)
                    context.commit('updateMenteeList', result.data.MENTEES_LIST)
                })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async downloadEveryTrialLesson(context, MENTEE_LIST) {
            this.commit('updateMessageSuccess', { info: 'Загрузка ПУ...', isReady: false })
            const IDs_MENTEES_LIST = []
            MENTEE_LIST.forEach((item) => { IDs_MENTEES_LIST.push(item.Id) })
            await axios.post('/server/from-mentor/downloadEveryTrialLesson', { IDs_MENTEES_LIST })
                .then((result) => {
                    context.commit('updateMessageSuccess', 'Данные получены успешно!')
                    context.commit('addTrialLessonsToMenteeList', result.data.TRIALS_LIST)
                })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async uploadToDataBaseForTracking(context, MENTEE_LIST) {

            let DATALIST_FORTRACKING = []
            MENTEE_LIST.forEach((mentee, index) => {
                // Постоянные ученики, Пробные уроки, Завершенные модули
                const { Disciplines, FirstName, LastName, Id } = mentee
                const { CountAllEdUnits, CountConstantUnits, CountTrialUnitsForWeek, CountTrialLessonsForSixMonths } = mentee.InfoEdUnits
                let DATA_FORTRACKING = {
                    Id, LastName, FirstName, Disciplines, CountAllEdUnits,
                    CountConstantUnits, CountTrialUnitsForWeek, CountTrialLessonsForSixMonths
                }
                DATALIST_FORTRACKING.push(DATA_FORTRACKING)
            })

            await axios.post('/server/from-admin/uploadToDataBaseForTracking', { DATALIST_FORTRACKING })
                .then((result) => { context.commit('updateMessageSuccess', { info: result.data, isReady: true }) })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
    },
    mutations: {
        updateFeedbackList(state, newData) {
            if (state.FEEDBACK_LIST.length != newData.length) { this.commit('updateMessageSuccess', { info: 'Обратная связь получена успешно!', isReady: true }) }
            state.FEEDBACK_LIST = newData
        },
        updateMenteeList(state, newData) {
            state.MENTEE_LIST = newData
            state.MENTEE_LIST.forEach((mentee) => {
                mentee.Feedback = state.FEEDBACK_LIST.findLast((feedback) => feedback.FIO.includes(mentee.LastName))
            })
            this.commit('updateMessageSuccess', { info: 'Данные менти получены успешно!', isReady: true })
        },
        addTrialLessonsToMenteeList(state, TRIALS_LIST) {
            state.MENTEE_LIST.forEach(mentee => {
                mentee.InfoEdUnits.CountTrialLessonsForSixMonths = 0
                if (mentee.Id in TRIALS_LIST) {
                    for (let key in TRIALS_LIST) {
                        if (mentee.Id == key) {
                            mentee.InfoEdUnits.CountTrialLessonsForSixMonths = TRIALS_LIST[key]
                            continue
                        }
                    }
                }
            })
            this.commit('updateMessageSuccess', 'Данные по ПУ за полгода получены!')
            setTimeout(() => { state.messages.success = '' }, 3000)
        },
        updateMessageError(state, info) {
            state.messages.error = info
            setTimeout(() => { state.messages.error = '' }, 3000)
        },
        updateMessageSuccess(state, { info, isReady }) {
            state.messages.success = info
            if (isReady) { setTimeout(() => { state.messages.success = '' }, 3000) }
        },
        updateAddedMenteeList(state, newData) { state.ADDED_MENTEE_LIST = newData },
        updateExcludedMenteeList(state, newData) { state.EXCLUDED_MENTEE_LIST = newData },
    },
    state: {
        MENTEE_LIST: [],

        ADDED_MENTEE_LIST: [],
        EXCLUDED_MENTEE_LIST: [],

        FEEDBACK_LIST: [],

        messages: {
            error: '',
            success: ''
        },

        // Временная модель (для фильтра)
        menteesIsNotOfShushlyakov: ['Мосеечева', 'Селезнев', 'Зимарев', 'Халлыев', 'Куликов', 'Каллио', 'Николаева', 'Дудкин',
            'Юдин', 'Петрова', 'Тихонова', 'Валиуллин', 'Бочкарев', 'Рест', 'Саковых', 'Носков', 'Сарычева', 'Почестнев', 'Проданов']
    },
    getters: {
        getFeedbackList(state) { return state.FEEDBACK_LIST },
        getFeedbackListWithFiltres: (state) => (filtres) => {
            const { fioInclude, sortByDate, filterByDate } = filtres
            let filtredList = []

            filtredList = state.FEEDBACK_LIST.filter((elem) => {
                let check1 = elem.FIO.toLowerCase().includes(fioInclude.toLowerCase())

                let check2 = true
                if (filterByDate.from && filterByDate.to) {
                    check2 = new Date(elem.Date) >= new Date(filterByDate.from) && new Date(elem.Date) <= new Date(filterByDate.to)
                } else {
                    if (filterByDate.from) { check2 = new Date(elem.Date) >= new Date(filterByDate.from) }
                    if (filterByDate.to) { check2 = new Date(elem.Date) <= new Date(filterByDate.to) }
                }


                return check1 && check2
            })

            if (sortByDate == 'asc') { filtredList.sort((a, b) => new Date(b.Date) - new Date(a.Date)) }
            if (sortByDate == 'desc') { filtredList.sort((a, b) => new Date(a.Date) - new Date(b.Date)) }

            return filtredList
        },


        getMessages(state) { return state.messages },
        getAddedMenteeList(state) { return state.ADDED_MENTEE_LIST },
        getExcludedMenteeList(state) { return state.EXCLUDED_MENTEE_LIST },
        getMenteeList(state) { return state.MENTEE_LIST },
        getMenteeListWithFiltres: (state) => (filtres) => {
            const { feedbackDate, menteesOfShushlyakov, disciplines, fioInclude, workDays, sortOfEdUnits, sortOfWorkTime } = filtres
            let filtredList = []

            filtredList = state.MENTEE_LIST.filter((elem) => {
                let check1 = menteesOfShushlyakov ? !state.menteesIsNotOfShushlyakov.includes(elem.LastName) : state.menteesIsNotOfShushlyakov.includes(elem.LastName)
                let check2 = `${elem.LastName} ${elem.FirstName}`.toLowerCase().includes(fioInclude.toLowerCase())

                let workDaysValue = Math.round((new Date() - new Date(elem.Created)) / 1000 / 60 / 60 / 24)
                let check3 = workDaysValue >= workDays.min && workDaysValue <= workDays.max

                let check4 = elem.Disciplines != undefined ? elem.Disciplines.join(', ').includes(disciplines) : true


                let check5 = feedbackDate ? elem.Feedback != undefined ? new Date(elem.Feedback.Date) >= new Date(feedbackDate) : false : true

                return check1 && check2 && check3 && check4 && check5
            })

            if (sortOfEdUnits == 'asc') { filtredList.sort((a, b) => a.InfoEdUnits.CountAllEdUnits - b.InfoEdUnits.CountAllEdUnits) }
            if (sortOfEdUnits == 'desc') { filtredList.sort((a, b) => b.InfoEdUnits.CountAllEdUnits - a.InfoEdUnits.CountAllEdUnits) }


            if (sortOfWorkTime == 'asc') {
                filtredList.sort((a, b) => {
                    const date_a = new Date(a.Created)
                    const date_b = new Date(b.Created)
                    const now = new Date()
                    const numberWorkDays_a = Math.round((now - date_a) / 1000 / 60 / 60 / 24)
                    const numberWorkDays_b = Math.round((now - date_b) / 1000 / 60 / 60 / 24)

                    return numberWorkDays_a - numberWorkDays_b
                })
            }
            if (sortOfWorkTime == 'desc') {
                filtredList.sort((a, b) => {
                    const date_a = new Date(a.Created)
                    const date_b = new Date(b.Created)
                    const now = new Date()
                    const numberWorkDays_a = Math.round((now - date_a) / 1000 / 60 / 60 / 24)
                    const numberWorkDays_b = Math.round((now - date_b) / 1000 / 60 / 60 / 24)

                    return numberWorkDays_b - numberWorkDays_a
                })
            }

            // console.log(filtredList);

            return filtredList
        },
        getMenteeListOnlyShushlyakov(state) {
            const MenteeListOnlyShushlyakov = state.MENTEE_LIST.filter((mentee) => {
                return !state.menteesIsNotOfShushlyakov.includes(mentee.LastName)
            })
            return MenteeListOnlyShushlyakov
        }
    }
}