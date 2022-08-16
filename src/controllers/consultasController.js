const myConn = require("../db");
const consultasController = {};
const { saveLog } = require('../lib/logs')

/* ------------------------- COMPRAS ----------------------------- */

// Listar todas las compras
consultasController.listCompras = async (req, res) => {
    const comprasQuery = `SELECT compra_articulo.*, proveedores.NOMBRE_PROVEEDOR
  FROM compra_articulo
  INNER JOIN proveedores ON compra_articulo.RTN_PROVEEDOR = proveedores.RTN_PROVEEDOR
  GROUP BY compra_articulo.ID_COMPRA
  ORDER BY compra_articulo.ID_COMPRA ASC;`;
    const compras = await myConn.query(comprasQuery);

    saveLog(req.user.USERNAME, "Visualizacion de total de Compras", 'LECTURA')
    res.render("consultas/compras/general", { compras });
};

// JSON de todas las compras
consultasController.totalCompras = async (req, res) => {
    const comprasQuery = `SELECT compra_articulo.*, proveedores.NOMBRE_PROVEEDOR
  FROM compra_articulo
  INNER JOIN proveedores ON compra_articulo.RTN_PROVEEDOR = proveedores.RTN_PROVEEDOR
  GROUP BY compra_articulo.ID_COMPRA
  ORDER BY compra_articulo.ID_COMPRA ASC;`;
    const compras = await myConn.query(comprasQuery);
    res.json(compras);
};

// Filtrado de Compras por Fecha
consultasController.findCompraByDate = async (req, res) => {
    const { fechain, fechaout } = req.params;

    const comprasDateQuery = `
  SELECT compra_articulo.*, proveedores.NOMBRE_PROVEEDOR
  FROM compra_articulo
  INNER JOIN proveedores ON compra_articulo.RTN_PROVEEDOR = proveedores.RTN_PROVEEDOR
  WHERE compra_articulo.FECHA BETWEEN ? AND ?
  GROUP BY compra_articulo.ID_COMPRA
  `;
    const compras = await myConn.query(comprasDateQuery, [fechain, fechaout]);
    res.json(compras);
};

// Detalle Compra
consultasController.getCompraByID = async (req, res) => {
    const { id } = req.params;
    const queryDetails = `
  SELECT compra_articulo_detalle.ID_ARTICULO, 
  articulos.DESCRIPCION,
  compra_articulo_detalle.CANTIDAD, format(compra_articulo_detalle.PRECIO_COMPRA, 2) as PRECIO_COMPRA,
  format(round(sum(compra_articulo_detalle.CANTIDAD * compra_articulo_detalle.PRECIO_COMPRA), 2), 2) as SUBTOTAL
  FROM compra_articulo_detalle
  INNER JOIN articulos ON articulos.ID_ARTICULO = compra_articulo_detalle.ID_ARTICULO
  WHERE compra_articulo_detalle.ID = ?
  GROUP BY compra_articulo_detalle.ID_ARTICULO;
  `;

    const compraDetails = await myConn.query(queryDetails, [id]);

    const proveedorCompra = await myConn.query(
        `
  SELECT compra_articulo.ID_COMPRA, compra_articulo.RTN_PROVEEDOR, proveedores.NOMBRE_PROVEEDOR
  FROM compra_articulo
  INNER JOIN proveedores ON compra_articulo.RTN_PROVEEDOR = proveedores.RTN_PROVEEDOR
  WHERE ID = ?
  GROUP BY compra_articulo.ID_COMPRA;
  `,
        [id]
    );

    saveLog(req.user.USERNAME, `Visualizacion de detalle de Compras N° ${id}`, 'LECTURA')
    res.render("consultas/compras/detalle", {
        compraDetails,
        proveedorCompra: proveedorCompra[0],
    });
};

/* ------------------- FACTURAS -------------------- */
consultasController.listVentas = async (req, res) => {
    const ventasQuery = `
  SELECT LPAD(factura.ID_FACTURA, 8, '0') as ID_FAC, factura.*, persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA
  FROM factura_detalle
  INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
  INNER JOIN persona ON factura.ID_PERSONA = persona.ID_PERSONA
  GROUP BY factura.ID_FACTURA
  ORDER BY factura.ID_FACTURA ASC`;
    const ventas = await myConn.query(ventasQuery);
    saveLog(req.user.USERNAME, "Visualizacion de total de Ventas", 'LECTURA')
    res.render("consultas/ventas/general", { ventas });
};

// JSON
consultasController.totalVentas = async (req, res) => {
    const ventasQuery = `
    SELECT factura.*, persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA
    FROM factura_detalle
    INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
    INNER JOIN persona ON factura.ID_PERSONA = persona.ID_PERSONA
    GROUP BY factura.ID_FACTURA
    ORDER BY factura.ID_FACTURA ASC`;
    const ventas = await myConn.query(ventasQuery);
    res.json(ventas);
};

// Filtrado de Ventas por Fecha
consultasController.findVentaByDate = async (req, res) => {
    const { fechain, fechaout } = req.params;

    const ventasDateQuery = `
  SELECT factura.*, persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA
  FROM factura_detalle
  INNER JOIN factura ON factura.ID_FACTURA = factura_detalle.ID_FACTURA
  INNER JOIN persona ON factura.ID_PERSONA = persona.ID_PERSONA
  WHERE factura.FECHA BETWEEN ? AND ?
  GROUP BY factura.ID_FACTURA
  `;
    const ventas = await myConn.query(ventasDateQuery, [fechain, fechaout]);
    res.json(ventas);
};

// Detalle Venta
consultasController.getVentaByID = async (req, res) => {

    const { id } = req.params;

    const queryDetails = `
    SELECT factura_detalle.ID_FACTURA, factura_detalle.ID_ARTICULO, articulos.DESCRIPCION,
    factura_detalle.CANTIDAD, format(factura_detalle.PRECIO_UNIT, 2) as PRECIO_UNIT, format(factura_detalle.DESCUENTO, 2) as DISC,
    format(round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2), 2) as SUBTOTAL
    FROM factura_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = factura_detalle.ID_ARTICULO
    WHERE ID_FACTURA = ?
    GROUP BY factura_detalle.ID_ARTICULO;
  `;
    const facturaDetails = await myConn.query(queryDetails, [id]);

    // General Factura
    const queryGeneral = `
  SELECT LPAD(factura.ID_FACTURA, 8, '0') as ID_FAC, ID_FACTURA, FECHA, (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, factura
  WHERE persona.ID_PERSONA = factura.ID_PERSONA AND ID_FACTURA = ?) as Cliente, 
  (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, empleado,  factura
  WHERE persona.ID_PERSONA = empleado.ID_PERSONA AND empleado.ID_EMPLEADO = factura.ID_EMPLEADO AND ID_FACTURA = ?) as Empleado
  FROM factura
  Where ID_FACTURA = ?;
  `;

    const facturaGeneral = await myConn.query(queryGeneral, [id, id, id]);

    saveLog(req.user.USERNAME, `Visualizacion de detalle de Venta N° ${id}`, 'LECTURA')
    res.render("consultas/ventas/detalle", {
        facturaDetails,
        facturaGeneral: facturaGeneral[0],
    });
};

/* Devoluciones */
consultasController.listDevoluciones = async (req, res) => {
    const devolucion = await myConn.query(
        "SELECT devoluciones.*, LPAD(ID_FACTURA, 8, '0') as ID_FAC FROM devoluciones;"
    );

    saveLog(req.user.USERNAME, "Visualizacion de total de Devoluciones", 'LECTURA')
    res.render("consultas/devoluciones/general", { devolucion });
};

consultasController.getDevolucionById = async (req, res) => {
    const { id } = req.params;
    const queryDetails = `
    SELECT devolucion_detalle.ID_ARTICULO, articulos.DESCRIPCION,
    devolucion_detalle.CANTIDAD, format(devolucion_detalle.PRECIO_UNIT, 2) as PRECIO_UNIT,
    format(round(sum(devolucion_detalle.CANTIDAD * devolucion_detalle.PRECIO_UNIT), 2), 2) as  SUBTOTAL, format(devolucion_detalle.DESCUENTO, 2) as DESCUENTO, OBS
    FROM devolucion_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = devolucion_detalle.ID_ARTICULO
    WHERE devolucion_detalle.ID_DEVOLUCION = ?
    GROUP BY devolucion_detalle.ID_ARTICULO;
  `;

    const devolucionDetails = await myConn.query(queryDetails, [id]);

    const devolucionVenta = await myConn.query(
        ` SELECT ID_DEVOLUCION, LPAD(devoluciones.ID_FACTURA, 8, '0') as ID_FAC, ID_FACTURA,FECHA, 
  (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, empleado
  WHERE persona.ID_PERSONA = empleado.ID_PERSONA AND empleado.ID_EMPLEADO = devoluciones.ID_EMPLEADO AND ID_DEVOLUCION = ?) as Empleado
  FROM devoluciones
  Where ID_DEVOLUCION = ?;
  `,
        [id, id]
    );

    saveLog(req.user.USERNAME, `Visualizacion de detalle de Devolucion N° ${id}`, 'LECTURA')
    res.render("consultas/devoluciones/detalle", {
        devolucionDetails,
        devolucionVenta: devolucionVenta[0],
    });
};

/* Arqueos */
consultasController.listArqueos = async (req, res) => {
    const arqueo = await myConn.query(`
  SELECT *, (if (SALDO_CAJA < SALDO_REGISTRADO, (SALDO_CAJA - SALDO_REGISTRADO), 0.00 )) AS FALTANTE, 
	(if (SALDO_CAJA > SALDO_REGISTRADO, (SALDO_CAJA - SALDO_REGISTRADO), 0.00 )) AS SOBRANTE
  FROM arqueos_caja
  ORDER BY arqueos_caja.FECHA DESC`);

  saveLog(req.user.USERNAME, "Visualizacion de total de Cierres de Caja", 'LECTURA')
    res.render("consultas/arqueos/general", { arqueo });
};

consultasController.getArqueoById = async (req, res) => {
    const { id } = req.params;

    const arqueo = await myConn.query(
        `
  SELECT *, (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, empleado, arqueos_caja
  WHERE persona.ID_PERSONA = empleado.ID_PERSONA AND empleado.ID_EMPLEADO = arqueos_caja. ID_EMPLEADO_REALIZO AND id_arqueos = ?) as REALIZADO_POR
  FROM arqueos_caja
  Where id_arqueos = ?;
  `,
        [id, id, id]
    );

    saveLog(req.user.USERNAME, `Visualizacion de detalle de Cierre de Caja N° ${id}`, 'LECTURA')
    res.render("consultas/arqueos/edit", { arqueoData: arqueo[0] });
};

consultasController.revisarArqueo = async (req, res) => {
    const { id } = req.params;
    const { observaciones, revisado, id_empleado_reviso } = req.body;

    const arqueoRevisado = {
        observaciones,
        revisado: revisado === "on" ? 1 : 0,
        id_empleado_reviso,
    };

    try {
        await myConn.query("UPDATE arqueos_caja set ? WHERE id_arqueos = ?", [
            arqueoRevisado,
            id,
        ]);
        saveLog(req.user.USERNAME, `Revisión de Cierre de Caja N° ${id}`, 'ACTUALIZACION')
        req.flash("success", "Arqueo Revisado Correctamente.");
    } catch (err) {
        console.log(err);
        req.flash("warning", "Ocurrió un error, intente nuevamente.");
    }

    res.redirect("/consultas/arqueos");
};

/* Tickets */
consultasController.listTickets = async (req, res) => {
    const tickets = await myConn.query(
        `
    SELECT * 
    FROM tickets
    WHERE ID_AREA_LABORAL = ?
    ORDER BY RESOLUCION ASC;
  `,
        [req.user.ID_CATEGORIA]
    );

    saveLog(req.user.USERNAME, "Visualizacion de Tickets.", 'LECTURA')
    res.render("consultas/tickets/general", { tickets });
};

consultasController.getTicketById = async (req, res) => {
    const { id } = req.params;

    const tickets = await myConn.query(
        `
    SELECT tickets.*,  categoria_laboral.DESCRIPCION_CATEGORIA
    FROM tickets
    INNER JOIN categoria_laboral on tickets.ID_AREA_LABORAL  = categoria_laboral.ID_CATEGORIA
    WHERE ID_TICKETS = ?
    ORDER BY ID_TICKETS DESC
    `,
        [id]
    );

    saveLog(req.user.USERNAME, `Visualizacion de detalle de Ticket N° ${id}`, 'LECTURA')
    res.render("consultas/tickets/edit", { ticketsData: tickets[0] });
};

consultasController.finalizarTicket = async (req, res) => {
    const { id } = req.params;
    const { comentario, resolucion } = req.body;

    const ticketFinalizado = {
        comentario,
        resolucion: resolucion === "on" ? 1 : 0,
    };

    try {
        await myConn.query("UPDATE tickets set ? WHERE id_tickets = ?", [
            ticketFinalizado,
            id,
        ]);
        saveLog(req.user.USERNAME, `Finalizacion de Ticket N° ${id}`, 'ACTUALIZACION')
        req.flash("success", "Ticket Revisado Correctamente.");
    } catch (err) {
        console.log(err);
        req.flash("warning", "Ocurrió un error, intente nuevamente.");
    }

    res.redirect("/consultas/tickets");
};

module.exports = consultasController;
