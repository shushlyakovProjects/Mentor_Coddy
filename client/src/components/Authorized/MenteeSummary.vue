<template>
    <div>
        <main class="wrapper">

            <header ref="summary_header">
                <div>
                    <h2>Сводка (Ментор = Шушляков Н)</h2>
                </div>

                <nav>
                    <button @click="uploadToDataBaseForSummary('weekly')" title="Начать недельный отсчёт">Еженедельная
                        фиксация</button>
                    <button @click="uploadToDataBaseForSummary('monthly')" title="Начать месячный отсчёт">Ежемесячная
                        фиксация</button>
                </nav>
            </header>

            <div class="summary_wrapper">

                <!-- Общая информация -->
                <div class="summary_wrapper-item">
                    <div class="summary__card">
                        <h3>Общая информация:</h3>
                        <p>Всего менти на данный момент: {{ fields.countOfMentee }}</p>
                        <p>Всего постоянных учеников: {{ fields.countOfConstantUnits }}</p>
                    </div>
                    <div class="summary_before">
                        <h3>Дополнительно</h3>
                        <p>Всего отправлено модулей на проверку: {{ fields.countOfPaidModules }}</p>
                    </div>
                    <div class="summary__card">
                        <h3>Количество менти</h3>
                        <p>С постоянными учениками: {{ fields.countOfMenteeWithConstantUnits }}</p>
                        <p>Без постоянных учеников: {{ fields.countOfMenteeWithoutConstantUnits }}</p>
                        <p>Занятых: {{ (fields.countOfMenteeWithConstantUnits / fields.countOfMentee * 100).toFixed(2)
                            }}%</p>
                    </div>
                </div>

                <!-- Менти прибывшие/завершившие -->
                <div class="summary_wrapper-item">
                    <div class="summary__card">
                        <h3>Менти прибывшие:</h3>
                        <p v-for="(item, index) in getAddedMenteeList">* {{ item.LastName }} {{ item.FirstName }}
                            <a :href='`https://coddy.t8s.ru/Profile/${item.Id}`' target="_blank">CRM</a>
                        </p>
                    </div>

                    <div class="summary__card">
                        <h3>Менти завершившие:</h3>
                        <p v-for="(item, index) in getExcludedMenteeList">
                            * {{ item.LastName }} {{ item.FirstName }}
                            <a :href='`https://coddy.t8s.ru/Profile/${item.MenteeId}`' target="_blank">CRM</a>
                            ({{ item.Status }})
                        </p>
                    </div>

                    <div class="loading" v-if="!fields.countOfMentee"></div>
                </div>

                <!-- ЗА НЕДЕЛЮ -->
                <div class="summary_wrapper-item">
                    <div class="summary__card">
                        <h3>Отчет за неделю</h3>
                        <p>Предыдущая сводка: {{ getPreviousSummaryWeekly.DateOfUpdate }}</p>
                    </div>
                    <div class="summary__card">
                        <p>Менти новых: {{ getAddedMenteeList.length }}</p>
                        <p>Получено учеников: {{ getDifference(getPreviousSummaryWeekly.CountOfConstantUnits,
                            fields.countOfConstantUnits) }}</p>
                        <p>Проведено пробников: {{ fields.countOfNewTrials - getPreviousSummaryWeekly.СountOfNewTrials
                        }}
                        </p>
                        <p>Отправлено модулей: {{ getPreviousSummaryWeekly.CountOfPaidModules }}</p>
                    </div>
                </div>

                <!-- ЗА МЕСЯЦ -->
                <div class="summary_wrapper-item">
                    <div class="summary__card">
                        <h3>Отчет за месяц</h3>
                        <p>Предыдущая сводка: {{ getPreviousSummaryMonthly.DateOfUpdate }}</p>
                    </div>
                    <div class="summary__card">
                        <p>Менти новых: {{ getAddedMenteeList.length }}</p>
                        <p>Получено учеников: {{
                            getDifference(getPreviousSummaryMonthly.CountOfConstantUnits, fields.countOfConstantUnits)
                            }}
                        </p>
                        <p>Проведено пробников: {{ fields.countOfNewTrials -
                            getPreviousSummaryMonthly.СountOfNewTrials }}
                        </p>
                        <p>Отправлено модулей: {{ getPreviousSummaryMonthly.CountOfPaidModules }}</p>
                    </div>
                </div>
            </div>

        </main>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            // MENTEE_LIST: [],

            fields: {
                countOfMentee: 0,

                countOfNewTrials: 0,

                countOfMenteeWithConstantUnits: 0,
                countOfMenteeWithoutConstantUnits: 0,

                countOfConstantUnits: 0,
                countOfPaidModules: 0,
            },
        }
    },
    mounted() {
        this.getMenteeData()
        this.updateFields()
        this.getSummaryFromDataBase()
        if (this.getFeedbackList.length == 0) { this.$store.dispatch('downloadFeedbackFromDatabase') }
    },
    computed: {
        ...mapGetters(['getMenteeListOnlyShushlyakov', 'getPreviousSummaryWeekly',
            'getPreviousSummaryMonthly', 'getAddedMenteeList', 'getExcludedMenteeList', 'getFeedbackList'])
    },
    watch: {
        getMenteeListOnlyShushlyakov() { this.updateFields() },
    },
    methods: {
        getSummaryFromDataBase() {
            this.$store.dispatch('downloadSummaryFromDataBase')
        },
        uploadToDataBaseForSummary(period) {
            const { countOfMentee, countOfNewEdUnits, countOfNewTrials, countOfMenteeWithConstantUnits, countOfConstantUnits, countOfPaidModules } = this.fields
            const data = { period, countOfMentee, countOfNewEdUnits, countOfNewTrials, countOfMenteeWithConstantUnits, countOfConstantUnits, countOfPaidModules }
            if (confirm('Уверены, что хотите начать отсчет с текущего дня?')) {
                this.$store.dispatch('uploadToDataBaseForSummary', data)
            }

        },
        updateFields() {
            const LIST = this.getMenteeListOnlyShushlyakov
            this.fields.countOfMentee = LIST.length

            // let LIST_PREV_SUMMARY = new Map(Object.entries(this.getPreviousSummaryWeekly))
            // console.log(LIST_PREV_SUMMARY);

            this.fields.countOfConstantUnits = 0
            this.fields.countOfNewTrials = 0

            LIST.forEach(mentee => {
                this.fields.countOfConstantUnits += mentee.InfoEdUnits.CountConstantUnits
                this.fields.countOfNewTrials += mentee.InfoEdUnits.CountTrialUnitsForWeek

                if (mentee.InfoEdUnits.CountConstantUnits > 0) {
                    this.fields.countOfMenteeWithConstantUnits++
                } else {
                    this.fields.countOfMenteeWithoutConstantUnits++
                }

                // Если обратная связь данного менти найдена в БД. То достаем данные
                let hisFeedbak = this.getFeedbackList.find((feedback) => feedback.FIO.includes(mentee.LastName))
                if (hisFeedbak != undefined) {
                    this.fields.countOfPaidModules += hisFeedbak.CountPaidModules
                }

            });
        },
        async getMenteeData() {
            if (this.getMenteeListOnlyShushlyakov.length == 0) { await this.$store.dispatch('downloadMenteeData') }
        },
        getDifference(oldVal = 0, newVal = 0) {
            return (newVal - oldVal) >= 0 ? '+' + (newVal - oldVal) : (newVal - oldVal)
        },
    },
}
</script>

<style scoped>
.wrapper header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

header nav {
    display: flex;
    gap: 10px;
}

.summary_wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.summary_wrapper-item {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid gray;
    padding: 10px;
    border-radius: 10px;
}
</style>