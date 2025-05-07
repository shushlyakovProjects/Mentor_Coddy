<template>
    <div class="userSettings" @click="closeUserSettings">

        <main class="wrapper">

            <header>
                <h2>Редактирование <br> пользователя</h2>
                <img class="icon" src="../../../public/img/close.svg" alt="Закрыть" title="Закрыть настройки"
                    @click="closeUserSettings">
            </header>

            <form class="fields" @submit.prevent="editUser">
                <div class="fields__item">
                    <p>Email</p>
                    <input type="email" placeholder="Укажите email" v-model="infoSelectedUser.Email">
                </div>
                <div class="fields__item">
                    <p>Пароль</p>
                    <input type="text" placeholder="Укажите пароль" v-model="infoSelectedUser.Password">
                </div>
                <div class="fields__item">
                    <p>Номер телефона</p>
                    <input type="text" placeholder="Укажите номер телефона" v-model="infoSelectedUser.Phone">
                </div>
                <div class="fields__item">
                    <p>Имя</p>
                    <input type="text" placeholder="Укажите имя" v-model="infoSelectedUser.FirstName">
                </div>
                <div class="fields__item">
                    <p>Фамилия</p>
                    <input type="text" placeholder="Укажите фамилию" v-model="infoSelectedUser.LastName">
                </div>
                <div class="fields__item">
                    <p>Роль</p>
                    <select v-model="infoSelectedUser.Role"> 
                        <option value="admin">Администратор</option>
                        <option value="mentor">Ментор</option>
                        <option value="reader">Читатель</option>
                    </select>
                </div>

                <input type="submit" value="Обновить пользователя">
                <p class="small errorMessage">{{ messages.error }}</p>
                <p class="small successMessage">{{ messages.success }}</p>
            </form>

        </main>

    </div>
</template>

<script>
export default {
    props: ['selectedUser'],
    data() {
        return {
            infoSelectedUser: {
                Email: '',
                Password: '',
                Phone: '',
                FirstName: '',
                LastName: '',
                Role: ''
            },
            hiddenFields: ['user_id'],
            messages: {
                error: '',
                success: ''
            }
        }
    },
    watch: {
        'infoSelectedUser.Phone'() {
            let str = this.infoSelectedUser.Phone
            let rgx = /^(\+|\d)?(\d)*$/
            if (!rgx.test(str)) {
                this.infoSelectedUser.Phone = str.slice(0, -1)
            }
        }
    },
    mounted() {
        window.addEventListener('keydown', this.closeUserSettings, { once: true })
        this.getFieldsCurrentUser()
    },
    methods: {
        closeUserSettings(event) {
            if (event.key == 'Escape' || event.target.classList[0] == 'userSettings' || event.target.alt == 'Закрыть') {
                this.$emit('closeUserSettings');
                window.removeEventListener('keydown', this.closeUserSettings, { once: true })
            }
        },
        getFieldsCurrentUser() {
            for (let key in this.selectedUser) {
                if (key == 'Password') {
                    this.infoSelectedUser[key] = ''
                }
                else if (this.hiddenFields.indexOf(key) == -1) {
                    this.infoSelectedUser[key] = this.selectedUser[key]
                }
            }
        },
        async editUser() {
            await this.$store.dispatch('editUser', this.infoSelectedUser)
            // await this.$store.dispatch('downloadUsers')
            this.$emit('closeUserSettings');
        }
    },

}
</script>

<style scoped>
@import url(settings.css);

.userSettings {
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