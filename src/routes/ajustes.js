const express = require('express')
const router = express.Router()
const myConn = require('../db')
const { isLoggedIn } = require('../lib/auth')
const { saveLog } = require('../lib/logs')

router.get('/', isLoggedIn, async (req, res) => {
    const ajustes = await myConn.query("SELECT * FROM ajustes")
    saveLog(req.user.USERNAME, 'Visualizacion de pantalla de ajustes.', 'LECTURA')
    res.render('ajustes/ajustes', { dataAjustes: ajustes[0]})
})

router.post('/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params

    const { hora_init_caja, hora_final_caja, min_db} = req.body

    const newAjuste = {
        hora_init_caja,
        hora_final_caja,
        min_db
    }

    try {
        await myConn.query("UPDATE ajustes set ? WHERE ID = ?", [newAjuste, id])
        req.flash("success", `Ajustes actualizados correctamente. Para que el cambio en el tiempo de respaldo surta efecto, deberá reiniciar la aplicación.`)
    } catch (err) {
        console.log(err)
        req.flash("warning", "Hubo en error, intente nuevamente")
    }

    saveLog(req.user.USERNAME, 'Actualizacion datos de ajustes generales.', 'ACTUALIZACION')
    res.redirect('/ajustes')
})

module.exports = router