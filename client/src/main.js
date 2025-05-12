import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import store from './store'

import Authorization from './components/Authorization.vue'
import Profile from './components/Authorized/Profile.vue'
import UsersList from './components/Authorized/UsersList.vue'
import MenteeList from './components/Authorized/MenteeList.vue'
import MenteeSummary from './components/Authorized/MenteeSummary.vue'
import Feedback from './components/Authorized/Feedback.vue'
import FeedbackForm from './components/NotAuthorized/FeedbackForm.vue'

// import EditAdmin from './components/EditAdmin.vue'
// import RegistrationAdmin from './components/RegistrationAdmin.vue'

const routes = [
    { path: '/', component: Profile },
    { path: '/auth', component: Authorization },
    { path: '/mentor/lk', component: Profile },
    { path: '/mentor/users-list', component: UsersList },
    { path: '/mentor/mentee-list', component: MenteeList },
    { path: '/mentor/mentee-summary', component: MenteeSummary },
    { path: '/mentor/feedback', component: Feedback },
    { path: '/mentee/feedback', component: FeedbackForm },
    // { path: '/mentor/edit-admin', component: EditAdmin },
    // { path: '/reg-admin', component: RegistrationAdmin },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App)
    .use(store)
    .use(router)
    .mount('#app')
