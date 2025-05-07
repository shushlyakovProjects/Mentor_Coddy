const express = require('express')
const router = express.Router()
const connectionDB = require('./connectionDB')

router.post('/newFeedback', async (request, response) => {
    console.log('Новая обратная связь!');
    const { FIO, Phone, HasConstantUnit, CheckInfo, Comments, CountTrialUnits, CountConstantUnits, CountPaidModules, NewLoad } = request.body

    const SQL_QUERY = `INSERT INTO feedbacks(FeedBackID, Date, FIO, Phone, CheckInfo, Comments, NewLoad, HasConstantUnit, CountConstantUnits, CountPaidModules, CountTrialUnits) 
    VALUES(null, '${new Date()}', '${FIO}', '${Phone}', '${CheckInfo}', '${Comments}', '${NewLoad}', '${HasConstantUnit}', '${CountConstantUnits}', '${CountPaidModules}', '${CountTrialUnits}')`

    connectionDB.query(SQL_QUERY, (error, result) => {
        if (error) { response.status(500).send('Ошибка базы данных. Попробуйте позже :(')}
        else {response.status(200).send('Обратная связь отправлена. Спасибо!')}
    })
})

module.exports = router