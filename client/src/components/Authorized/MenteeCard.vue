<template>
    <div class="menteeCard" @click="closeMenteeCard">

        <main class="wrapper">

            <header>
                <h2>Просмотр карточки менти</h2>
                <nav>
                    <a :href='`https://coddy.t8s.ru/Profile/${selectedMentee.Id}`' title="Открыть CRM пользователя"
                        target="_blank">
                        <img class="icon" src="../../../public/img/CRM_profile.svg" alt="CRM">
                    </a>
                    <img class="icon" src="../../../public/img/close.svg" alt="Закрыть" title="Закрыть карточку"
                        @click="closeMenteeCard">
                </nav>

            </header>

            <!-- {{ selectedMentee }} -->

            <div class="fields">
                <div class="fields__item">
                    <div class="fields__item-left">
                        <div class="avatar">
                            <img :src="selectedMentee.hasOwnProperty('PhotoUrls') ?
                                'https://coddy.t8s.ru/' + selectedMentee.PhotoUrls[1] :
                                'https://coddy.t8s.ru/Content/themes/nwds/Images/no-photo-150x150.png'" alt="Аватар">
                        </div>
                        <div class="status">
                            <p class="small"><b>ID:</b> {{ selectedMentee.Id }}</p>
                            <p class="small"><b>Статус:</b> {{ selectedMentee.Status }}</p>
                            <p class="small"><b>Работает с:</b> {{ formatDate(selectedMentee.Created) }}</p>
                            <p class="small"><b>Всего дней:</b> {{ numberWorkDays(selectedMentee.Created) }}</p>
                            <p class="small" v-if="currentFeedback != undefined">
                                <b>Часов отработано:</b> {{ currentFeedback.CountPaidModules * 6 }}+
                            </p>
                        </div>
                    </div>
                    <div class="fields__item-right">
                        <div class="fio">
                            <h2>{{ selectedMentee.LastName }} {{ selectedMentee.FirstName }} {{
                                selectedMentee.MiddleName }}
                            </h2>
                        </div>
                        <div class="general">
                            <p><b>Контактный номер:</b> <span>{{ selectedMentee.Mobile || selectedMentee.Phone }}</span>
                            </p>
                            <p><b>Email:</b> <span>{{ selectedMentee.EMail }}</span></p>

                            <p class="small bold">Дисциплины: ({{ selectedMentee.Disciplines != undefined ?
                                selectedMentee.Disciplines.length : 0 }})</p>
                            <p class="small marker">{{ selectedMentee.Disciplines != undefined ?
                                selectedMentee.Disciplines.join(', ') : 'Не указаны' }}</p>

                            <p class="small bold">Обратная связь: </p>
                            <p class="small feedback_box" v-if="currentFeedback == undefined">Отсутсвует</p>
                            <span class="feedback_box" v-if="currentFeedback != undefined">
                                <p class="small">Последняя отправка: {{ formatDate(currentFeedback.Date) }}</p>
                                <p class="small">Проверка нормативов: {{ currentFeedback.CheckInfo }}</p>
                                <p class="small">Набор нагрузки: {{ currentFeedback.NewLoad }}</p>
                                <p class="small">{{ currentFeedback.CountConstantUnits>0 ? 'Ведет постоянных учеников: '+currentFeedback.CountConstantUnits : 'Ведет пробные уроки' }}</p>
                                <p class="small">Завершено модулей: {{ currentFeedback.CountPaidModules }}</p>
                                <p class="small">Комментарии: {{ currentFeedback.Comments }}</p>
                            </span>


                            <p class="small bold">Адрес проживания: {{ selectedMentee.Address }}</p>
                            <p class="small marker">{{ selectedMentee.Address ? selectedMentee.Address : '❗️' }}</p>
                            <p class="small bold">Образование/Работа: </p>
                            <p class="small marker">{{ selectedMentee.JobOrStudyPlace ? selectedMentee.JobOrStudyPlace :
                                '❗️' }}</p>
                            <p class="small">{{ selectedMentee.Position }}</p>
                            <p class="small bold">Контактное лицо: </p>
                            <p class="small marker">{{ selectedMentee.Agents ?
                                selectedMentee.Agents[0].WhoIs ?
                                    `${selectedMentee.Agents[0].WhoIs}-${selectedMentee.Agents[0].FirstName}:
                                ${selectedMentee.Agents[0].Mobile}` : `${selectedMentee.Agents[0].FirstName}:
                                ${selectedMentee.Agents[0].Mobile}`
                                : '❗️' }}</p>

                        </div>
                    </div>
                </div>
            </div>

        </main>

    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['selectedMentee'],
    data() {
        return {
            messages: {
                error: '',
                success: ''
            },
            currentFeedback: {}
        }
    },
    computed: { ...mapGetters(['getFeedbackList']) },
    mounted() {
        window.addEventListener('keydown', this.closeMenteeCard, { once: true })
        this.currentFeedback = this.getFeedbackList ? this.getFeedbackList.findLast((feedback) => feedback.FIO.includes(this.selectedMentee.LastName)) : undefined
    },
    methods: {
        closeMenteeCard(event) {
            if (event.key == 'Escape' || event.target.classList[0] == 'menteeCard' || event.target.alt == 'Закрыть') {
                this.$emit("closeMenteeCard");
                window.removeEventListener('keydown', this.closeMenteeCard, { once: true })
            }
        },
        formatDate(origDate) {
            const date = new Date(origDate)
            const day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()
            const month = (date.getMonth() < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
            const year = date.getFullYear()
            return `${day}.${month}.${year}`
        },
        numberWorkDays(origDate) {
            const date = new Date(origDate)
            const now = new Date()
            const numberWorkDays = Math.round((now - date) / 1000 / 60 / 60 / 24)
            return numberWorkDays
        },
    },

}
</script>

<style scoped>
@import url(@/assets/css/menteecard.css);
@import url(@/assets/css/edits.css);
@import url(@/assets/css/media/edits_media.css);
@import url(@/assets/css/media/menteecard_media.css);

</style>