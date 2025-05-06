// Основное хранилище
import axios from 'axios';

export default {
    actions: {
        async downloadSummaryFromDataBase(context) {
            context.commit('updateMessageSuccess', { info: 'Загрузка сводки...', isReady: false })
            await axios.post('/server/from-mentor/downloadSummaryFromDataBase')
                .then((result) => { context.commit('updatePreviousSummary', result.data) })
                .catch((error) => { console.log(error); context.commit('updateMessageError', error.response.data) })
        },
        async uploadToDataBaseForSummary(context, data) {
            if (data.period == 'weekly') { context.commit('updateMessageSuccess', { info: 'Начало недельного отсчета...', isReady: false }) }
            if (data.period == 'monthly') { context.commit('updateMessageSuccess', { info: 'Начало месячного отсчета...', isReady: false }) }

            await axios.post('/server/from-admin/uploadToDataBaseForSummary', { data })
                .then((result) => { context.commit('updateMessageSuccess', { info: 'Сводка загружена в базу успешно!', isReady: true }) })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
    },
    mutations: {
        updatePreviousSummary(state, newInfo) {
            state.PREVIOUS_SUMMARY_WEEKLY = newInfo.prev_summary_weekly[0]
            state.PREVIOUS_SUMMARY_MONTHLY = newInfo.prev_summary_monthly[0]
            this.commit('updateMessageSuccess', { info: 'Ежендельная сводка получена успешно!', isReady: true })
        },
        updateMessageError(state, info) {
            this.commit('updateMessageSuccess', { info: '', isReady: true })
            state.messages.error = info
            setTimeout(() => { state.messages.error = '' }, 3000)
        },
        updateMessageSuccess(state, { info, isReady }) {
            state.messages.success = info
            if (isReady) { setTimeout(() => { state.messages.success = '' }, 3000) }
        }
    },
    state: {
        PREVIOUS_SUMMARY_WEEKLY: [],
        PREVIOUS_SUMMARY_MONTHLY: [],

        messages: {
            error: '',
            success: ''
        },
    },
    getters: {
        getPreviousSummaryWeekly(state) { return state.PREVIOUS_SUMMARY_WEEKLY },
        getPreviousSummaryMonthly(state) { return state.PREVIOUS_SUMMARY_MONTHLY }
    }
}