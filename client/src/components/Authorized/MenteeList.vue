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

                        <button title="Настройка фильтров" @click="filterIsOpen = !filterIsOpen">Фильтры</button>

                        <transition name="filterForm">
                            <MenteeListFilter v-show="filterIsOpen" @filterStart="filterStart"
                                @backLight="(value) => { backLight = value }"></MenteeListFilter>
                        </transition>
                    </div>

                    <button @click="uploadToDataBaseForTracking()" id="btn_uploadToDataBaseForTracking"
                        title="Отслеживать динамику с текущего момента"
                        :data-lastupdate="lastUpdate ? `Посл загр ${lastUpdate}` : `Загрузка...`">Загрузить
                        в базу</button>

                    <button @click="getEveryTrialLesson()" title="Получить все проведенные пробные уроки за полгода"
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
                        <p class="small"
                            :class="getBackLight(item.Disciplines != undefined ? item.Disciplines.length : 0)">
                            Дисциплин:
                            {{ item.Disciplines != undefined ? item.Disciplines.length : 'Не указаны' }}</p>
                        <p class="small" :class="getBackLight(item.InfoEdUnits.CountConstantUnits)">
                            Постоянных учеников:
                            {{ item.InfoEdUnits.CountConstantUnits }}
                            ({{ getDifference(item.InfoEdUnits ? item.InfoEdUnits.CountConstantUnits : 0,
                                item.PrevBrief ? item.PrevBrief.CountConstantUnits : 0) }})
                        </p>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(item.Feedback.CountPaidModules != undefined ? item.Feedback.CountPaidModules : 0)">
                            Завершено модулей:
                            {{ item.Feedback ? item.Feedback.CountPaidModules : 'Отсутсвует' }}. ≈{{
                                item.Feedback.CountPaidModules > 0 ? item.Feedback.CountPaidModules * 6 : '' }}ч</p>
                    </div>

                    <div>
                        <p class="small"
                            :class="getBackLight(0, item.Feedback ? formatDate(item.Feedback.Date) : 'Отсутсвует')">
                            ОС:
                            {{ item.Feedback ? formatDate(item.Feedback.Date) : 'Отсутсвует' }}
                        </p>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(0, item.Feedback.CountConstantUnits > 0 ? 'Ведет постоянных' : 'Ведет пробные')">
                            {{ item.Feedback.CountConstantUnits > 0 ? 'Ведет постоянных' : 'Ведет пробные' }}</p>
                        <p class="small" v-if="item.Feedback"
                            :class="getBackLight(0, item.Feedback ? item.Feedback.CheckInfo : '')">
                            Нормативы:
                            {{ item.Feedback ? item.Feedback.CheckInfo : '' }}</p>
                    </div>

                    <div>
                        <textarea class="comment-box" placeholder="Комментарий"
                            :ref="'comment-box-' + item.Id"></textarea>
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
import axios from 'axios';
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
                if (!e.target.closest('.filtres-wrapper')) {
                    this.filterIsOpen = false
                }
            }

            // console.log(e.target);

        })
    },
    methods: {
        async uploadToDataBaseForTracking() {
            await this.getMenteeData()
            await this.$store.dispatch('uploadToDataBaseForTracking', this.MENTEE_LIST)
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
.menteeList_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0px;
    transition-duration: 0.3s;
    margin-bottom: 20px;
}

.header__inScrolling {
    background-color: var(--color_background-2_white);
    z-index: 5;
    padding: 10px;
}

header nav {
    display: flex;
    gap: 10px;
}

.mentee {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.mentee__item {
    border-radius: 10px;
    border: 1px solid var(--color_accent_gray);
    padding: 5px 10px;
    display: grid;
    grid-template-columns: 25px 100px 150px 200px 220px 1fr 100px;
    align-items: start;
    overflow-wrap: anywhere;
    gap: 10px;
    transition-duration: 0.3s;
}

.mentee__item nav {
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 3px;
}

.mentee__item:hover {
    background-color: var(--color_background-4_white);
}

.mentee__item:hover .hover-bold {
    font-weight: bold;
    cursor: pointer;
}


.comment-box {}


/* Фильтры, оболочка */
.filtres-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.filtres-wrapper button {
    z-index: 5;
}

.filtres-wrapper .likeButton {
    margin-right: 10px;
    padding: 3px;
    opacity: 0.7;
    transition-duration: 0.3s;
}

/* Настройка анимации в блоке фильтров */
.filterBtn-enter-active,
.filterBtn-leave-active,
.filterForm-enter-active,
.filterForm-leave-active {
    transition-duration: 0.2s;
    transition-timing-function: ease-in-out;
}

.filterBtn-enter-from,
.filterBtn-leave-to {
    transform: translateX(30px);
    opacity: 0;
}

.filterForm-enter-from,
.filterForm-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}



/* Настройка кнопки загрузки в БД */
#btn_uploadToDataBaseForTracking {
    position: relative;
}

#btn_uploadToDataBaseForTracking::before {
    content: attr(data-lastupdate);
    position: absolute;
    text-align: center;
    width: 100%;
    height: auto;
    left: 0;
    top: 0;
    z-index: -1;
    font-size: 10px;
    transition-duration: 0.2s;
    color: var(--color_accent_darkBlue);
    padding-bottom: 5px;
}

#btn_uploadToDataBaseForTracking:hover::before {
    transform: translateY(-100%);
}
</style>