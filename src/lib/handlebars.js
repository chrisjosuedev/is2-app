const format = require('date-format')

const helpers = {}

helpers.format = (fecha) => {
    return format("dd/MM/yyyy", fecha)
}

helpers.hourFormat = (fecha) => {
    var time = new Date(fecha);
    return time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: "numeric", hour12: true })
};

module.exports = helpers