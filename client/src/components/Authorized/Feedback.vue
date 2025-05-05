<template>
    <div>
        <main class="wrapper">

            <header ref="summary_header">
                <div>
                    <h2>Обратная связь от менти</h2>
                </div>

                <nav>
                    <button @click="$router.push('/mentee/feedback')" title="Просмотр формы сбора ОС">Форма</button>
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
                </div>

                <div class="feedback_wrapper-flex">
                    <div class="feedback_row" v-for="(item, index) in getFeedbackList">
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
                        <p class="small">{{ item.Comments }}</p>
                        <p class="small">{{ item.HasConstantUnit }}</p>
                        <p class="small">{{ item.HasConstantUnit == 'да' ? item.CountConstantUnits : '-' }}</p>
                        <p class="small">{{ item.HasConstantUnit != 'да' ? item.CountPaidModules : '-' }}</p>
                        <p class="small">{{ item.HasConstantUnit != 'да' ? item.CountTrialUnits : '-' }}</p>
                    </div>
                </div>
            </div>




        </main>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {

        }
    },
    mounted() {
        this.getFeedbackFromDatabase()
    },
    computed: { ...mapGetters(['getFeedbackList']) },
    methods: {
        getFeedbackFromDatabase() {
            this.$store.dispatch('downloadFeedbackFromDatabase')
        },
        formatDate(origDate) {
            const date = new Date(origDate)
            const min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()
            const hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
            const day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()
            const month = (date.getMonth() < 10) ? '0' + date.getMonth() : date.getMonth()
            const year = date.getFullYear()
            return `${day}.${month}.${year} ${hour}:${min}`
        },
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

.feedback_header,
.feedback_row {
    display: grid;
    grid-template-columns: 20px 80px 1fr 1fr 1fr 1fr 3fr repeat(4, 40px);
    gap: 15px;
}

.feedback_row {
    background-color: var(--color_background-4_white);
    max-height: 50px;
    overflow: hidden;
    border-radius: 10px;
}
.feedback_header p,
.feedback_row p{
    padding: 5px;
}

.feedback_row:hover {
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
</style>