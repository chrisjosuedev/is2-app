const express = require('express')
const router = express.Router()
const personController = require('../controllers/personaController')
const { isLoggedIn } = require('../lib/auth')

// Clientes
router.get('/clientes',isLoggedIn, personController.listClientes)

/* POST CLIENTES */
router.post('/clientes/new',isLoggedIn, personController.newCliente)

// Edit Clientes
router.get('/clientes/:id',isLoggedIn, personController.getClienteById)

router.post('/clientes/edit/:id',isLoggedIn, personController.editCliente)

// Eliminar
router.get('/clientes/delete/:id',isLoggedIn, personController.deleteCliente)

// Empleados
router.get('/empleados',isLoggedIn, personController.listEmpleados)

/* POST EMPLEADOS */
router.post('/empleados/new',isLoggedIn, personController.newEmpleado)

// Edit Empleado
router.get('/empleados/:id',isLoggedIn, personController.getEmpleadoById)

router.post('/empleados/edit/:id',isLoggedIn, personController.editEmpleado)

// Anular Empleado
router.get('/empleados/anular/:id',isLoggedIn, personController.deleteEmpleado)

// -- GET Empleados JSON
//router.get('/empleados/:id', personController.getEmpleadobyIdPersona)


// Busqueda de Persona
router.get('/general/:id',isLoggedIn, personController.getPersonaById)


// Lugares JSON
router.get('/ciudad/:id',isLoggedIn, personController.getDeptoByCiudad)

module.exports = router