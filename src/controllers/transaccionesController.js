const myConn = require("../db");
const { saveLog } = require("../lib/logs");

// -------------------------------------------------
const { BrowserWindow } = require("electron");
const fs = require("fs");
const { invoiceDir } = require("../config/directories");
const transaccionController = {};

/* Pdf configurations */
const PDF = require("pdfkit-construct");

/* ------------------------- Transacciones ----------------------------- */

// Compra a proveedores
transaccionController.newCompra = async (req, res) => {
    // Capturar el ID de la ultima compra generada
    const idCompraQuery = `SELECT ID, ID_COMPRA FROM compra_articulo
    WHERE ID_EMPLEADO = ?
    ORDER BY ID DESC
    LIMIT 1`;

    // Almacenar el valor del ID de la ultima Compra
    const idCompra = await myConn.query(idCompraQuery, [req.user.ID_EMPLEADO]);

    saveLog(
        req.user.USERNAME,
        `Visualizacion de pantalla registro de compra`,
        "LECTURA"
    );
    res.render("transacciones/comprar", {
        anularCompra: idCompra.length === 0 ? "" : idCompra[0],
    });
};

// Anular Compra
transaccionController.anularCompra = async (req, res) => {
    const { id } = req.params;

    const newEstatusCompra = {
        estatus: false,
    };

    try {
        await myConn.query("UPDATE compra_articulo set ? WHERE id = ?", [
            newEstatusCompra,
            id,
        ]);

        const ventaDetails = await myConn.query(
            "SELECT * FROM compra_articulo_detalle WHERE ID = ?",
            [id]
        );

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK - ?) 
        WHERE ID_ARTICULO = ?;`;

        for (const c of ventaDetails) {
            await myConn.query(updateStockQuery, [c.CANTIDAD, c.ID_ARTICULO]);
        }

        saveLog(
            req.user.USERNAME,
            `Anulacion de registro de compra N° ${id}`,
            "ANULACION"
        );
        req.flash("success", `Compra anulada correctamente`);
        res.redirect("/consultas/compras");
    } catch (err) {
        req.flash(
            "success",
            "Lo sentimos, hubo un error al realizar la operacion."
        );
        res.redirect("/consultas/compras");
        console.error(err);
    }
};

// Anular Ultima Compra
transaccionController.anularUltimaCompra = async (req, res) => {
    // Capturar el ID de la ultima compra generada
    const idCompraQuery = `SELECT ID FROM compra_articulo
    WHERE ID_EMPLEADO = ?
    ORDER BY ID DESC
    LIMIT 1`;

    // Almacenar el valor del ID de la ultima Compra
    const idCompra = await myConn.query(idCompraQuery, [req.user.ID_EMPLEADO]);

    const newEstatusCompra = {
        estatus: false,
    };

    try {
        await myConn.query("UPDATE compra_articulo set ? WHERE id = ?", [
            newEstatusCompra,
            idCompra[0].ID,
        ]);

        const ventaDetails = await myConn.query(
            "SELECT * FROM compra_articulo_detalle WHERE ID = ?",
            [idCompra[0].ID]
        );

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK - ?) 
        WHERE ID_ARTICULO = ?;`;

        for (const c of ventaDetails) {
            await myConn.query(updateStockQuery, [c.CANTIDAD, c.ID_ARTICULO]);
        }

        saveLog(
            req.user.USERNAME,
            `Anulacion de registro de compra`,
            "ANULACION"
        );
        req.flash("success", `Ultima Compra anulada correctamente`);
        res.redirect("/transacciones/compras/new");
    } catch (err) {
        req.flash(
            "success",
            "Lo sentimos, hubo un error al realizar la operacion."
        );
        res.redirect("/consultas/compras");
        console.error(err);
    }
};

// Verificar Estatus
transaccionController.verificarEstatus = async (req, res) => {
    const { id } = req.params;

    const compras = await myConn.query(
        "SELECT ID_COMPRA, ESTATUS FROM compra_articulo WHERE id = ?;",
        [id]
    );

    res.json(compras);
};

transaccionController.addNewCompra = async (req, res) => {
    const { id_compra, rtn_proveedor, fecha, cai_proveedor, id_empleado } =
        req.body;

    let { id_articulo, cantidad, precio_compra } = req.body;

    // Almacenar Compra del articulo
    const newCompraArticulo = {
        id_compra,
        rtn_proveedor,
        cai_proveedor,
        fecha,
        id_empleado,
    };

    try {
        await myConn.query("INSERT INTO compra_articulo set ?", [
            newCompraArticulo,
        ]);

        // Capturar el ID de la ultima compra generada
        const idCompraQuery = `SELECT ID FROM compra_articulo
                        WHERE ID_EMPLEADO = ?
                        ORDER BY ID DESC
                        LIMIT 1`;

        // Almacenar el valor del ID de la ultima Compra
        const idCompra = await myConn.query(idCompraQuery, [id_empleado]);

        // Object Compra Detalle

        const newCompraDetails = [];

        if (id_articulo.length === 1) {
            id_articulo = JSON.parse("[" + id_articulo + "]");
            cantidad = JSON.parse("[" + cantidad + "]");
            precio_compra = JSON.parse("[" + precio_compra + "]");
        }

        for (let i = 0; i < id_articulo.length; i++) {
            newCompraDetails.push({
                id: idCompra[0].ID,
                id_articulo: id_articulo[i],
                cantidad: parseInt(cantidad[i]),
                precio_compra: parseFloat(precio_compra[i]),
            });
        }

        const newCompraFormat = [
            ...new Set(newCompraDetails.map((id) => id.id_articulo)),
        ].map((id_articulo) => {
            return {
                id: newCompraDetails[0].id,
                id_articulo,
                cantidad: newCompraDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.cantidad)
                    .reduce((c, value) => c + value),
                precio_compra: newCompraDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.precio_compra)[0],
            };
        });

        newCompraFormat.forEach(async (item) => {
            await myConn.query("INSERT INTO compra_articulo_detalle set ?", [
                item,
            ]);
        });

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK + ?) 
        WHERE ID_ARTICULO = ?;`;

        for (key in id_articulo) {
            await myConn.query(updateStockQuery, [
                cantidad[key],
                id_articulo[key],
            ]);
        }

        saveLog(
            req.user.USERNAME,
            `Registro de Compra N° ${id_compra}`,
            "CREACION"
        );
        req.flash("success", "Compra registrada satisfactoriamente");
        res.redirect("/transacciones/compras/new");
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            "Hubo un error al procesar la compra, intente nuevamente."
        );
        res.redirect("/transacciones/compras/new");
    }
};

transaccionController.addNewFactura = async (req, res) => {
    const { id_persona, id_empleado, efectivo } = req.body;

    let { id_articulo, cantidad, precio_unit, descuento } = req.body;

    // Factura General
    const newFactura = {
        id_persona,
        id_empleado,
    };

    // ---------------------------- IMPRESION DE FACTURA --------------- //

    try {
        // Guardar Factura General
        await myConn.query("INSERT INTO factura set ?", [newFactura]);

        // Capturar ID de Factura
        const idVentaQuery = `SELECT ID_FACTURA FROM factura
            WHERE ID_EMPLEADO = ?
            ORDER BY ID_FACTURA DESC
            LIMIT 1;`;

        const idVenta = await myConn.query(idVentaQuery, [
            req.user.ID_EMPLEADO,
        ]);

        // Object Factura Detalle

        const newProductDetails = [];

        if (id_articulo.length === 1) {
            id_articulo = JSON.parse("[" + id_articulo + "]");
            cantidad = JSON.parse("[" + cantidad + "]");
            descuento = JSON.parse("[" + descuento + "]");
            precio_unit = JSON.parse("[" + precio_unit + "]");
        }

        for (let i = 0; i < id_articulo.length; i++) {
            newProductDetails.push({
                id_factura: idVenta[0].ID_FACTURA,
                id_articulo: id_articulo[i],
                cantidad: parseInt(cantidad[i]),
                precio_unit: parseFloat(precio_unit[i]).toFixed(2),
                descuento: parseFloat(descuento[i]),
            });
        }

        const newProductFormat = [
            ...new Set(newProductDetails.map((id) => id.id_articulo)),
        ].map((id_articulo) => {
            return {
                id_factura: newProductDetails[0].id_factura,
                id_articulo,
                cantidad: newProductDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.cantidad)
                    .reduce((c, value) => c + value),
                precio_unit: newProductDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.precio_unit)[0],
                descuento: newProductDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.descuento)
                    .reduce((c, value) => c + value),
            };
        });

        newProductFormat.forEach(async (item) => {
            await myConn.query("INSERT INTO factura_detalle set ?", [item]);
        });

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK - ?) 
        WHERE ID_ARTICULO = ?;`;

        for (key in id_articulo) {
            await myConn.query(updateStockQuery, [
                cantidad[key],
                id_articulo[key],
            ]);
        }

        // ----------------------- Print Options -------------------------

        const id = idVenta[0].ID_FACTURA;

        setTimeout(() => {
            createPdf(id, efectivo);
        }, 500);

        req.flash("success", `Venta registrada satisfactoriamente`);
        res.redirect("/transacciones/facturas/new");
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            `Ocurrió un error al realizar la transaccion, intente nuevamente. Error: ${err}`
        );
        res.redirect("/transacciones/facturas/new");
    }
};

// Facturar un producto
transaccionController.newFactura = async (req, res) => {
    const empresa = await myConn.query("SELECT * FROM empresa");
    const resoluciones = await myConn.query("SELECT * FROM resoluciones");
    const departamentos = await myConn.query("SELECT * FROM departamentos");

    // Ultima Transaccion
    // Capturar ID de Factura
    const idVentaQuery = `SELECT ID_FACTURA FROM factura
    WHERE ID_EMPLEADO = ?
    ORDER BY ID_FACTURA DESC
    LIMIT 1;`;

    const idVenta = await myConn.query(idVentaQuery, [req.user.ID_EMPLEADO]);

    var transaccionar = false;

    if (empresa.length > 0 && resoluciones.length > 0) {
        transaccionar = true;
    }

    saveLog(
        req.user.USERNAME,
        `Visualizacion de pantalla facturacion`,
        "LECTURA"
    );
    res.render("transacciones/facturar", {
        transaccionar,
        departamentos,
        id: idVenta.length === 0 ? "" : idVenta[0].ID_FACTURA,
    });
};

/* Verificar Estatus Venta */
transaccionController.verificarEstatusVenta = async (req, res) => {
    const { id } = req.params;

    const ventas = await myConn.query(
        "SELECT ID_FACTURA, ESTATUS FROM factura WHERE id_factura = ?;",
        [id]
    );

    res.json(ventas);
};

// Anular Factura
transaccionController.anularFactura = async (req, res) => {
    const { id, source } = req.params;

    const newEstatusFactura = {
        estatus: false,
    };

    try {
        await myConn.query("UPDATE factura set ? WHERE id_factura = ?", [
            newEstatusFactura,
            id,
        ]);

        const ventaDetails = await myConn.query(
            "SELECT * FROM factura_detalle WHERE ID = ?",
            [id]
        );

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK + ?) 
        WHERE ID_ARTICULO = ?;`;

        for (const c of ventaDetails) {
            await myConn.query(updateStockQuery, [c.CANTIDAD, c.ID_ARTICULO]);
        }

        saveLog(
            req.user.USERNAME,
            `Anulacion de Factura N° ${id}`,
            "ANULACION"
        );
        req.flash("success", `Venta anulada correctamente`);

        if (source === "true") {
            res.redirect("/transacciones/facturas/new");
        } else {
            res.redirect("/consultas/ventas");
        }
    } catch (err) {
        console.error(err);
        req.flash(
            "success",
            "Lo sentimos, hubo un error al realizar la operacion."
        );
        if (source === "true") {
            res.redirect("/transacciones/facturas/new");
        } else {
            res.redirect("/consultas/ventas");
        }
    }
};

/** Arqueos */
transaccionController.newArqueo = async (req, res) => {
    // Total Venta Diaria
    const ventasDiarias = await myConn.query(`
    SELECT date_format(factura.FECHA, '%Y-%m-%d') as Fecha, 
    FORMAT(sum(CANTIDAD * PRECIO_UNIT) + (sum(CANTIDAD * PRECIO_UNIT) * 0.15) - sum(factura_detalle.DESCUENTO), 2) as Total
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

    saveLog(
        req.user.USERNAME,
        `Visualizacion de pantalla de Arqueo de Caja`,
        "LECTURA"
    );

    res.render("transacciones/arqueos", {
        dataVentas: ventasDiarias[0],
        totalBruto:
            devolucionesAlDia.length === 0
                ? ventasDiarias[0].Total
                : (
                      parseFloat(ventasDiarias[0].Total) -
                      parseFloat(devolucionesAlDia[0].Total)
                  ).toFixed(2),
    });
};

/* Agregar Nuevo Arqueo Diario */
transaccionController.agregarArqueo = async (req, res) => {
    const { id_empleado_realizo, saldo_registrado, saldo_caja } = req.body;

    const newArqueo = {
        id_empleado_realizo,
        saldo_registrado,
        saldo_caja,
    };

    try {
        await myConn.query("INSERT INTO arqueos_caja set ?", [newArqueo]);

        saveLog(req.user.USERNAME, `Registro de Cierre de Caja`, "CREACION");
        req.flash("success", "Arqueo Diario realizado con exito");
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            "Ocurrió un error al realizar la operacion, intente nuevamente"
        );
    }

    res.redirect("/transacciones/arqueos/nuevo");
};

/** Devoluciones **/
transaccionController.newDevolucion = async (req, res) => {
    saveLog(
        req.user.USERNAME,
        `Visualizacion de Pantalla Devoluciones`,
        "LECTURA"
    );
    res.render("transacciones/devoluciones");
};

transaccionController.validateFactura = async (req, res) => {
    const { id } = req.params;
    const queryValidate = await myConn.query(
        `
    SELECT *, factura.ID_FACTURA 
    FROM devoluciones
    INNER JOIN factura on factura.ID_FACTURA = devoluciones.ID_FACTURA
    WHERE factura.ID_FACTURA = ?;
    `,
        [id]
    );
    res.json(queryValidate);
};

transaccionController.getFacturaById = async (req, res) => {
    const { id } = req.params;
    const queryDetails = `
    SELECT factura_detalle.ID_FACTURA, factura_detalle.ID_ARTICULO, articulos.DESCRIPCION,
    factura_detalle.CANTIDAD, factura_detalle.PRECIO_UNIT, format(factura_detalle.DESCUENTO, 2) as DISC,
    round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2) as SUBTOTAL
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
  Where ID_FACTURA = ? AND ESTATUS = 1;
  `;

    const facturaGeneral = await myConn.query(queryGeneral, [id, id, id]);

    res.json([facturaDetails, facturaGeneral]);
};

transaccionController.getArticuloFacturaById = async (req, res) => {
    const { id, idfact } = req.params;
    const queryDetails = `
    SELECT factura_detalle.ID_FACTURA, factura_detalle.ID_ARTICULO, articulos.DESCRIPCION,
    factura_detalle.CANTIDAD, factura_detalle.PRECIO_UNIT, format(factura_detalle.DESCUENTO, 2) as DISC,
    round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2) as SUBTOTAL
    FROM factura_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = factura_detalle.ID_ARTICULO
    WHERE factura_detalle.ID_ARTICULO = ? AND factura_detalle.ID_FACTURA = ?
    GROUP BY factura_detalle.ID_ARTICULO;
  `;
    const facturaDetails = await myConn.query(queryDetails, [id, idfact]);

    res.json(facturaDetails);
};

transaccionController.validateAmount = async (req, res) => {
    const { id, idfact } = req.params;

    const amountAvailable = await myConn.query(
        `SELECT factura_detalle.ID_FACTURA, devolucion_detalle.ID_ARTICULO, sum(devolucion_detalle.CANTIDAD) AS Cantidad_Dev, factura_detalle.CANTIDAD as Cantidad_Vend, factura_detalle.PRECIO_UNIT, factura_detalle.DESCUENTO
    FROM devolucion_detalle
    INNER JOIN factura_detalle on factura_detalle.ID_FACTURA = devolucion_detalle.ID_FACTURA
    WHERE devolucion_detalle.ID_ARTICULO = ? AND factura_detalle.ID_ARTICULO = ? 
        AND devolucion_detalle.ID_FACTURA = ?
    GROUP BY devolucion_detalle.ID_ARTICULO;`,
        [id, id, idfact]
    );

    res.json(amountAvailable);
};

transaccionController.agregarDevolucion = async (req, res) => {
    const { tipo, id_factura } = req.body;
    let { id_articulo, cantidad, precio_unit, descuento, obs } = req.body;

    const newDevolucion = {
        tipo,
        id_factura,
        id_empleado: req.user.ID_EMPLEADO,
    };

    try {
        await myConn.query("INSERT INTO devoluciones set ?", [newDevolucion]);

        // Capturar el ID de la ultima devolucion generada
        const idDevolucionQuery = `SELECT ID_DEVOLUCION FROM devoluciones
                        WHERE ID_EMPLEADO = ?
                        ORDER BY ID_DEVOLUCION DESC
                        LIMIT 1`;

        // Almacenar el valor del ID de la ultima Devolucion
        const idDevolucion = await myConn.query(idDevolucionQuery, [
            req.user.ID_EMPLEADO,
        ]);

        // Object Devolucion Detalle

        const newDevolucionDetails = [];

        const observacion = [];

        if (id_articulo.length === 1) {
            id_articulo = JSON.parse("[" + id_articulo + "]");
            cantidad = JSON.parse("[" + cantidad + "]");
            precio_unit = JSON.parse("[" + precio_unit + "]");
            descuento = JSON.parse("[" + descuento + "]");
            observacion[observacion.length] = obs;
        }

        for (let i = 0; i < id_articulo.length; i++) {
            newDevolucionDetails.push({
                id_devolucion: idDevolucion[0].ID_DEVOLUCION,
                id_factura,
                id_articulo: id_articulo[i],
                cantidad: parseInt(cantidad[i]),
                precio_unit: parseFloat(precio_unit[i]),
                descuento: parseFloat(descuento[i]),
                obs: id_articulo.length === 1 ? observacion[i] : obs[i],
            });
        }

        const newDevolucionFormat = [
            ...new Set(newDevolucionDetails.map((id) => id.id_articulo)),
        ].map((id_articulo) => {
            return {
                id_devolucion: newDevolucionDetails[0].id_devolucion,
                id_factura: newDevolucionDetails[0].id_factura,
                id_articulo,
                cantidad: newDevolucionDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.cantidad)
                    .reduce((c, value) => c + value),
                precio_unit: newDevolucionDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.precio_unit)[0],
                descuento: newDevolucionDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.descuento)
                    .reduce((c, value) => c + value),
                obs: newDevolucionDetails
                    .filter((id) => id.id_articulo === id_articulo)
                    .map((id) => id.obs)[0],
            };
        });

        newDevolucionFormat.forEach(async (item) => {
            await myConn.query("INSERT INTO devolucion_detalle set ?", [item]);
        });

        // Actualizar Stock
        const updateStockQuery = `UPDATE articulos set STOCK = (STOCK + ?) 
        WHERE ID_ARTICULO = ?;`;

        for (key in id_articulo) {
            await myConn.query(updateStockQuery, [
                cantidad[key],
                id_articulo[key],
            ]);
        }

        saveLog(
            req.user.USERNAME,
            `Registro de Devolucion de Factura N° ${id_factura}`,
            "CREACION"
        );
        req.flash("success", "Devolucion registrada satisfactoriamente");
        res.redirect("/transacciones/devoluciones/nuevo");
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            "Hubo un error al realizar la transaccion, intente nuevamente."
        );
        res.redirect("/transacciones/devoluciones/nuevo");
    }
};

/* -------------- Create PDF ---------- */
const createPdf = async (id, efectivo) => {
    const dataEmpresa = await myConn.query(`
        SELECT empresa.*, upper(ciudad.NOMBRE_CIUDAD) as CIUDAD, departamentos.NOMBRE_DEPTO
        FROM empresa
        INNER JOIN ciudad on empresa.ID_CIUDAD = ciudad.ID_CIUDAD and ciudad.ID_DEPTO = empresa.ID_DEPTO
        INNER JOIN departamentos on empresa.ID_DEPTO = departamentos.ID_DEPTO;
        `);

    const resolucion = await myConn.query("SELECT * FROM resoluciones");

    const queryDetailsVenta = `SELECT LPAD(factura_detalle.ID_FACTURA, 8, '0') as ID_DOC, factura_detalle.ID_ARTICULO, articulos.DESCRIPCION,
    factura_detalle.CANTIDAD, factura_detalle.PRECIO_UNIT, format(factura_detalle.DESCUENTO, 2) as DISC,
    round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2) as SUBTOTAL
    FROM factura_detalle
    INNER JOIN articulos ON articulos.ID_ARTICULO = factura_detalle.ID_ARTICULO
    WHERE ID_FACTURA = ?
    GROUP BY factura_detalle.ID_ARTICULO;`;

    const facturaDetails = await myConn.query(queryDetailsVenta, [id]);

    var numDocumento = facturaDetails[0].ID_DOC;

    const ventaGeneral = await myConn.query(
        `
        SELECT LPAD(factura.ID_FACTURA, 8, '0') as ID_DOC, FECHA, (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, factura
        WHERE persona.ID_PERSONA = factura.ID_PERSONA AND ID_FACTURA = ?) as Cliente,
        (SELECT persona.ID_PERSONA FROM persona, factura
          WHERE persona.ID_PERSONA = factura.ID_PERSONA AND ID_FACTURA = ?) as ID_PERSONA,
        (SELECT concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) FROM persona, empleado, factura
          WHERE persona.ID_PERSONA = empleado.ID_PERSONA AND empleado.ID_EMPLEADO = factura.ID_EMPLEADO AND    ID_FACTURA = ?) as Empleado
        FROM factura
        Where ID_FACTURA = ?;
        `,
        [id, id, id, id]
    );

    /* Format Fecha */
    const now = new Date(ventaGeneral[0].FECHA);
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const time = now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    });
    const fechaEmision = day + "/" + month + "/" + year + " " + time;

    /* Total Query */
    const subTotalVenta = await myConn.query(
        `
        SELECT format(round(sum(factura_detalle.CANTIDAD * factura_detalle.PRECIO_UNIT), 2), 2) as Total
        FROM factura_detalle WHERE ID_FACTURA = ?;
        `,
        [id]
    );

    /* Descuento */
    const totalDescuento = await myConn.query(
        `
        SELECT format(round(sum(factura_detalle.DESCUENTO), 2), 2) as DESCUENTO_TOTAL
        FROM factura_detalle WHERE ID_FACTURA = ?;
        `,
        [id]
    );

    const ISV = parseFloat(subTotalVenta[0].Total) * 0.15;

    const totalVenta =
        parseFloat(subTotalVenta[0].Total) -
        parseFloat(totalDescuento[0].DESCUENTO_TOTAL) +
        ISV;

    const cambio = parseFloat(efectivo) - totalVenta;

    // Generate PDF
    const doc = new PDF();

    const filename = invoiceDir + `\\factura-N-${ventaGeneral[0].ID_DOC}.pdf`;

    doc.pipe(fs.createWriteStream(filename));

    // Header
    doc.setDocumentHeader(
        {
            height: "35",
        },
        () => {
            doc.fontSize(9).text(`${dataEmpresa[0].RAZON_SOCIAL}`, {
                align: "center",
            });

            doc.fontSize(9).text(`${dataEmpresa[0].DIRECCION_EMPRESA}`, {
                align: "center",
            });

            doc.fontSize(9).text(`R.T.N.: ${dataEmpresa[0].RTN_EMPRESA}`, {
                align: "center",
            });

            doc.fontSize(9).text(`Propietario: ${dataEmpresa[0].REP_LEGAL}`, {
                align: "center",
            });

            doc.fontSize(9).text(`Email: ${dataEmpresa[0].EMAIL}`, {
                align: "center",
            });

            doc.fontSize(9).text(`Tel.: ${dataEmpresa[0].CELULAR}`, {
                align: "center",
                lineGap: 4,
            });

            doc.fontSize(9);

            doc.text(`CAI: ${resolucion[0].CAI}`, { align: "left" });

            doc.text(`Fecha Limite de Emisión: ${resolucion[0].FECHA_LIMITE}`, {
                align: "left",
            });

            doc.text(
                `Rango autorizado del ${resolucion[0].SERIE}-${resolucion[0].NUM_INICIAL} al ${resolucion[0].SERIE}-${resolucion[0].NUM_FINAL}`,
                { align: "left" }
            );

            doc.text(`Factura N°: ${numDocumento}`, { align: "left" });

            doc.text(`Fecha: ${fechaEmision}`, { align: "left" });

            doc.text(` `, { align: "left" });

            doc.text(`Cliente: ${ventaGeneral[0].Cliente}`, {
                align: "left",
            });

            doc.text(`R.T.N. Cliente: ${ventaGeneral[0].ID_PERSONA}`, {
                align: "left",
            });

            doc.text(`Atendió: ${ventaGeneral[0].Empleado}`, {
                align: "left",
            });
        }
    );

    // Details
    const invoice = facturaDetails.map((fact) => {
        const item = {
            description: fact.DESCRIPCION,
            amount: fact.CANTIDAD,
            unit_price: fact.PRECIO_UNIT,
            subtotal: fact.SUBTOTAL,
            descuento: fact.DISC,
        };

        return item;
    });

    doc.addTable(
        [
            { key: "description", label: "Descripcion", align: "center" },
            { key: "amount", label: "Cantidad", align: "center" },
            { key: "unit_price", label: "Precio Unit", align: "center" },
            { key: "subtotal", label: "Subtotal", align: "center" },
            { key: "descuento", label: "Desc.", align: "center" },
        ],
        invoice,
        {
            border: null,
            align: "center",
            width: "fill_body",
            striped: true,
            headBackground: "#23282A",
            headColor: "#FFFFFF",
            headFont: "Helvetica-Bold",
            headFontSize: 9,
            cellsFont: "Helvetica",
            cellsFontSize: 9,
            headAlign: "center",
        }
    );

    // Footer
    doc.setDocumentFooter(
        {
            height: "40",
        },
        () => {
            doc.fontSize(9);
            doc.text(
                `Subtotal: L. ${subTotalVenta[0].Total}`,
                { align: "right" },
                doc.footer.y + 2
            );
            doc.text(` `, { align: "right" });
            doc.text(
                `I.S.V. al 15%: L. ${ISV.toFixed(2)}`,
                { align: "right" },
                doc.footer.y + 15
            );
            doc.text(
                `Descuento: L. ${totalDescuento[0].DESCUENTO_TOTAL}`,
                { align: "right" },
                doc.footer.y + 28
            );
            doc.text(` `, { align: "right" });
            doc.text(
                `Total a pagar: L. ${totalVenta.toFixed(2)}`,
                { align: "right" },
                doc.footer.y + 40
            );
            doc.text(` `, { align: "right" });
            doc.text(
                `Efectivo Recibido: L. ${parseFloat(efectivo).toFixed(2)}`,
                { align: "right" },
                doc.footer.y + 60
            );

            doc.text(` `, { align: "right" });
            doc.text(
                `Cambio entregado: L. ${cambio.toFixed(2)}`,
                { align: "right" },
                doc.footer.y + 75
            );

            doc.text(
                `¡LA FACTURA ES BENEFICIO DE TODOS, EXIGALA!`,
                { align: "center" },
                doc.footer.y + 120
            );

            doc.text(
                `Que Dios Bendiga su dia.`,
                { align: "center" },
                doc.footer.y + 150
            );
        }
    );

    // render tables
    doc.render();
    doc.end();

    // Show PDF
    setTimeout(() => {
        renderWindowsPdf(ventaGeneral[0].ID_DOC);
    }, 500);
};

/* -------------- Show PDF ------------ */
const renderWindowsPdf = async (currentPdf) => {
    const win = new BrowserWindow({
        webPreferences: {
            plugins: true,
        },
        autoHideMenuBar: true,
    });

    try {
        await win.loadURL(invoiceDir + `\\factura-N-${currentPdf}.pdf`);
    } catch (e) {
        console.log(e);
    }
};

module.exports = transaccionController;
