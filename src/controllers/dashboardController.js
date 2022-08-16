const myConn = require("../db");
const dashboardController = {};
const { saveLog } = require('../lib/logs')

dashboardController.dashboardData = async (req, res) => {

    const ventasAlDia = await myConn.query(`
    SELECT date_format(factura.FECHA, '%Y-%m-%d') as Fecha, 
    FORMAT(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.  DESCUENTO), 2) as Total
    FROM factura_detalle
    INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
    WHERE date_format(factura.FECHA, '%Y-%m-%d') = (SELECT CURDATE()) AND factura.ESTATUS = 1
    group by day(factura.FECHA);
  `);

    const devolucionesAlDia = await myConn.query(`
    SELECT date_format(devoluciones.FECHA, '%Y-%m-%d') as Fecha, 
    FORMAT(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum   (devolucion_detalle.DESCUENTO), 2) as Total
    FROM devolucion_detalle
    INNER JOIN devoluciones ON devoluciones.ID_DEVOLUCION = devolucion_detalle.ID_DEVOLUCION
    WHERE date_format(devoluciones.FECHA, '%Y-%m-%d') = (SELECT CURDATE())
    group by day(devoluciones.FECHA);
    `);

    const compraAlDia = await myConn.query(`
    SELECT compra_articulo.FECHA, 
    FORMAT(round((sum(CANTIDAD * PRECIO_COMPRA) + (sum(CANTIDAD * PRECIO_COMPRA) * 0.15)), 2), 2) as    Total
    FROM compra_articulo_detalle
    INNER JOIN compra_articulo ON compra_articulo.ID = compra_articulo_detalle.ID
    WHERE date_format(compra_articulo.FECHA, '%Y-%m-%d') = (SELECT CURDATE()) AND compra_articulo.ESTATUS = 1
    group by day(compra_articulo.FECHA)
  `);

    const totalClientes = await myConn.query(`
    SELECT count(*) as TotalClientes
    FROM persona
    left join empleado on persona.ID_PERSONA = empleado.ID_PERSONA 
    WHERE (persona.ID_PERSONA NOT IN (SELECT empleado.ID_PERSONA FROM empleado))
  `);
  
  saveLog(req.user.USERNAME, `Visualizacion de pantalla principal`, 'LECTURA')
    res.render("home/dashboard", {
        ventasAlDiaData:
            ventasAlDia.length === 0 ? "0.00" : ventasAlDia[0].Total,
        devolucionesAlDia:
            devolucionesAlDia.length === 0
                ? "0.00"
                : (devolucionesAlDia[0].Total),
        compraAlDiaData:
            compraAlDia.length === 0 ? "0.00" : compraAlDia[0].Total,
        totalClientesData:
            totalClientes.length === 0 ? "0" : totalClientes[0].TotalClientes,
    });
};

// Ventas de los ultimos 5 dias
dashboardController.ventasDiarias = async (req, res) => {
    const queryNivel = `
    SELECT factura.FECHA,
    round(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.DESCUENTO), 2) as Total
    FROM factura_detalle
    INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
    group by day(factura.FECHA)
    order by factura.FECHA DESC
    LIMIT 5;
    `;

    const queryVentasNivel = await myConn.query(queryNivel);
    res.json(queryVentasNivel);
};

// Cantidad de productos en Stock
dashboardController.totalStock = async (req, res) => {
    const queryStock = await myConn.query(`
    SELECT DESCRIPCION, STOCK
    FROM articulos
    GROUP BY ID_ARTICULO
    ORDER BY STOCK ASC
    LIMIT 5;
  `);

    res.json(queryStock);
};

module.exports = dashboardController;
