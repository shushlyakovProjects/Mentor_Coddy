<template>
    <div class="adminSettings" @click="closeAdminSettings">

        <main class="wrapper">

            <header>
                <h2>Редактирование</h2>
                <img class="icon" src="../../../public/img/close.svg" alt="Закрыть" title="Закрыть настройки"
                    @click="closeAdminSettings">
            </header>

            <div class="settings">
                <div class="settings__item" v-for="(item, index) in infoCurrentUser">
                    <p>{{ index }}</p>
                    <input type="text" :placeholder="'Укажите ' + index" v-model="infoCurrentUser[index]">
                </div>

                <p>Дополнительная проверка на администратора?</p>

                <button @click="editAdmin">Обновить данные</button>
                <p class="small errorMessage">{{ messages.error }}</p>
                <p class="small successMessage">{{ messages.success }}</p>
            </div>

        </main>

    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            infoCurrentUser: {},
            hiddenFields: ['user_id', 'role'],
            messages: {
                error: '',
                success: ''
            }
        }
    },
    // Получение getter
    computed: { ...mapGetters(['getCurrentUser']) },
    // При переходе на компонент
    mounted() {
        window.addEventListener('keydown', this.closeAdminSettings, { once: true })
        this.downloadCurrentUser()
    },
    // При обновлении приложения
    watch: {
        getCurrentUser() { this.downloadCurrentUser() },
        'infoCurrentUser.Phone'() {
            let str = this.infoCurrentUser.Phone
            let rgx = /^(\+|\d)?(\d)*$/
            if (!rgx.test(str)) {
                this.infoCurrentUser.Phone = str.slice(0, -1)
            }
        }
    },
    methods: {
        closeAdminSettings(event) {
            if (event.key == 'Escape' || event.target.classList[0] == 'adminSettings' || event.target.alt == 'Закрыть') {
                this.$emit('closeAdminSettings');
                window.removeEventListener('keydown', this.closeAdminSettings, { once: true })
            }
        },
        downloadCurrentUser() {
            for (let key in this.getCurrentUser) {
                if (key == 'password') {
                    this.infoCurrentUser[key] = ''
                }
                else if (this.hiddenFields.indexOf(key) == -1) {
                    this.infoCurrentUser[key] = this.getCurrentUser[key]
                }
            }
        },
        async editAdmin() {
            // if (this.infoCurrentUser.password == '') { this.infoCurrentUser.password = this.getCurrentUser.password }
            await axios.post('/server/from-admin/edit-admin', this.infoCurrentUser)
                .then((result) => {
                    this.messages.error = ''
                    this.messages.success = 'Успешно'
                    this.$store.dispatch('checkAuthorization', this.$router)
                })
                .catch((error) => {
                    console.log(error);
                    this.messages.error = error.response.data
                    this.messages.success = ''
                })
        }
    },

}
</script>

<style scoped>
@import url(settings.css);

.adminSettings {
    position: fixed;
    z-index: 10;

    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: var(--color_background-5_grayTransparent);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
}
</style>