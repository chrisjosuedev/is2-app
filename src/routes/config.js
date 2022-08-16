const express = require('express')
const router = express.Router()
const confController = require('../controllers/configController')
const { isLoggedIn } = require('../lib/auth')

// Settings
// /usuarios
router.get('/usuarios',isLoggedIn, confController.listUsuarios)

// /usuarios by ID Empleado
router.get('/usuarios/empleados/:id',isLoggedIn, confController.getUserByIdEmpleado)

// Eliminar Usuario
router.get('/usuarios/anular/:username',isLoggedIn, confController.deleteUsuario)

// POST Usuario
router.post('/usuarios/new',isLoggedIn, confController.newUsuario)

// --- Edit Usuario
router.get('/usuarios/:username',isLoggedIn, confController.getEmpleadoByUser)

router.post('/usuarios/edit/:username',isLoggedIn, confController.editUser)

// --- Laboral
router.get('/roles', isLoggedIn, confController.getLaboral)

// --------- PERFIL
router.get('/mi-perfil', isLoggedIn, confController.verPerfil)

router.get('/mi-perfil/edit/:username',isLoggedIn, confController.getEditPerfil)

router.post('/mi-perfil/edit/:username',isLoggedIn, confController.EditPerfil)

router.post('/recovery-password/:username', isLoggedIn, confController.recoveryPassword)

module.exports = router