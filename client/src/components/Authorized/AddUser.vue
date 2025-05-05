<template>
    <div class="addUser" @click="closeAddUser">

        <main class="wrapper">

            <header>
                <h2>Добавить пользователя</h2>
                <img class="icon" src="../../../public/img/close.svg" alt="Закрыть" title="Закрыть окно"
                    @click="closeAddUser">
            </header>

            <form class="fields" @submit.prevent="addNewUser">
                <div class="fields__item">
                    <p>Email</p>
                    <input type="email" placeholder="Укажите email" v-model="infoNewUser.Email" required>
                </div>
                <div class="fields__item">
                    <p>Пароль</p>
                    <input type="text" placeholder="Укажите пароль" v-model="infoNewUser.Password" required>
                </div>
                <div class="fields__item">
                    <p>Номер телефона</p>
                    <input type="text" placeholder="Укажите номер телефона" v-model="infoNewUser.Phone" required>
                </div>
                <div class="fields__item">
                    <p>Имя</p>
                    <input type="text" placeholder="Укажите имя" v-model="infoNewUser.FirstName" required>
                </div>
                <div class="fields__item">
                    <p>Фамилия</p>
                    <input type="text" placeholder="Укажите фамилию" v-model="infoNewUser.LastName" required>
                </div>
                <div class="fields__item">
                    <p>Роль</p>
                    <select placeholder="Укажите роль" v-model="infoNewUser.Role" required>
                        <option value="" selected disabled hidden>Укажите уровень доступа</option>
                        <option value="admin">Администратор</option>
                        <option value="moderator">Модератор</option>
                        <option value="mentor">Ментор</option>
                    </select>
                </div>

                <input type="submit" value="Добавить пользователя">

            </form>

        </main>

    </div>
</template>

<script>
export default {
    data() {
        return {
            infoNewUser: {
                Email: '',
                Password: '',
                Phone: '',
                FirstName: '',
                LastName: '',
                Role: ''
            },
        }
    },
    mounted() { window.addEventListener('keydown', this.closeAddUser, { once: true }) },
    watch: {
        'infoNewUser.Phone'() {
            let str = this.infoNewUser.Phone
            let rgx = /^(\+|\d)?(\d)*$/
            if (!rgx.test(str)) {
                this.infoNewUser.Phone = str.slice(0, -1)
            }
        }
    },
    methods: {
        closeAddUser(event) {
            if (event.key == 'Escape' || event.target.classList[0] == 'addUser' || event.target.alt == 'Закрыть') {
                this.$emit('closeAddUser');
                window.removeEventListener('keydown', this.closeAddUser, { once: true })
            }
        },
        async addNewUser() {
            await this.$store.dispatch('addNewUser', this.infoNewUser)
            await this.$store.dispatch('downloadUsers')
            this.$emit('closeAddUser');
        }
    },
}
</script>

<style scoped>
@import url(settings.css);

.addUser {
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