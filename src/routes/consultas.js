const express = require("express");
const router = express.Router();
const consultasController = require("../controllers/consultasController");
const { isLoggedIn } = require("../lib/auth");

// Ver compras
router.get("/compras", isLoggedIn, consultasController.listCompras);

// JSON Compras
router.get("/compras/listado", isLoggedIn, consultasController.totalCompras);

// Ver compras por rango de fechas
router.get(
    "/compras/fecha/:fechain/:fechaout",
    isLoggedIn,
    consultasController.findCompraByDate
);

// Ver detalle de la compra
router.get(
    "/compras/detalle/:id",
    isLoggedIn,
    consultasController.getCompraByID
);

// Ver Ventas
router.get("/ventas", isLoggedIn, consultasController.listVentas);

// JSON Ventas
router.get("/ventas/listado", isLoggedIn, consultasController.totalVentas);

// Ver ventas por rango de fechas
router.get(
    "/ventas/fecha/:fechain/:fechaout",
    isLoggedIn,
    consultasController.findVentaByDate
);

// Ver detalle de la compra
router.get("/ventas/detalle/:id", isLoggedIn, consultasController.getVentaByID);

/* Consulta de Devoluciones */
router.get("/devoluciones", isLoggedIn, consultasController.listDevoluciones);

router.get(
    "/devoluciones/detalle/:id",
    isLoggedIn,
    consultasController.getDevolucionById
);

/* Consulta de Arqueo */
router.get("/arqueos", isLoggedIn, consultasController.listArqueos);

router.get("/arqueos/edit/:id", isLoggedIn, consultasController.getArqueoById);

router.post("/arqueos/edit/:id", isLoggedIn, consultasController.revisarArqueo);

/* Tickets */
router.get("/tickets", isLoggedIn, consultasController.listTickets);

router.get("/tickets/edit/:id", isLoggedIn, consultasController.getTicketById);

router.post(
    "/tickets/edit/:id",
    isLoggedIn,
    consultasController.finalizarTicket
);

module.exports = router;
