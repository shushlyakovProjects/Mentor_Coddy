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
                            <form class="filtres" v-show="filterIsOpen" v-on:submit.prevent="filterStart()">
                                <div class="filtres__item">
                                    <p class="small">ФИО</p>
                                    <input type="text" v-model="filter.fioInclude" placeholder="Содержит...">
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Дисциплины</p>
                                    <input type="text" v-model="filter.disciplines" placeholder="Преподает...">
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Количество учеников </p>
                                    <div id="filter3">
                                        <label for="filter3_asc">↗️<input id="filter3_asc" type="radio" value="asc"
                                                name="sortOfEdUnits" v-model="filter.sortOfEdUnits"></label>
                                        <label for="filter3_desc">↘️<input id="filter3_desc" type="radio" value="desc"
                                                name="sortOfEdUnits" v-model="filter.sortOfEdUnits"></label>
                                    </div>
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Длительность работы </p>
                                    <div id="filter4">
                                        <label for="filter4_asc">↗️<input id="filter4_asc" type="radio" value="asc"
                                                name="sortOfWorkTime" v-model="filter.sortOfWorkTime"></label>
                                        <label for="filter4_desc">↘️<input id="filter4_desc" type="radio" value="desc"
                                                name="sortOfWorkTime" v-model="filter.sortOfWorkTime"></label>
                                    </div>
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Дней работает </p>
                                    <div id="filter5">
                                        <input type="text" placeholder="От" maxlength="3" v-model="filter.workDays.min">
                                        <input type="text" placeholder="До" maxlength="3" v-model="filter.workDays.max">
                                    </div>
                                </div>
                                <label for="filter6" class="filtres__item">
                                    <p class="small">Ментор Шушляков Н</p>
                                    <input type="checkbox" id="filter6" v-model="filter.menteesOfShushlyakov">
                                </label>
                                <label for="filter7" class="filtres__item">
                                    <p class="small">Раскраска</p>
                                    <input type="checkbox" id="filter7" v-model="filter.backLight">
                                </label>

                                <input type="submit" value="Применить">
                            </form>
                        </transition>

                    </div>
                    <button @click="uploadToDataBaseForTracking()" id="btn_uploadToDataBaseForTracking"
                        title="Отслеживать динамику с текущего момента"
                        :data-lastupdate="lastUpdate ? `Посл загр ${lastUpdate}` : `Загрузка...`">Загрузить
                        в базу</button>
                    <button @click=" getEveryTrialLesson()" title="Получить все проведенные пробные уроки за полгода"
                        v-if="MENTEE_LIST.length != 0">Получить ПУ за полгода</button>
                </nav>
            </header>

            <div class="mentee">
                <div class="mentee__item" v-for="(item, index) in MENTEE_LIST" :key="index"
                    @click="this.selectedMentee = item">
                    <div>{{ index + 1 }}.</div>
                    <div>
                        <p class="small">{{ item.LastName }}</p>
                        <p class="small">{{ item.FirstName }}</p>
                    </div>
                    <div>
                        <p class="small">Работает с: {{ formatDate(item.Created) }}</p>
                        <p class="small">Всего: {{ getNumberWorkDays(item.Created) }} дней</p>
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
                        <p class="small"
                            :class="getBackLight(item.Disciplines != undefined ? item.Disciplines.length : 0)">
                            Дисциплин:
                            {{ item.Disciplines != undefined ? item.Disciplines.length : 'Не указаны' }}</p>
                    </div>
                    <nav>
                        <p class="errorMessage"
                            v-show="!item.hasOwnProperty('PhotoUrls') || !item.hasOwnProperty('JobOrStudyPlace')"
                            title="СРМ заполнен не полностью">❗️</p>
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
import { mapGetters } from 'vuex';

export default {
    components: { MenteeCard },
    data() {
        return {
            MENTEE_LIST: [],
            selectedMentee: {},
            lastUpdate: '',

            filterIsOpen: false,
            filter: {
                menteesOfShushlyakov: false, // Временный фильтр
                disciplines: '',
                fioInclude: '',
                gender: '',
                sortOfEdUnits: '', // asc - desc
                sortOfWorkTime: '', // asc - desc
                workDays: { min: 0, max: 360 },
                backLight: false
            },
        }
    },
    computed: { ...mapGetters(['getMenteeList']) },
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
        filterStart() {
            this.MENTEE_LIST = this.$store.getters.getMenteeListWithFiltres(this.filter)
        },
        formatDate(origDate) {
            const date = new Date(origDate)
            const day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()
            const month = (date.getMonth() < 10) ? '0' + date.getMonth() : date.getMonth()
            const year = date.getFullYear()
            return `${day}.${month}.${year}`
        },
        getNumberWorkDays(origDate) {
            const date = new Date(origDate)
            const now = new Date()
            const numberWorkDays = Math.round((now - date) / 1000 / 60 / 60 / 24)
            return numberWorkDays
        },
        getBackLight(info) {
            if (this.filter.backLight) {
                if (info == 0) { return 'backlight_red-1' }
                else if (info > 0 && info < 5) { return 'backlight_yellow-1' }
                else if (info >= 5) { return 'backlight_green-1' }
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
    grid-template-columns: 30px 1fr 2fr 2fr 2fr 50px;
    align-items: center;
    overflow-wrap: anywhere;
    gap: 20px;
    transition-duration: 0.3s;
    cursor: pointer;
}

.mentee__item nav {
    display: flex;
    justify-content: end;
    gap: 3px;
}

.mentee__item:hover {
    background-color: var(--color_background-4_white);
}


/* Настройка фильтров */
.filtres-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.filtres-wrapper button {
    z-index: 5;
}

.filtres-wrapper .likeButton {
    margin-top: 10px;
    margin-right: 10px;
    padding: 3px;
    opacity: 0.7;
    transition-duration: 0.3s;
}

.filtres {
    transition-property: 0.5s;

    position: absolute;
    background-color: var(--color_background-4_white);
    box-shadow: 0 0 3px var(--color_accent_darkBlue);
    color: var(--color_accent_darkBlue);
    display: flex;
    flex-direction: column;

    right: 0;
    top: 100%;
    transform: translateY(5px);

    border-radius: 10px 0 10px 10px;
    overflow: hidden;
    width: 30vw;
    height: auto;
}

.filtres input[type="submit"] {
    border-radius: 0 0 10px 10px;
}

.filtres__item {
    display: grid;
    grid-template-columns: 1fr auto;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border: 1px solid var(--color_background-2_white);
    border-radius: 10px;
    margin: 5px;
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



/* Настройка пунктов фильтра */
#filter3,
#filter4 {
    display: grid;
    grid-template-columns: repeat(2, 50px);
    gap: 10px;
}

#filter5 {
    display: flex;
    gap: 10px;
    justify-content: end;
}

#filter5 input {
    width: 50px;
}



</style>