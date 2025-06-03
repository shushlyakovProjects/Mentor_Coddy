<template>
  <div id="main-wrapper">

    <!-- Верхняя панель приложения -->
    <Header v-if="getCurrentUser.UserId" :currentUser="getCurrentUser"></Header>

    <!-- Блок уведомлений -->
    <transition name="notification">
      <article class="notification" v-if="getMessages.error || getMessages.success">
        <p>🔔 Уведомление</p>
        <p class="small error_message">{{ getMessages.error }}</p>
        <p class="small success_message">{{ getMessages.success }}</p>
      </article>
    </transition>

    <!-- Компонент vue-router, необходим для отображения компонентов приложения -->
    <router-view id="router-view"></router-view>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from './components/UI/Header.vue';

export default {
  components: { Header },
  computed: { ...mapGetters(['getCurrentUser', 'getMessages']) },
  watch: {
    // При изменении URL-адреса выполняется проверка авторизации пользователя
    '$route'() {
      const url = `/${document.URL.split('/').at(-2)}/${document.URL.split('/').at(-1)}`
      if (url != '/mentee/feedback') {
        if (document.cookie ? document.cookie.split(';').find(cookie => cookie.includes('ACCESS_TOKEN')).split('=')[1] : '') {
          this.$store.dispatch('checkAuthorization', this.$router)
        }
        else {
          this.$store.commit('updateCurrentUser', {})
          this.$router.push('/auth')
        }
      }
    },
  }
}
</script>

<style>
/* Импорт CSS стилей */
@import "@/assets/css/general.css";
@import "@/assets/css/media/general_media.css";
</style>