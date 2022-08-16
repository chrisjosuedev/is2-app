const fs = require('fs')

/* Home Path */
const homeDir = require('os').homedir()

const invoiceDir = homeDir + '\\.is2-solutions\\facturas'
const uploadsDir = homeDir + '\\.is2-solutions\\.uploads'
const dataBaseBackupsDir = homeDir + '\\.is2-solutions\\db'

/* Create Invoices Directory */
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true })
}

/* Create DB Directory */
if (!fs.existsSync(dataBaseBackupsDir)) {
  fs.mkdirSync(dataBaseBackupsDir, { recursive: true })
}

/* Create Uploader Directory */
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

module.exports = { invoiceDir, dataBaseBackupsDir, uploadsDir }