const myConn = require('../db')

module.exports = {
    async saveLog (username, accion, tipo) {
        const newBitacora = {
            username, 
            accion, 
            tipo
        }
        try {
            await myConn.query("INSERT INTO logs set ?", [newBitacora])
        } catch (err) {
            console.log(err)
        }
        
    }
}