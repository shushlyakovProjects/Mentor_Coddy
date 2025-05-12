<template>
    <div>
        <main class="wrapper">
            <AddUser @closeAddUser="isOpenAddUser = false" v-if="isOpenAddUser"></AddUser>
            <EditUser @closeUserSettings="isOpenUserSettings = false" @downloadUsers="downloadUsers"
                v-if="isOpenUserSettings" :selectedUser="this.selectedUser"></EditUser>

            <header>
                <h2>Пользователи</h2>
                <nav>
                    <img class="icon" src="../../../public/img/useradd.svg" alt="Добавить пользователя"
                        title="Добавить пользователя" @click="this.isOpenAddUser = true">
                </nav>
            </header>

            <div class="users">
                <div class="users__item" v-for="(item, index) in getUsersList" :key="index">
                    <div class="users__item-fio">
                        <p>{{ item.LastName }} {{ item.FirstName }}</p>
                    </div>
                    <div class="users__item-contacts">
                        <p><span>Телефон:</span> {{ item.Phone }}</p>
                        <p><span>Email:</span> {{ item.Email }}</p>
                    </div>
                    <div class="users__item-status">
                        <p><span>Статус:</span> {{ item.Role }}</p>
                    </div>
                    <nav>
                        <img class="icon" src="../../../public/img/settings.svg" alt="Настройки"
                            v-if="item.Role != 'admin'" title="Найстройки пользователя"
                            @click="this.isOpenUserSettings = true; this.selectedUser = item">
                        <img class="icon" src="../../../public/img/delete.svg" alt="Удалить"
                            v-if="item.Role != 'admin'" title="Удалить пользователя"
                            @click="deleteUser(item)">
                    </nav>
                </div>

                <div class="loading" v-if="!getUsersList.length"></div>
            </div>

        </main>
    </div>
</template>

<script>
import AddUser from './AddUser.vue';
import EditUser from './EditUser.vue';
import { mapGetters } from 'vuex';

export default {
    components: { AddUser, EditUser },
    data() {
        return {
            isOpenAddUser: false,
            isOpenUserSettings: false,
            selectedUser: {}
        }
    },
    computed: { ...mapGetters(['getUsersList']) },
    mounted() {
        this.$store.dispatch('downloadUsers')
    },
    methods: {
        deleteUser(user){
            const {UserId, LastName, FirstName, Email} = user
            if(confirm(`Вы хотите удалить пользователя: "${LastName} ${FirstName} (${Email})?"`)){
                this.$store.dispatch('deleteUser', UserId)
            }
        }
    },
}
</script>

<style scoped>
@import "@/assets/css/userslist.css";
@import "@/assets/css/media/userslist_media.css";
</style>