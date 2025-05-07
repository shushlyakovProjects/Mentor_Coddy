<template>
    <div class="wrapper">
        <main>
            <header v-if="!message.success">
                <h2>Обратная связь ментору</h2>
                <p>Привет! ✌️</p>
                <p>Если Вы здесь, значит пора актуализировать информацию!</p>
                <p>Пройдите, пожалуйста, небольшой опрос, заполнив все поля ниже</p>
            </header>

            <form v-if="!message.success" class="fields" @submit.prevent="sendFeedback()">
                <div class="fields__item">
                    <p class="fields__item-question">Преподаватель</p>
                    <p class="input_wrapper">
                        <input type="text" v-model="fields.FIO" placeholder="Укажите вашу фамилию и имя" tabindex="1">
                    </p>
                </div>

                <div class="fields__item">
                    <p class="fields__item-question">Номер телефона</p>
                    <p class="input_wrapper">
                        <input type="text" v-model="fields.Phone" maxlength="20"
                            placeholder="Укажите ваш контактный телефон" tabindex="2">
                    </p>
                </div>

                <div class="fields__item">
                    <p class="fields__item-question">Есть постоянный ученик?</p>
                    <div class="fields__item-column">
                        <label for="HasConstantUnit_0" tabindex="3">Пока нет
                            <input type="radio" id="HasConstantUnit_0" v-model="fields.HasConstantUnit" value="Нет">
                        </label>
                        <label for="HasConstantUnit_1" tabindex="4">Да!
                            <input type="radio" id="HasConstantUnit_1" v-model="fields.HasConstantUnit" value="Да">
                        </label>
                        <label for="HasConstantUnit_2" tabindex="5">Был ПУ, жду результат
                            <input type="radio" id="HasConstantUnit_2" v-model="fields.HasConstantUnit"
                                value="Жду результат">
                        </label>
                    </div>
                </div>

                <div class="fields__item"
                    v-if="fields.HasConstantUnit == 'Нет' || fields.HasConstantUnit == 'Жду результат'">
                    <p class="fields__item-question">Сколько проведено пробных уроков?</p>
                    <div class="fields__item-row">
                        <label for="CountTrialUnits_0" tabindex="6">0<input id="CountTrialUnits_0" type="radio"
                                v-model="fields.CountTrialUnits" value="0"></label>
                        <label for="CountTrialUnits_1" tabindex="7">1<input id="CountTrialUnits_1" type="radio"
                                v-model="fields.CountTrialUnits" value="1"></label>
                        <label for="CountTrialUnits_2" tabindex="8">2<input id="CountTrialUnits_2" type="radio"
                                v-model="fields.CountTrialUnits" value="2"></label>
                        <label for="CountTrialUnits_3" tabindex="9">3<input id="CountTrialUnits_3" type="radio"
                                v-model="fields.CountTrialUnits" value="3"></label>
                        <label for="CountTrialUnits_4" tabindex="10">4<input id="CountTrialUnits_4" type="radio"
                                v-model="fields.CountTrialUnits" value="4"></label>
                        <label for="CountTrialUnits_5" tabindex="11">5<input id="CountTrialUnits_5" type="radio"
                                v-model="fields.CountTrialUnits" value="5"></label>
                        <label for="CountTrialUnits_6" tabindex="12">6<input id="CountTrialUnits_6" type="radio"
                                v-model="fields.CountTrialUnits" value="6"></label>
                        <label for="CountTrialUnits_7" tabindex="13">7<input id="CountTrialUnits_7" type="radio"
                                v-model="fields.CountTrialUnits" value="7"></label>
                        <label for="CountTrialUnits_8" tabindex="14">8<input id="CountTrialUnits_8" type="radio"
                                v-model="fields.CountTrialUnits" value="8"></label>
                    </div>
                </div>

                <div class="fields__item" v-if="fields.HasConstantUnit == 'Да'">
                    <p class="fields__item-question">Сколько постоянных учеников на данный момент?</p>
                    <div class="fields__item-row">
                        <label for="CountConstantUnits_1" tabindex="15">1<input id="CountConstantUnits_1" type="radio"
                                v-model="fields.CountConstantUnits" value="1"></label>
                        <label for="CountConstantUnits_2" tabindex="16">2<input id="CountConstantUnits_2" type="radio"
                                v-model="fields.CountConstantUnits" value="2"></label>
                        <label for="CountConstantUnits_3" tabindex="17">3<input id="CountConstantUnits_3" type="radio"
                                v-model="fields.CountConstantUnits" value="3"></label>
                        <label for="CountConstantUnits_4" tabindex="18">4<input id="CountConstantUnits_4" type="radio"
                                v-model="fields.CountConstantUnits" value="4"></label>
                        <label for="CountConstantUnits_5" tabindex="19">5<input id="CountConstantUnits_5" type="radio"
                                v-model="fields.CountConstantUnits" value="5"></label>
                        <label for="CountConstantUnits_6" tabindex="20">6<input id="CountConstantUnits_6" type="radio"
                                v-model="fields.CountConstantUnits" value="6"></label>
                        <label for="CountConstantUnits_7" tabindex="21">7<input id="CountConstantUnits_7" type="radio"
                                v-model="fields.CountConstantUnits" value="7"></label>
                        <label for="CountConstantUnits_8" tabindex="22">8<input id="CountConstantUnits_8" type="radio"
                                v-model="fields.CountConstantUnits" value="8"></label>
                    </div>
                </div>

                <div class="fields__item" v-if="fields.HasConstantUnit == 'Да'">
                    <p class="fields__item-question">Сколько модулей отправлено на проверку?</p>
                    <div class="fields__item-row">
                        <label for="CountPaidModules_0" tabindex="23">0<input id="CountPaidModules_0" type="radio"
                                v-model="fields.CountPaidModules" value="0"></label>
                        <label for="CountPaidModules_1" tabindex="24">1<input id="CountPaidModules_1" type="radio"
                                v-model="fields.CountPaidModules" value="1"></label>
                        <label for="CountPaidModules_2" tabindex="25">2<input id="CountPaidModules_2" type="radio"
                                v-model="fields.CountPaidModules" value="2"></label>
                        <label for="CountPaidModules_3" tabindex="26">3<input id="CountPaidModules_3" type="radio"
                                v-model="fields.CountPaidModules" value="3"></label>
                        <label for="CountPaidModules_4" tabindex="27">4<input id="CountPaidModules_4" type="radio"
                                v-model="fields.CountPaidModules" value="4"></label>
                        <label for="CountPaidModules_5" tabindex="28">5<input id="CountPaidModules_5" type="radio"
                                v-model="fields.CountPaidModules" value="5"></label>
                        <label for="CountPaidModules_6" tabindex="29">6<input id="CountPaidModules_6" type="radio"
                                v-model="fields.CountPaidModules" value="6"></label>
                        <label for="CountPaidModules_7" tabindex="30">7<input id="CountPaidModules_7" type="radio"
                                v-model="fields.CountPaidModules" value="7"></label>
                        <label for="CountPaidModules_8" tabindex="31">8<input id="CountPaidModules_8" type="radio"
                                v-model="fields.CountPaidModules" value="8"></label>
                    </div>
                </div>

                <div class="fields__item">
                    <p class="fields__item-question">Всё верно?</p>
                    <ul>
                        <li class="small mark">С Дарьей (Куратор ПУ +375 29 386-23-91) связывались, слоты
                            актуальны!</li>
                        <li class="small mark">В СРМ дисциплины актуальны!</li>
                        <li class="small mark">В чате "ПОИСК ПЕДАГОГОВ" в WhatsApp нахожусь</li>
                        <li class="small mark">В чате "Новички CODDY" в Telegram нахожусь</li>
                        <li class="small mark">С регламентом ПУ ознакомлен</li>
                    </ul>
                    <div class="fields__item-column">
                        <label for="CheckInfo_0" tabindex="32">Да, всё верно!<input type="radio" id="CheckInfo_0"
                                v-model="fields.CheckInfo" value="Всё верно"></label>
                        <label for="CheckInfo_1" tabindex="33">Нет, нужна помощь<input type="radio" id="CheckInfo_1"
                                v-model="fields.CheckInfo" value="Нужна помощь"></label>
                    </div>
                </div>

                <div class="fields__item">
                    <p class="fields__item-question">Нагрузку?</p>
                    <div class="fields__item-column">
                        <label for="NewLoad_0" tabindex="34">Набираю!<input type="radio" id="NewLoad_0"
                                v-model="fields.NewLoad" value="Набираю"></label>
                        <p class="input_wrapper">
                            <input @click="fields.NewLoad = ''" type="text" id="NewLoad_1" v-model="fields.NewLoad"
                                placeholder="Пока нет, причина:" tabindex="35">
                        </p>
                    </div>
                </div>

                <div class="fields__item">
                    <p class="fields__item-question">Комментарии, вопросы, проблемы</p>
                    <p class="input_wrapper">
                        <input type="text" v-model="fields.Comments" placeholder="Расскажи, как твои дела?"
                            tabindex="36"></input>
                    </p>
                </div>

                <p class="small error_message">{{ message.error }}</p>

                <nav>
                    <input type="submit" value="Отправить обратную связь" tabindex="37" />
                    <input type="reset" value="Очистить">
                </nav>
            </form>

            <header class="sended_success" v-if="message.success">
                <p>{{ message.success }}</p>
                <p>💛</p>
            </header>
        </main>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            fields: {
                FIO: '',
                Phone: '',
                HasConstantUnit: '', // нет - да - жду результат
                CheckInfo: '',
                Comments: '',
                CountTrialUnits: '',
                CountConstantUnits: '',
                CountPaidModules: '',
                NewLoad: ''
            },
            message: { error: '', success: '' }
        }
    },
    watch: {
        'fields.Phone'() {
            let str = this.fields.Phone
            let rgx = /^(\+|\d)?(\d)*$/
            if (!rgx.test(str)) {
                this.fields.Phone = str.slice(0, -1)
            }
        }
    },
    mounted() {
        if (localStorage.FIO && localStorage.Phone) {
            this.fields.FIO = localStorage.FIO
            this.fields.Phone = localStorage.Phone
        }
        document.addEventListener('keydown', (event) => {
            if (event.code == 'Enter') {
                document.activeElement.click()
            }
        })
    },
    methods: {
        async sendFeedback() {
            let { FIO, Phone, HasConstantUnit, CheckInfo, Comments, CountTrialUnits, CountConstantUnits, CountPaidModules, NewLoad } = this.fields
            let FeedBack = {}
            if (FIO && Phone && CheckInfo && Comments && NewLoad && HasConstantUnit) {
                if (HasConstantUnit == 'Да') {
                    if (CountConstantUnits != '' && CountPaidModules != '') {
                        CountTrialUnits = 0
                        FeedBack = { FIO, Phone, CheckInfo, Comments, NewLoad, HasConstantUnit, CountConstantUnits, CountPaidModules, CountTrialUnits }
                    } else { this.message.error = 'Заполните все поля'; }
                }
                if (HasConstantUnit == 'Нет' || HasConstantUnit == 'Жду результат') {
                    if (CountTrialUnits) {
                        CountConstantUnits = 0
                        CountPaidModules = 0
                        FeedBack = { FIO, Phone, CheckInfo, Comments, NewLoad, HasConstantUnit, CountTrialUnits }
                    } else { this.message.error = 'Заполните все поля'; }
                }
            } else { this.message.error = 'Заполните все поля'; }

            if (FeedBack.FIO) {
                this.message.error = ''
                await axios.post('/server/from-mentee/newFeedback', FeedBack)
                    .then((result) => {
                        this.message.success = result.data
                        localStorage.setItem('FIO', FIO);
                        localStorage.setItem('Phone', Phone);
                    })
                    .catch((error) => {
                        this.message.error = error.response.data
                    })

                console.log('Данные отправлены, спасибо!');

            }

        }
    },
}
</script>

<style scoped>
input[type="radio"] {
    display: none;
}

.wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

header {
    margin-bottom: 10px;
    padding: 10px 15px;
    background-color: var(--color_accent_lightBlue);
    color: var(--color_background-2_white);
    border-radius: 10px;
}
header.sended_success{
    text-align: center;
}
header h2 {
    margin-bottom: 6px;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.fields nav {
    display: flex;
    justify-content: space-between;
}

.fields__item {
    background-color: var(--color_background-1_white);
    padding: 10px 15px;
    border-radius: 10px;
}

.fields__item-question {
    margin-bottom: 5px;
    font-weight: bold;
}

.fields__item input[type="text"],
.fields__item textarea {
    padding: 10px 5px;
    background-color: transparent;
    width: 100%;
}

.fields__item ul {
    margin: 10px 0;
}

.input_wrapper {
    position: relative;
}

.input_wrapper::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: var(--color_accent_lightBlue);
}

.input_wrapper:has(input:focus)::before {
    height: 2px;
    background-color: var(--color_accent_pink);
}


.fields__item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.fields__item label {
    transition-duration: 0.1s;
    padding: 5px;
    border-radius: 10px;
}

.fields__item-row label {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
    cursor: pointer;
    user-select: none;
}

.fields__item-column {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label:focus,
.fields__item label:hover,
.fields__item textarea:hover {
    background: var(--color_background-2_white);
    outline-color: var(--color_accent_pink);
}

.fields__item label:has(input:checked) {
    background: var(--color_accent_pink);
}

.mark {
    padding-left: 20px;
    position: relative;
}

.mark::before {
    content: '✔';
    position: absolute;
    left: 0;
    color: var(--color_accent_lightBlue);
}
</style>