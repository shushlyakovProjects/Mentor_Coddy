<template>
    <form class="filtres" v-show="filterIsOpen" v-on:submit.prevent="this.$emit('filterStart', filter)">
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
/* Настройка фильтров */
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
    margin: 2px 5px;
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

#filter5 input[type='text'] {
    width: 50px;
}
</style>