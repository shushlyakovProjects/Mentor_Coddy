<template>
  <div id="main-wrapper">

    <Header v-if="getCurrentUser.UserId" :currentUser="getCurrentUser"></Header>

    <transition name="notification">
      <article class="notification" v-if="messages.error || messages.success">
        <p>🔔 Уведомление</p>
        <p class="small error_message">{{ messages.error }}</p>
        <p class="small success_message">{{ messages.success }}</p>
      </article>
    </transition>

    <router-view id="router-view"></router-view>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from './components/UI/Header.vue';

export default {
  data() {
    return {
      messages: {
        error: '',
        success: ''
      }
    }
  },
  components: { Header },
  mounted() {
    const url = `/${document.URL.split('/').at(-2)}/${document.URL.split('/').at(-1)}`
    if (url != '/mentee/feedback') {this.$store.dispatch('checkAuthorization', this.$router)  }
  },
  computed: { ...mapGetters(['getCurrentUser', 'getMessages']) },
  watch: { getMessages: { handler() { this.messages = this.getMessages }, deep: true } }
}
</script>

<style>
@import "@/assets/css/general.css";
@import "@/assets/css/media/general_media.css";

</style>