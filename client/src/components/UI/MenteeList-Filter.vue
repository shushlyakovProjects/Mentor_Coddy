<template>
    <form class="filtres" v-on:submit.prevent="this.$emit('filterStart', filter)">
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
            <p class="small">Длительность работы </p>
            <div id="filter4">
                <label for="filter4_asc">↗️<input id="filter4_asc" type="radio" value="asc" name="sortOfWorkTime"
                        v-model="filter.sortOfWorkTime"></label>
                <label for="filter4_desc">↘️<input id="filter4_desc" type="radio" value="desc" name="sortOfWorkTime"
                        v-model="filter.sortOfWorkTime"></label>
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
            <p class="small">ОС не позже</p>
            <div id="filter5">
                <input type="date" v-model="filter.feedbackDate">
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
</template>

<script>
export default {
    data() {
        return {
            filter: {
                menteesOfShushlyakov: false, // Временный фильтр
                disciplines: '',
                fioInclude: '',
                gender: '',
                sortOfEdUnits: '', // asc - desc
                sortOfWorkTime: '', // asc - desc
                workDays: { min: 0, max: 360 },
                backLight: false,
                feedbackDate: ''
            },
        }
    },
    watch: {
        'filter.backLight'() { this.$emit('backLight', this.filter.backLight) }
    }
}
</script>

<style scoped>
@import url(@/assets/css/menteelistfilter.css);
@import url(@/assets/css/media/menteelistfilter_media.css);
</style>