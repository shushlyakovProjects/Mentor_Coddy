<template>
    <header>
        <h2 class="logo">Ментор CODDY</h2>
        <img src="../../../public/img/menu_white.svg" class="icon menu-burger" alt="Меню" title="Меню"
            @click="isOpenMenuBurger = !isOpenMenuBurger">

        <transition name="menuburget-mobile">
            <nav v-if="isOpenMenuBurger" class="nav-mobile" @click="isOpenMenuBurger=false">
                <router-link class="link" to="/mentor/feedback">Обратная связь</router-link>
                <router-link class="link" to="/mentor/mentee-summary">Сводка</router-link>
                <router-link class="link" to="/mentor/mentee-list">Менти</router-link>
                <router-link class="link" to="/mentor/users-list"
                    v-if="currentUser.Role == 'admin'">Пользователи</router-link>
                <router-link class="link" to="/mentor/lk">Профиль</router-link>
                <a class="link" @click.prevent="logout">Выйти</a>
            </nav>
        </transition>

        <nav class="nav-desktop">
            <router-link class="link" to="/mentor/feedback">Обратная связь</router-link>
            <router-link class="link" to="/mentor/mentee-summary">Сводка</router-link>
            <router-link class="link" to="/mentor/mentee-list">Менти</router-link>
            <router-link class="link" to="/mentor/users-list"
                v-if="currentUser.Role == 'admin'">Пользователи</router-link>
            <router-link class="link" to="/mentor/lk">Профиль</router-link>
            <a class="link" @click.prevent="logout">Выйти</a>
        </nav>
    </header>
</template>

<script>
export default {
    data() {
        return {
            isOpenMenuBurger: false,
        }
    },
    mounted() {
        document.addEventListener('click', (event) => {
            if (this.isOpenMenuBurger) {
                if (!event.target.closest('.nav-mobile') && !event.target.closest('.menu-burger')) {
                    this.isOpenMenuBurger = false
                }
            }
        })
    },
    props: ['currentUser'],
    methods: {
        logout() {
            document.cookie = 'ACCESS_TOKEN = ; max-age=-1 ; path=/'
            this.$store.dispatch('checkAuthorization', this.$router)
        },
    }
}
</script>

<style scoped>
@import "@/assets/css/header.css";
@import "@/assets/css/media/header_media.css";
</style>