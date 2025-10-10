<template>
    <form class="filtres" v-on:submit.prevent="this.$emit('filterStart', filter)">

        <div class="filtres__item forMobile">
            <h2>Фильтр</h2>
            <img @click="this.$emit('getFeedbackFromDatabase')" class="likeButton icon"
                src="../../../public/img/delete.svg" title="Очистить фильтры" alt="Отмена">
        </div>


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
                <label for="filter3_asc">↗️<input id="filter3_asc" type="radio" value="asc" name="sortOfEdUnits"
                        v-model="filter.sortOfEdUnits"></label>
                <label for="filter3_desc">↘️<input id="filter3_desc" type="radio" value="desc" name="sortOfEdUnits"
                        v-model="filter.sortOfEdUnits"></label>
            </div>
        </div>
        <div class="filtres__item">
            <p class="small">Отработано часов</p>
            <div id="filter4">
                <label for="filter4_asc">↗️<input id="filter4_asc" type="radio" value="asc" name="sortOfWorkHours"
                        v-model="filter.sortOfWorkHours"></label>
                <label for="filter4_desc">↘️<input id="filter4_desc" type="radio" value="desc" name="sortOfWorkHours"
                        v-model="filter.sortOfWorkHours"></label>
            </div>
        </div>
        <div class="filtres__item">
            <p class="small">Дней работает </p>
            <div id="filter5">
                <input type="text" placeholder="От" maxlength="3" v-model="filter.workDays.min">
                <input type="text" placeholder="До" maxlength="3" v-model="filter.workDays.max">
            </div>
        </div>
        <div class="filtres__item">
            <p class="small">ОС после</p>
            <div id="filter5">
                <input type="date" v-model="filter.feedbackDate">
            </div>
        </div>
        <!-- <label for="filter6" class="filtres__item">
            <p class="small">Ментор Шушляков Н</p>
            <input type="checkbox" id="filter6" v-model="filter.menteesOfShushlyakov">
        </label> -->
        <label for="filter7" class="filtres__item">
            <p class="small">Раскраска</p>
            <input type="checkbox" id="filter7" v-model="filter.backLight">
        </label>

        <input type="submit" value="Применить">
    </form>
</template>

<script>
export default {
    data() {
        return {
            filter: {
                // menteesOfShushlyakov: true, // Временный фильтр
                disciplines: '',
                fioInclude: '',
                sortOfEdUnits: '', // asc - desc
                sortOfWorkHours: '', // asc - desc
                workDays: { min: 0, max: 360 },
                backLight: false,
                feedbackDate: ''
            },
        }
    },
    watch: {
        'filter.fioInclude'(newValue, oldValue) {
            const regex = /^[А-Яа-яЁё\s]*$/
            if (!regex.test(newValue)) { this.filter.fioInclude = oldValue }
        },
        'filter.backLight'() { this.$emit('backLight', this.filter.backLight) }
    },
    methods: {
        clearFiltres() {
            this.filter = {
                // menteesOfShushlyakov: true, // Временный фильтр
                disciplines: '',
                fioInclude: '',
                sortOfEdUnits: '', // asc - desc
                sortOfWorkHours: '', // asc - desc
                workDays: { min: 0, max: 360 },
                backLight: false,
                feedbackDate: ''
            }
        }
    },
}
</script>

<style scoped>
@import "@/assets/css/menteelistfilter.css";
@import "@/assets/css/media/menteelistfilter_media.css";
</style>