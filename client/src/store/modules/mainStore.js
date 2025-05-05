// Хранилище администратора
import axios from 'axios';

export default {
    actions: {
        async editProfile(context, infoCurrentUser) {
            await axios.post('/server/from-mentor/edit-profile', infoCurrentUser)
                .then((result) => {
                    context.commit('updateMessageSuccess', { info: 'Профиль изменен успешно!', isReady: true })
                })
                .catch((error) => {
                    context.commit('updateMessageError', error.response.data)
                })
        },
        async checkAuthorization(context, router) {
            await axios.post('/server/authorization')
                .then((result) => {
                    // console.log(result);
                    context.commit('updateCurrentUser', result.data[0])
                })
                .catch((error) => {
                    console.log(error);
                    document.cookie = 'ACCESS_TOKEN = ; max-age=-1 ; path=/'
                    context.commit('updateCurrentUser', {})
                    router.push('/auth')
                })
        }
    },
    mutations: {
        updateCurrentUser(state, result) {
            state.CURRENT_USER = result
        },
        updateMessageError(state, info) {
            state.messages.error = info
            setTimeout(() => { state.messages.error = '' }, 3000)
        },
        updateMessageSuccess(state, { info, isReady }) {
            state.messages.success = info
            if (isReady) { setTimeout(() => { state.messages.success = '' }, 3000) }
        },
    },
    state: {
        CURRENT_USER: {},

        messages: {
            error: '',
            success: ''
        },
    },
    getters: {
        getCurrentUser(state) {
            return state.CURRENT_USER
        }
    }
}