const express = require("express");
const router = express.Router();
const transaccionCont = require("../controllers/transaccionesController");
const { isLoggedIn, validRangoFactura, validArqueo, validVentas } = require("../lib/auth");

/** COMPRAS **/
router.get("/compras/new", isLoggedIn, transaccionCont.newCompra);

router.post("/compras/agregar", isLoggedIn, transaccionCont.addNewCompra);

router.get("/compras/anular/:id", transaccionCont.anularCompra);

router.get("/compras/anular", transaccionCont.anularUltimaCompra);

router.get("/compras/estatus/:id", transaccionCont.verificarEstatus);

/** FACTURAS **/
router.get(
    "/facturas/new",
    isLoggedIn,
    validRangoFactura,
    transaccionCont.newFactura
);

router.post("/facturas/agregar", isLoggedIn, transaccionCont.addNewFactura);

router.get(
    "/facturas/estatus/:id",
    isLoggedIn,
    transaccionCont.verificarEstatusVenta
);

router.get(
    "/facturas/anular/:id/:source",
    isLoggedIn,
    transaccionCont.anularFactura
);

/** Arqueos **/
router.get(
    "/arqueos/nuevo",
    isLoggedIn,
    validVentas,
    validArqueo,
    transaccionCont.newArqueo
);

router.post(
    "/arqueos/agregar",
    isLoggedIn,
    validArqueo,
    transaccionCont.agregarArqueo
);

/* Devoluciones */
router.get("/devoluciones/nuevo", isLoggedIn, transaccionCont.newDevolucion);

router.post(
    "/devoluciones/agregar",
    isLoggedIn,
    transaccionCont.agregarDevolucion
);

/* Get Factura para Devolucion */
router.get(
    "/devoluciones/factura/:id",
    isLoggedIn,
    transaccionCont.getFacturaById
);

router.get(
    "/devoluciones/factura/articulos/:id/:idfact",
    isLoggedIn,
    transaccionCont.getArticuloFacturaById
);

router.get(
    "/devoluciones/factura/validar/:id",
    isLoggedIn,
    transaccionCont.validateFactura
);

router.get(
    "/devoluciones/factura/cantidad/:id/:idfact",
    isLoggedIn,
    transaccionCont.validateAmount
);

module.exports = router;
