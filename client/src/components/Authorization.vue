<template>
    <div class="wrapper">
        <div class="window">
            <h2>Ментор CODDY</h2>

            <form @submit.prevent="authorization">
                <p class="small">Электронная почта</p>
                <input type="text" placeholder="Укажите Email" v-model="dataOfUser.Email" required>
                <p class="small">Пароль</p>
                <input type="Password" placeholder="Укажите пароль" v-model="dataOfUser.Password" required>

                <input type="submit" value="Авторизация">
            </form>

            <p class="small error_message">{{ messages.error }}</p>
            <p class="small success_message">{{ messages.success }}</p>

        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            dataOfUser: {
                Email: '',
                Password: ''
            },
            messages: {
                error: '',
                success: ''
            }
        }
    },
    mounted(){
        if(localStorage.Email){this.dataOfUser.Email = localStorage.Email}
    },
    methods: {
        async authorization() {
            await axios.post('/server/authorization', this.dataOfUser)
                .then((result) => {
                    this.messages.error = ''
                    this.messages.success = 'Успешно'
                    this.$router.push('/mentor/lk')
                    localStorage.setItem('Email', this.dataOfUser.Email)
                })
                .catch((error) => {
                    console.log(error);
                    this.messages.error = error.response.data
                    this.messages.success = ''
                })
        },
    },
}
</script>

<style scoped>
/* @import url(@/assets/css/auth&reg.css);
@import url(@/assets/css/media/auth&reg_media.css); */
@import "@/assets/css/auth&reg.css";
@import "@/assets/css/media/auth&reg_media.css";
</style>
