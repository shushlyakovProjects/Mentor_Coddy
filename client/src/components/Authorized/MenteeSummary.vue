<template>
    <div>
        <main class="wrapper">

            <header ref="summary_header">
                <div>
                    <h2>Сводка (Ментор = Шушляков Н)</h2>
                </div>

                <nav>
                    <button @click="uploadToDataBaseForSummary()" title="Начать недельный отсчёт">Еженедельная фиксация</button>
                </nav>
            </header>

            <div class="summary_wrapper">

                <div class="summary_wrapper-flex">
                    <div class="summary__card">
                        <h3>Общая информация:</h3>
                        <p>Предыдущая сводка: {{ getPreviousSummary.DateOfUpdate }}</p>
                        <p>Всего менти на данный момент: {{ fields.countOfMentee }}</p>
                        <p>Всего постоянных учеников: {{ fields.countOfConstantUnits }}</p>
                    </div>
                    <div class="summary__card">
                        <h3>С последней загрузки (еженедельная)</h3>
                        <p>Менти новых: {{ getAddedMenteeList.length }}</p>
                        <p>Получено учеников: {{
                            getDifference(getPreviousSummary.CountOfConstantUnits, fields.countOfConstantUnits ) }}
                        </p>
                        <p>Проведено пробников: {{ fields.countOfNewTrials -
                            getPreviousSummary.СountOfNewTrials }}
                        </p>
                        <p>Отправлено модулей с прошлой недели: {{ getPreviousSummary.CountOfPaidModules }}</p>
                    </div>
                    <div class="summary_before">
                        <h3>Дополнительно</h3>
                        <p>Всего отправлено модулей на проверку: {{ fields.countOfPaidModules }}</p>
                    </div>
                </div>

                <div class="summary_wrapper-flex">
                    <div class="summary__card">
                        <h3>Количество менти</h3>
                        <p>С постоянными учениками: {{ fields.countOfMenteeWithConstantUnits }}</p>
                        <p>Без постоянных учеников: {{ fields.countOfMenteeWithoutConstantUnits }}</p>
                        <!-- <p>Получили постоянных учеников: {{ fields.countOfMenteeWithConstantUnits -
                            getPreviousSummary.CountOfMenteeWithConstantUnits > 0 ?
                            fields.countOfMenteeWithConstantUnits -
                            getPreviousSummary.CountOfMenteeWithConstantUnits : 0 }}
                        </p> -->
                        <p>Занятых: {{ (fields.countOfMenteeWithConstantUnits / fields.countOfMentee *
                            100).toFixed(2) }}%
                        </p>
                    </div>
                    <div class="summary__card">
                        <h3>Менти прибывшие:</h3>
                        <p v-for="(item, index) in getAddedMenteeList">* {{ item.LastName }} {{ item.FirstName }}
                            <a :href='`https://coddy.t8s.ru/Profile/${item.Id}`' target="_blank">CRM</a>
                        </p>
                    </div>

                    <div class="summary__card">
                        <h3>Менти завершившие:</h3>
                        <p v-for="(item, index) in getExcludedMenteeList">* {{ item.LastName }} {{ item.FirstName }}
                            <a :href='`https://coddy.t8s.ru/Profile/${item.Id}`' target="_blank">CRM</a>
                        </p>
                    </div>

                    <div class="loading" v-if="!fields.countOfMentee"></div>
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

                countOfNewMentee: 0,
                countOfNewEdUnits: 0,
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
    },
    computed: { ...mapGetters(['getMenteeListOnlyShushlyakov', 'getPreviousSummary', 'getAddedMenteeList', 'getExcludedMenteeList']) },
    watch: {
        getMenteeListOnlyShushlyakov() { this.updateFields() },
    },
    methods: {
        getSummaryFromDataBase() {
            if (this.getPreviousSummary.length == 0) { this.$store.dispatch('downloadSummaryFromDataBase') }
        },
        uploadToDataBaseForSummary() {
            const { countOfMentee, countOfNewEdUnits, countOfNewTrials, countOfMenteeWithConstantUnits, countOfConstantUnits, countOfPaidModules } = this.fields
            const data = { countOfMentee, countOfNewEdUnits, countOfNewTrials, countOfMenteeWithConstantUnits, countOfConstantUnits, countOfPaidModules }
            this.$store.dispatch('uploadToDataBaseForSummary', data)
        },
        updateFields() {
            const LIST = this.getMenteeListOnlyShushlyakov
            this.fields.countOfMentee = LIST.length

            // this.fields.countOfNewMentee = 0
            // this.fields.countOfNewEdUnits = 0

            // let LIST_PREV_SUMMARY = new Map(Object.entries(this.getPreviousSummary))
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
                // console.log(mentee);

            });

            // ПОЛУЧАТЬ ИНФОРМАЦИЮ С ОБРАТНОЙ СВЯЗИ
            // this.fields.countOfPaidModules = 0

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

.summary_wrapper {
    display: flex;
    gap: 120px;
}

.summary_wrapper-flex {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>