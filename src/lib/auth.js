const myConn = require("../db");

module.exports = {
    electronAccess(req, res, next) {
        if (req.get("User-Agent").endsWith('ZC+fqvK]Jy')) {
            return next();
        } else {
            return res.render("error/not-allowed");
        }
    },

    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect("/");
        }
    },

    // Si ya está logeado, no acceder a pantalla Login
    isLoggedInLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect("/dashboard");
        } else {
            return next();
        }
    },

    isUpdatedPassword(req, res, next) {
        if (req.user.UPDATED) {
            return next();
        } else {
            return res.redirect("/recovery-password");
        }
    },

    // Existe Empresa
    async existsEmpresa(req, res, next) {
        const empresa = await myConn.query("SELECT * FROM empresa");
        if (empresa.length === 0) {
            return next();
        } else {
            return res.render("error/empresa-registrada");
        }
    },

    // Existe Resolucion
    async existsResolucion(req, res, next) {
        const resolucion = await myConn.query("SELECT * FROM resoluciones");
        if (resolucion.length === 0) {
            return next();
        } else {
            return res.render("error/resolucion-registrada");
        }
    },

    async validRangoFactura(req, res, next) {
        const empresa = await myConn.query("SELECT * FROM empresa")
        const resolucion = await myConn.query("SELECT * FROM resoluciones");
        const idVentaQuery = `SELECT ID_FACTURA FROM factura
                              ORDER BY ID_FACTURA DESC
                              LIMIT 1`;
        const idVenta = await myConn.query(idVentaQuery);

        const currentDate = new Date();

        if (resolucion.length === 0 || empresa.length === 0) {
            return res.render("transacciones/facturar", {
                transaccionar: false,
            });
        } else {
            const limitDate = new Date(resolucion[0].FECHA_LIMITE);
            if (
                parseInt(resolucion[0].NUM_FINAL) === idVenta[0].ID_FACTURA ||
                currentDate > limitDate
            ) {
                return res.render("error/limite-rango-factura");
            } else {
                return next();
            }
        }
    },

    async validVentas(req, res, next) {
        // Total Venta Diaria
        const ventasDiarias = await myConn.query(`
        SELECT date_format(factura.FECHA, '%Y-%m-%d') as Fecha, 
        FORMAT(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.    DESCUENTO), 2) as Total
        FROM factura_detalle
        INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
        WHERE date_format(factura.FECHA, '%Y-%m-%d') = (SELECT CURDATE()) AND factura.ESTATUS = 1
        group by day(factura.FECHA);
        `);
        if (ventasDiarias.length === 0) {
            return res.render("error/empty-ventas");
        } else {
            return next()
        }
    },

    async validArqueo(req, res, next) {

        const arqueo = await myConn.query(
            `
        SELECT arqueos_caja.ID_ARQUEOS, date_format(arqueos_caja.FECHA, '%Y-%m-%d') as Fecha 
        FROM arqueos_caja
        WHERE date_format(arqueos_caja.FECHA, '%Y-%m-%d') = (SELECT CURDATE()) AND ID_EMPLEADO_REALIZO = ?;
        `,
            [req.user.ID_EMPLEADO]
        );
        const ajuste =
            await myConn.query(`SELECT HORA_INIT_CAJA, HORA_FINAL_CAJA, TIME_FORMAT(HORA_INIT_CAJA, "%h %i %s %p") as INIT, TIME_FORMAT(HORA_FINAL_CAJA, "%h %i %s %p") as FINAL 
        FROM
        ajustes`);

        const currentDate = new Date();
        const now = currentDate.toLocaleTimeString();

        if (
            now >= ajuste[0].HORA_INIT_CAJA &&
            now <= ajuste[0].HORA_FINAL_CAJA
        ) {
            if (arqueo.length === 0) {
                return next();
            } else {
                return res.render("error/limite-arqueo");
            }
        } else {
            const timeInit = ajuste[0].INIT.split(" ").join(":");
            const timeFinal = ajuste[0].FINAL.split(" ").join(":");

            const hourRange = {
                newTimeInit: replaceAt(timeInit, 8, " "),
                newTimeFinal: replaceAt(timeFinal, 8, " "),
            };

            return res.render("error/limite", { hourRange });
        }
    },
};

const replaceAt = (string, index, replacement) => {
    return (
        string.substring(0, index) + replacement + string.substring(index + 1)
    );
};
