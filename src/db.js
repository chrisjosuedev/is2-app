const mysql = require('mysql')
const { promisify } = require('util')
const { database } = require('./keys')
const myConn = mysql.createPool(database)

myConn.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('DATABASE CONNECTION WAS CLOSED')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('DATABASE HAS TO MANY CONNECTIONS')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNECTION WAS REFUSED')
        }
    }
    if (connection) connection.release()
    console.log('DB Conected Succesfully')
    return
})


myConn.query = promisify(myConn.query)

module.exports = myConn