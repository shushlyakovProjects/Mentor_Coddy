<template>
    <div>
        <main class="wrapper">

            <header ref="summary_header">
                <div>
                    <h2>Обратная связь от менти</h2>
                    <p>Найдено: {{ FEEDBACK_LIST.length }}</p>
                </div>

                <nav>
                    <div class="filtres-wrapper">
                        <transition name="filterBtn">
                            <img @click="getFeedbackFromDatabase()" class="likeButton icon"
                                src="../../../public/img/delete.svg" title="Очистить фильтры" alt="Отмена"
                                v-show="filterIsOpen">
                        </transition>

                        <button title="Настройка фильтров" @click="filterIsOpen = !filterIsOpen">Фильтры</button>

                        <transition name="filterForm">
                            <form class="filtres" v-show="filterIsOpen" v-on:submit.prevent="filterStart()">
                                <div class="filtres__item">
                                    <p class="small">ФИО</p>
                                    <input type="text" v-model="filter.fioInclude" placeholder="Содержит...">
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Сортировка</p>
                                    <div id="filter3">
                                        <label class="small" for="filter3_asc">Сначала старые</label>
                                        <input id="filter3_asc" type="radio" value="asc" name="sortByDate"
                                            v-model="filter.sortByDate">
                                        <label class="small" for="filter3_desc">Сначала новые</label>
                                        <input id="filter3_desc" type="radio" value="desc" name="sortByDate"
                                            v-model="filter.sortByDate">
                                    </div>
                                </div>
                                <div class="filtres__item">
                                    <p class="small">Дата ОС</p>
                                    <div id="filter4">
                                        <label class="small" for="filter4_from">С </label>
                                        <input id="filter4_from" type="date" name="filterByDate"
                                            v-model="filter.filterByDate.from">
                                        <label class="small" for="filter4_to">По </label>
                                        <input id="filter4_to" type="date" name="filterByDate"
                                            v-model="filter.filterByDate.to">
                                    </div>
                                </div>


                                <input type="submit" value="Применить">
                            </form>
                        </transition>

                    </div>

                    <button @click="$router.push('/mentee/feedback')" title="Просмотр формы сбора ОС">Форма</button>
                    <button @click="deleteCheckedFeedback()" title="Удалить выбранные"
                        v-show="checkedList.length != 0">Удалить</button>
                    <img @click="getFeedbackFromDatabase(true)" class="likeButton icon" src="../../../public/img/update.svg"
                        title="Обновить данные" alt="Обновить">
                </nav>
            </header>

            <div class="feedback_wrapper">
                <div class="feedback_header">
                    <!-- <div v-for="(item, index) in Object.keys(getFeedbackList[0])" :key="index">
                        {{ item }}
                    </div> -->
                    <p class="small">ID</p>
                    <p class="small">Дата</p>
                    <p class="small">ФИО</p>
                    <p class="small">Телефон</p>
                    <p class="small">Данные верны</p>
                    <p class="small">Набор нагрузки</p>
                    <p class="small">Комментарии</p>
                    <p class="small">Постоянные</p>
                    <p class="small">Кол-во пост уч</p>
                    <p class="small">Кол-во модулей</p>
                    <p class="small">Кол-во ПУ</p>
                    <p class="small"></p>
                </div>

                <div class="feedback_wrapper-flex">
                    <div class="feedback_row" v-for="(item, index) in FEEDBACK_LIST">
                        <p class="small">{{ item.FeedBackID }}</p>
                        <p class="small">{{ formatDate(item.Date) }}</p>
                        <p class="small">{{ item.FIO }}</p>
                        <p class="small">{{ item.Phone }}</p>
                        <p class="small" :class="{
                            'backlight_green-1': item.CheckInfo == 'Всё верно',
                            'backlight_red-2': item.CheckInfo == 'Нужна помощь'
                        }">{{ item.CheckInfo }}</p>
                        <p class="small" :class="{
                            'backlight_red-2': item.NewLoad != 'Набираю',
                            'backlight_green-1': item.NewLoad == 'Набираю'
                        }">{{ item.NewLoad }}</p>
                        <p class="small onHover">{{ item.Comments }}</p>
                        <p class="small">{{ item.HasConstantUnit }}</p>
                        <p class="small">{{ item.HasConstantUnit == 'Да' ? item.CountConstantUnits : '-' }}</p>
                        <p class="small">{{ item.HasConstantUnit == 'Да' ? item.CountPaidModules : '-' }}</p>
                        <p class="small">{{ item.HasConstantUnit != 'Да' ? item.CountTrialUnits : '-' }}</p>
                        <nav>
                            <label :for="item.FeedBackID" class="checkbox-btn">
                                <input type="checkbox" :id="item.FeedBackID" :value="item.FeedBackID"
                                    v-model="checkedList">
                            </label>
                        </nav>
                    </div>
                </div>
            </div>

            <div class="loading" v-if="!FEEDBACK_LIST.length"></div>

            <!-- ДОБАВИТЬ ОЧИСТКУ ОС -->


        </main>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            FEEDBACK_LIST: [],
            checkedList: [],

            filterIsOpen: false,
            filter: {
                fioInclude: '',
                sortByDate: '',
                filterByDate: { from: '', to: '' },
            }
        }
    },
    mounted() {
        this.getFeedbackFromDatabase()
        document.addEventListener('click', (e) => {
            if (this.filterIsOpen) {
                if (!e.target.closest('.filtres-wrapper')) {
                    this.filterIsOpen = false
                }
            }
        })
    },
    computed: { ...mapGetters(['getFeedbackList']) },
    watch: {
        getFeedbackList() {
            this.FEEDBACK_LIST = this.getFeedbackList
        }
    },
    methods: {
        getFeedbackFromDatabase(force = false) {
            this.filter = {
                fioInclude: '',
                sortByDate: '',
                filterByDate: { from: '', to: '' },
            }
            this.FEEDBACK_LIST = this.getFeedbackList
            if (this.getFeedbackList.length == 0 || force) { this.$store.dispatch('downloadFeedbackFromDatabase') }
        },
        formatDate(origDate) {
            const date = new Date(origDate)
            const min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()
            const hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
            const day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()
            const month = (date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
            const year = date.getFullYear()
            return `${day}.${month}.${year} ${hour}:${min}`
        },
        filterStart() {
            this.FEEDBACK_LIST = this.$store.getters.getFeedbackListWithFiltres(this.filter)
        },
        deleteCheckedFeedback() {
            this.$store.dispatch('deleteCheckedFeedbackFromDatabase', this.checkedList)
        }
    }
}
</script>

<style scoped>
.wrapper header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.wrapper header nav {
    display: flex;
    gap: 10px;
}

.feedback_header,
.feedback_row {
    display: grid;
    grid-template-columns: 20px 80px 1fr 1fr 1fr 1fr 3fr repeat(5, 40px);
    gap: 15px;
}

.feedback_row {
    background-color: var(--color_background-4_white);
    max-height: 50px;
    overflow: hidden;
    border-radius: 10px;
}

.feedback_header p,
.feedback_row p {
    padding: 5px;
}

.feedback_row:has(.onHover:hover) {
    max-height: none;
    overflow: visible;
}

.feedback_header {
    position: sticky;
    font-weight: bold;
    margin-bottom: 20px;
    align-items: center;
}


.feedback_header p:nth-child(11),
.feedback_header p:nth-child(10),
.feedback_header p:nth-child(9),
.feedback_header p:nth-child(8) {
    writing-mode: vertical-lr;
    align-self: start;
}

.feedback_wrapper-flex {
    display: flex;
    flex-direction: column-reverse;
    gap: 5px;
}

.feedback_row nav {
    display: flex;
    justify-content: center;
    align-items: start;
    padding: 10px 0;
}

.checkbox-btn {
    background-color: var(--color_background-2_white);
    box-shadow: 0px 0px 0px 2px inset var(--color_accent_darkBlue);
    width: 50%;
    aspect-ratio: 1/1;
    display: block;
    border-radius: 50%;
}

.checkbox-btn:has(input:checked) {
    background-color: var(--color_accent_darkBlue);
    box-shadow:
        0px 0px 0px 2px inset var(--color_accent_darkBlue),
        0px 0px 0px 5px inset var(--color_background-2_white);
}

.checkbox-btn input[type='checkbox'] {
    display: none;
}




/* ФИЛЬТРЫ */
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
    margin-right: 10px;
    padding: 3px;
    opacity: 0.7;
    transition-duration: 0.3s;
}

.filtres {
    transition-property: 0.5s;
    z-index: 2;

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

#filter3,
#filter4 {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(2, 1fr);
    gap: 5px;
    align-items: center;
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
</style>