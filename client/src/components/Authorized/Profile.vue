<template>
    <div>
        <main class="wrapper">
            <EditAdmin @closeAdminSettings="isOpenAdminSettings = false" v-if="isOpenAdminSettings"></EditAdmin>
            <EditProfile @closeProfileSettings="isOpenProfileSettings = false" v-if="isOpenProfileSettings"></EditProfile>

            <header>
                <h2>{{ getCurrentUser.LastName }} {{ getCurrentUser.FirstName }}</h2>
                <nav>
                    <img class="icon" src="../../../public/img/settings.svg" alt="Настройки"
                        title="Редактировать профиль" @click="this.isOpenAdminSettings = true"
                        v-if="getCurrentUser.Role == 'admin'">
                    <img class="icon" src="../../../public/img/settings.svg" alt="Настройки"
                        title="Редактировать профиль" @click="this.isOpenProfileSettings = true"
                        v-if="getCurrentUser.Role != 'admin'">
                    <!-- НАСТРОЙКИ НЕ АДМИНА -->
                </nav>
            </header>

            <div class="info1">
                <ul>
                    <li> <span>Роль</span><br>
                        {{ getCurrentUser.Role }}</li>
                    <li> <span>Номер телефона</span><br>
                        {{ getCurrentUser.Phone }}</li>
                    <li> <span>Email</span><br>
                        {{ getCurrentUser.Email }}</li>
                </ul>
            </div>
            <div class="info2"></div>


        </main>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EditAdmin from './EditAdmin.vue';
import EditProfile from './EditProfile.vue';

export default {
    components: { EditAdmin, EditProfile },
    data() {
        return {
            isOpenAdminSettings: false,
            isOpenProfileSettings: false,
        }
    },
    mounted() { this.$store.dispatch('checkAuthorization', this.$router) },
    computed: { ...mapGetters(['getCurrentUser']) },
}
</script>

<style scoped>
@import "@/assets/css/profile.css";
@import "@/assets/css/media/profile_media.css";
</style>