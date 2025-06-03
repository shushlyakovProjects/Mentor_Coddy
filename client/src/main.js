// Импорт основных библиотек
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Импорт vuex
import store from './store'

// Импорт компонентов
import Authorization from './components/Authorization.vue'
import Profile from './components/Authorized/Profile.vue'
import UsersList from './components/Authorized/UsersList.vue'
import MenteeList from './components/Authorized/MenteeList.vue'
import MenteeSummary from './components/Authorized/MenteeSummary.vue'
import Feedback from './components/Authorized/Feedback.vue'
import FeedbackForm from './components/NotAuthorized/FeedbackForm.vue'

// Подготовка маршрутов для vue-router
const routes = [
    { path: '/', component: Profile },
    { path: '/auth', component: Authorization },
    { path: '/mentor/lk', component: Profile },
    { path: '/mentor/users-list', component: UsersList },
    { path: '/mentor/mentee-list', component: MenteeList },
    { path: '/mentor/mentee-summary', component: MenteeSummary },
    { path: '/mentor/feedback', component: Feedback },
    { path: '/mentee/feedback', component: FeedbackForm },
]

// Создание маршрутизатора
const router = createRouter({
    history: createWebHistory(),
    routes
})

// Включение приложения
createApp(App)
    .use(store) // Подключение vuex-хранилища
    .use(router) // Подключение vue-router
    .mount('#app') // Монтирование приложения в тег div#app
