<template>
    <div>
        <main class="wrapper">
            <MenteeCard @closeMenteeCard="selectedMentee = {}" v-if="selectedMentee.Id"
                :selectedMentee="selectedMentee"></MenteeCard>


            <header class="menteeList_header">
                <div>
                    <h2>Список менти</h2>
                    <p>Найдено: {{ MENTEE_LIST.length }}</p>
                </div>

                <!-- Фильтры -->
                <nav>
                    <div class="filtres-wrapper">
                        <transition name="filterBtn">
                            <img @click="getMenteeData()" class="likeButton icon" src="../../../public/img/delete.svg"
                                title="Очистить фильтры" alt="Отмена" v-show="filterIsOpen">
                        </transition>

                        <img v-if="MENTEE_LIST.length != 0" @click="filterIsOpen = !filterIsOpen"
                            class="icon button-mobile" src="../../../public/img/filter.svg" alt="Настройка фильтров">

                        <button v-if="MENTEE_LIST.length != 0" title="Настройка фильтров"
                            @click="filterIsOpen = !filterIsOpen">Фильтры</button>

                        <transition name="filterForm">
                            <MenteeListFilter v-show="filterIsOpen" @filterStart="filterStart"
                                @backLight="(value) => { backLight = value }"></MenteeListFilter>
                        </transition>
                    </div>

                    <button v-if="MENTEE_LIST.length != 0" @click="uploadToDataBaseForTracking()"
                        id="btn_uploadToDataBaseForTracking" title="Отслеживать динамику с текущего момента"
                        :data-lastupdate="lastUpdate ? `Посл загр ${lastUpdate}` : `Загрузка...`">Загрузить
                        в базу</button>

                    <img v-if="MENTEE_LIST.length != 0" @click="uploadToDataBaseForTracking()"
                        class="icon button-mobile" src="../../../public/img/uploadForTracking.svg"
                        alt="Отслеживать динамику с текущего момента">
                    <img v-if="MENTEE_LIST.length != 0" @click="getEveryTrialLesson()" class="icon button-mobile"
                        src="../../../public/img/getTrails180.svg"
                        alt="Получить все проведенные пробные уроки за 180 дней">

                    <button @click="getEveryTrialLesson()" title="Получить все проведенные пробные уроки за 180 дней"
                        v-if="MENTEE_LIST.length != 0">Получить ПУ за полгода</button>

                </nav>
            </header>

            <div class="mentee">
                <div class="mentee__item" v-for="(item, index) in MENTEE_LIST" :key="index">
                    <div>{{ index + 1 }}.</div>
                    <div @click="this.selectedMentee = item" class="hover-bold">
                        <p class="small">{{ item.LastName }}</p>
                        <p class="small">{{ item.FirstName }}</p>
                        <p class="verysmall">Всего: {{ getNumberWorkDays(item.Created) }} дней</p>
                    </div>

                    <div>
                        <p class="small" :class="getBackLight(item.InfoEdUnits.CountTrialUnitsForWeek)">
                            ПУ за неделю:
                            {{ item.InfoEdUnits.CountTrialUnitsForWeek }}
                            ({{ getDifference(item.InfoEdUnits ? item.InfoEdUnits.CountTrialUnitsForWeek : 0,
                                item.PrevBrief ? item.PrevBrief.CountTrialUnitsForWeek : 0) }})
                        </p>
                        <p class="small" v-if="item.InfoEdUnits.CountTrialLessonsForSixMonths != undefined"
                            :class="getBackLight(item.InfoEdUnits.CountTrialLessonsForSixMonths)" title="За 180 дней">
                            ПУ всего:
                            {{ item.InfoEdUnits.CountTrialLessonsForSixMonths }}
                            ({{ getDifference(item.InfoEdUnits ? item.InfoEdUnits.CountTrialLessonsForSixMonths : 0,
                                item.PrevBrief ? item.PrevBrief.CountTrialLessonsForSixMonths : 0) }})
                        </p>
                    </div>

                    <div>
                        <p class="small" :class="getBackLight(item.InfoEdUnits.CountConstantUnits)">
                            Постоянных учеников:
                            {{ item.InfoEdUnits.CountConstantUnits }}
                            ({{ getDifference(item.InfoEdUnits ? item.InfoEdUnits.CountConstantUnits : 0,
                                item.PrevBrief ? item.PrevBrief.CountConstantUnits : 0) }})
                        </p>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(item.Feedback.CountPaidModules != undefined ? item.Feedback.CountPaidModules : 0)">
                            Завершено модулей:
                            {{ item.Feedback ? item.Feedback.CountPaidModules : 'Отсутсвует' }}.
                            <span v-show="item.InfoEdUnits.CountConstantUnits != 0">≈{{ item.Feedback.CountPaidModules >
                                0
                                ? item.Feedback.CountPaidModules * 6 : '' }}ч</span>
                        </p>
                        <p class="verysmall"
                            :class="getBackLight(item.Disciplines != undefined ? item.Disciplines.length : 0)">
                            Дисциплин:
                            {{ item.Disciplines != undefined ? item.Disciplines.length : 'Не указаны' }}</p>
                    </div>

                    <div>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(0, item.Feedback.CountConstantUnits > 0 ? 'Ведет постоянных' : 'Ведет пробные')">
                            {{ item.Feedback.CountConstantUnits > 0 ? 'Ведет постоянных' : 'Ведет пробные' }}</p>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(0, item.Feedback ? item.Feedback.CheckInfo : '')">
                            {{ item.Feedback ? item.Feedback.CheckInfo : '' }}</p>
                        <p class="verysmall"
                            :class="getBackLight(0, item.Feedback ? formatDate(item.Feedback.Date) : 'Отсутсвует')">
                            ОС:
                            {{ item.Feedback ? formatDate(item.Feedback.Date) : 'Отсутсвует' }}
                        </p>
                    </div>

                    <div class="comment-box">
                        <textarea placeholder="Заметки"
                            v-bind:value="item.PrevBrief != undefined ? item.PrevBrief.CommentContent : ''"
                            :id="'CommentContent_' + item.Id"
                            :style="item.PrevBrief != undefined ? 'background-color:' + item.PrevBrief.CommentColor : ''"
                            spellcheck="false" @focus="commentingMentee($event, item.Id)"
                            @focusout="uploadCommentMentee($event, item.Id)"></textarea>

                        <input type="color" @focusout="uploadCommentMentee($event, item.Id)"
                            :id="'CommentColor_' + item.Id"
                            :value="item.PrevBrief.CommentContent ? item.PrevBrief.CommentColor : '#FFFFFF'">
                    </div>

                    <nav>
                        <p class="errorMessage"
                            v-show="!item.hasOwnProperty('PhotoUrls') || !item.hasOwnProperty('JobOrStudyPlace')"
                            title="СРМ заполнен не полностью">❗️</p>

                        <p title="ОС отсутсвует">{{ item.Feedback == undefined ? '❌' : '' }}</p>
                        <p title="ОС получена">{{ item.Feedback != undefined ? new Date(item.Feedback.Date) >= new
                            Date() - (10 * 24 * 60 * 60 * 1000) ? '✅' : '' : '' }}</p>
                        <p title="ОС устарела">{{ item.Feedback != undefined ? new Date(item.Feedback.Date) < new Date()
                            - (10 * 24 * 60 * 60 * 1000) ? '⌛️' : '' : '' }}</p>

                                <a :href='`https://coddy.t8s.ru/Profile/${item.Id}`' title="Открыть CRM пользователя"
                                    target="_blank">
                                    <img class="icon" src="../../../public/img/CRM_profile.svg" alt="CRM">
                                </a>
                    </nav>
                </div>

                <div class="loading" v-if="!MENTEE_LIST.length"></div>
            </div>

        </main>
    </div>
</template>

<script>
import MenteeCard from './MenteeCard.vue';
import MenteeListFilter from '../UI/MenteeList-Filter.vue';
import { mapGetters } from 'vuex';

export default {
    components: { MenteeCard, MenteeListFilter },
    data() {
        return {
            MENTEE_LIST: [],
            selectedMentee: {},
            lastUpdate: '',
            backLight: false,
            filterIsOpen: false,

            comment: {
                contentForCompare: '',
                colorForCompare: ''
            }

        }
    },
    computed: { ...mapGetters(['getMenteeList', 'getFeedbackList']) },
    watch: {
        getMenteeList() {
            this.MENTEE_LIST = this.getMenteeList
        },
        MENTEE_LIST() {
            if (this.MENTEE_LIST.length) { this.lastUpdate = this.MENTEE_LIST.find(mentee => mentee.hasOwnProperty("PrevBrief")).PrevBrief.LastUpdate }
        }
    },
    mounted() {
        this.getMenteeData()
        if (this.getFeedbackList.length == 0) { this.$store.dispatch('downloadFeedbackFromDatabase') }
        const header = document.querySelector('.menteeList_header')
        document.addEventListener('scroll', (event) => {
            if (window.scrollY > 50) {
                if (!header.classList.contains('header__inScrolling')) { header.classList.add('header__inScrolling') }
            } else {
                if (header.classList.contains('header__inScrolling')) { header.classList.remove('header__inScrolling') }
            }
        })
        document.addEventListener('click', (e) => {
            if (this.filterIsOpen) {
                if (!e.target.closest('.filtres-wrapper')) { this.filterIsOpen = false }
            }
        })
    },
    methods: {
        commentingMentee(event, MenteeId) {
            const Color = document.getElementById('CommentColor_' + MenteeId).value
            const Content = document.getElementById('CommentContent_' + MenteeId).value.trim()
            this.comment.contentForCompare = Content
            this.comment.colorForCompare = Color
        },
        uploadCommentMentee(event, MenteeId) {
            const Color = document.getElementById('CommentColor_' + MenteeId).value
            const Content = document.getElementById('CommentContent_' + MenteeId).value.trim()

            if (Content != this.comment.contentForCompare || (Color != this.comment.colorForCompare && Content != '')) {
                const CommentInfo = { MenteeId, Content, Color }
                this.$store.dispatch('uploadCommentToDataBase', CommentInfo)
            }
        },
        async uploadToDataBaseForTracking() {
            if (confirm('Вы уверены, что хотите начать отсчёт динамики с данного момента?')) {
                await this.getMenteeData()
                await this.$store.dispatch('uploadToDataBaseForTracking', this.MENTEE_LIST)
            }

        },
        async getEveryTrialLesson() {
            await this.$store.dispatch('downloadEveryTrialLesson', this.MENTEE_LIST)
        },
        async getMenteeData() {
            this.filter = { menteesOfShushlyakov: false, disciplines: '', fioInclude: '', gender: '', sortOfEdUnits: '', sortOfWorkTime: '', workDays: { min: 0, max: 360 } }
            this.MENTEE_LIST = this.getMenteeList
            if (this.MENTEE_LIST.length == 0) { await this.$store.dispatch('downloadMenteeData') }
        },
        filterStart(filter) {
            this.MENTEE_LIST = this.$store.getters.getMenteeListWithFiltres(filter)
        },
        formatDate(origDate) {
            const date = new Date(origDate)
            const day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()
            const month = (date.getMonth() < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
            const year = date.getFullYear()
            return `${day}.${month}.${year}`
        },
        getNumberWorkDays(origDate) {
            const date = new Date(origDate)
            const now = new Date()
            const numberWorkDays = Math.round((now - date) / 1000 / 60 / 60 / 24)
            return numberWorkDays
        },
        getBackLight(info, text) {
            if (this.backLight) {
                if (text) {
                    if (text == 'Отсутсвует' || text == 'Нужна помощь') {
                        return 'backlight_red-1'
                    }
                    else if (text == 'Ведет пробные') {
                        return 'backlight_yellow-1'
                    }
                    else {
                        return 'backlight_green-1'
                    }
                } else {
                    if (info == 0) { return 'backlight_red-1' }
                    else if (info > 0 && info < 5) { return 'backlight_yellow-1' }
                    else if (info >= 5) { return 'backlight_green-1' }
                }
            }
        },
        getDifference(dataNow = 0, dataOld = 0) {
            return (dataNow - dataOld) >= 0 ? '+' + (dataNow - dataOld) : (dataNow - dataOld)
        },
    },
}
</script>

<style scoped>
@import url(@/assets/css/menteelist.css);
@import url(@/assets/css/media/menteelist_media.css);
</style>