const express = require('express')
const router = express.Router()
const analiticasController = require('../controllers/analiticasController')
const { isLoggedIn } = require('../lib/auth')

/* -----------------  Analiticas de Ventas ------------------- */

/* Render Analiticas de Ventas */
router.get('/ventas',isLoggedIn, analiticasController.ventasAnaliticas)

// Ventas por Dia
router.get('/ventas/diarias',isLoggedIn, analiticasController.ventasDiarias)

// Ventas por Mes
router.get('/ventas/mensuales',isLoggedIn, analiticasController.ventasMensuales)

// Articulos más vendidos
router.get('/ventas/articulos/masvendidos',isLoggedIn, analiticasController.articulosMasVendidos)

// Clientes con mayores compras
router.get('/ventas/clientes/masvendidos',isLoggedIn, analiticasController.clientesMasVendidos)

/* -----------------  Analiticas de Compras ------------------- */
/* Render Analiticas de Compras */
router.get('/compras',isLoggedIn, analiticasController.comprasAnaliticas)

// Compras por Dia
router.get('/compras/diarias',isLoggedIn, analiticasController.comprasDiarias)

// Ventas por Mes
router.get('/compras/mensuales',isLoggedIn, analiticasController.comprasMensuales)

// Articulos más vendidos
router.get('/compras/articulos/mascomprados',isLoggedIn, analiticasController.articulosMasComprados)

// Clientes con mayores compras
router.get('/compras/proveedores/mascomprados',isLoggedIn, analiticasController.proveedoresMasCompras)


module.exports = router

