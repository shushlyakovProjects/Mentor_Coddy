// Основное хранилище
import axios from 'axios';

export default {
    actions: {
        async addNewUser(context, infoNewUser) {
            await axios.post('/server/from-admin/addNewUser', infoNewUser)
                .then((result) => { context.commit('updateMessageSuccess', { info: 'Пользователь добавлен успешно!', isReady: true }) })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async downloadUsers(context) {
            await axios.post('/server/from-admin/downloadUsers')
                .then((result) => { context.commit('updateUsersList', result.data) })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async editUser(context, infoSelectedUser) {
            // this.infoSelectedUser.user_id = this.selectedUser.user_id
            await axios.post('/server/from-admin/edit-user', infoSelectedUser)
                .then((result) => {
                    context.commit('updateMessageSuccess', { info: 'Пользователь изменен успешно!', isReady: true })
                    context.dispatch('downloadUsers')
                })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        async deleteUser(context, UserId) {
            await axios.post('/server/from-admin/deleteUser', { UserId })
                .then((result) => {
                    context.commit('updateMessageSuccess', { info: 'Пользователь удален успешно!', isReady: true })
                    context.dispatch('downloadUsers')
                })
                .catch((error) => { context.commit('updateMessageError', error.response.data) })
        },
        // Проверка на существование учетных записей
        async adminTest(context) {
            await axios.post('/server/testAdmin')
                .then((result) => {
                    console.log(result);
                })
                .catch((error) => {
                    if (error.status == 302) {
                        context.commit('updatePathToRegAdmin', error.response.data)
                    }
                })
        }
    },
    mutations: {
        updateUsersList(state, newData) {
            if (!state.USERS_LIST.length) { this.commit('updateMessageSuccess', { info: 'Пользователи получены!', isReady: true }) }
            state.USERS_LIST = newData
        },
        updatePathToRegAdmin(state, path) {
            state.pathToRegAdmin = path
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
        USERS_LIST: [],

        messages: {
            error: '',
            success: ''
        },

        pathToRegAdmin: ''
    },
    getters: {
        getUsersList(state) {
            return state.USERS_LIST
        },
        getPathToRegAdmin(state) {
            return state.pathToRegAdmin
        }
    }
}