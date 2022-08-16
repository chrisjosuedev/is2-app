const myConn = require("../db");
const analiticasController = {};
const { saveLog } = require("../lib/logs");
/* ----------------- FACTURACION ---------------- */

// General
analiticasController.ventasAnaliticas = async (req, res) => {
    const ventasTotal = await myConn.query(`
  SELECT FORMAT(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15), 2) as Total FROM factura_detalle;
  `);
    saveLog(
        req.user.USERNAME,
        "Visualizacion de analiticas de ventas.",
        "LECTURA"
    );
    res.render("analiticas/ventas", { ventasTotal: ventasTotal[0] });
};

// Ventas Diarias
analiticasController.ventasDiarias = async (req, res) => {
    const queryNivel = `
    SELECT factura.FECHA, 
  (sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.DESCUENTO)) as Total
  FROM factura_detalle
  INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
  group by day(factura.FECHA)
  order by factura.FECHA DESC
  LIMIT 15;`;

    const queryVentasNivel = await myConn.query(queryNivel);
    res.json(queryVentasNivel);
};

// Ventas Mensuales
analiticasController.ventasMensuales = async (req, res) => {
    const queryMensual = `
    SELECT upper(monthname(factura.FECHA)) as Mes, (sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.DESCUENTO)) as Total
    FROM factura_detalle
    INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
    group by month(factura.FECHA)
    order by factura.FECHA;`;

    await myConn.query("SET lc_time_names = 'es_ES';");

    const queryVentasMensual = await myConn.query(queryMensual);
    res.json(queryVentasMensual);
};

// Articulos mas vendidos
analiticasController.articulosMasVendidos = async (req, res) => {
    const queryVendidos = `
    SELECT articulos.DESCRIPCION, sum(factura_detalle.CANTIDAD) as Cantidad
    FROM factura_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = factura_detalle.ID_ARTICULO
    GROUP BY factura_detalle.ID_ARTICULO
    ORDER BY Cantidad DESC
    LIMIT 5
  `;

    const masVendidos = await myConn.query(queryVendidos);

    res.json(masVendidos);
};

// Clientes con mayores compras
analiticasController.clientesMasVendidos = async (req, res) => {
    const queryVentas = `
    SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) as Cliente,
    round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2) as TOTAL
    FROM factura_detalle
    INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
    INNER JOIN persona ON factura.ID_PERSONA = persona.ID_PERSONA
    GROUP BY persona.ID_PERSONA
    ORDER BY TOTAL DESC
    LIMIT 5;
  `;

    const clientesMasVendidos = await myConn.query(queryVentas);

    res.json(clientesMasVendidos);
};

/* ----------------- COMPRAS ---------------- */
// General
analiticasController.comprasAnaliticas = async (req, res) => {
    const comprasTotal = await myConn.query(`
  SELECT FORMAT((sum(CANTIDAD * PRECIO_COMPRA) + (sum(CANTIDAD * PRECIO_COMPRA) * 0.15)), 2) as Total
  FROM compra_articulo_detalle;
  `);
    saveLog(
        req.user.USERNAME,
        "Visualizacion de analíticas de compras.",
        "LECTURA"
    );
    res.render("analiticas/compras", { comprasTotal: comprasTotal[0] });
};

// Diarias
analiticasController.comprasDiarias = async (req, res) => {
    const queryNivel = `
  SELECT compra_articulo.FECHA, round((sum(CANTIDAD * PRECIO_COMPRA) + (sum(CANTIDAD * PRECIO_COMPRA) * 0.15)), 2) as Total
  FROM compra_articulo_detalle
  INNER JOIN compra_articulo ON compra_articulo.ID = compra_articulo_detalle.ID
  group by compra_articulo.FECHA
  order by compra_articulo.FECHA DESC
  LIMIT 15;
  `;

    const queryComprasNivel = await myConn.query(queryNivel);
    res.json(queryComprasNivel);
};

// Mensuales
analiticasController.comprasMensuales = async (req, res) => {
    const queryMensual = `
  SELECT upper(monthname(compra_articulo.FECHA)) as Mes, 
  round((sum(CANTIDAD * PRECIO_COMPRA) + (sum(CANTIDAD * PRECIO_COMPRA) * 0.15)), 2) as Total
  FROM compra_articulo_detalle
  INNER JOIN compra_articulo ON compra_articulo.ID = compra_articulo_detalle.ID
  group by month(compra_articulo.FECHA)
  order by compra_articulo.FECHA;`;

    await myConn.query("SET lc_time_names = 'es_ES';");

    const queryComprasMensual = await myConn.query(queryMensual);
    res.json(queryComprasMensual);
};

// Articulos mas comprados
analiticasController.articulosMasComprados = async (req, res) => {
    const queryComprados = `
    SELECT articulos.DESCRIPCION, sum(compra_articulo_detalle.CANTIDAD) as Cantidad
    FROM compra_articulo_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = compra_articulo_detalle.ID_ARTICULO
    GROUP BY compra_articulo_detalle.ID_ARTICULO
    ORDER BY Cantidad DESC
    LIMIT 5;  
  `;

    const masComprados = await myConn.query(queryComprados);

    res.json(masComprados);
};

// Clientes con mayores compras
analiticasController.proveedoresMasCompras = async (req, res) => {
    const queryCompras = `
    SELECT proveedores.NOMBRE_PROVEEDOR,
    round((sum(CANTIDAD * PRECIO_COMPRA) + (sum(CANTIDAD * PRECIO_COMPRA) * 0.15)), 2) as TOTAL
    FROM compra_articulo_detalle
    INNER JOIN compra_articulo ON compra_articulo.ID = compra_articulo_detalle.ID
    INNER JOIN proveedores ON compra_articulo.RTN_PROVEEDOR = proveedores.RTN_PROVEEDOR
    GROUP BY proveedores.RTN_PROVEEDOR
    ORDER BY TOTAL DESC
    LIMIT 5;
  `;

    const proveedoresMasCompras = await myConn.query(queryCompras);

    res.json(proveedoresMasCompras);
};

module.exports = analiticasController;
