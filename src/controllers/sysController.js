const myConn = require("../db");
const sysController = {};
const { saveLog } = require('../lib/logs')

/* Lista General */
sysController.miEmpresa = async (req, res) => {
    const empresaData = await myConn.query(`
    SELECT empresa.* , departamentos.*,  ciudad.*
    FROM empresa
    INNER JOIN departamentos on departamentos.ID_DEPTO = empresa.ID_DEPTO
    INNER JOIN ciudad on ciudad.ID_CIUDAD = empresa.ID_CIUDAD
    WHERE ciudad.ID_DEPTO = departamentos.ID_DEPTO
    GROUP BY empresa.ID_EMPRESA
    `);

    saveLog(req.user.USERNAME, "Visualizacion de pantalla empresa", 'LECTURA')
    res.render("sys/mi-empresa", { empresaData });
};

sysController.nuevaEmpresa = async (req, res) => {
    const departamentos = await myConn.query("SELECT * FROM departamentos");

    saveLog(req.user.USERNAME, "Visualizacion de pantalla creacion de nueva empresa", 'LECTURA')
    res.render("sys/mi-empresa/add", { departamentos });
};

sysController.agregarEmpresa = async (req, res) => {
    const {
        rtn_empresa,
        razon_social,
        rep_legal,
        rtn_rep_legal,
        email,
        celular,
        id_ciudad,
        id_depto,
        direccion_empresa,
        inicio_periodo,
        fin_periodo,
    } = req.body;

    const newEmpresa = {
        rtn_empresa,
        razon_social,
        rep_legal,
        rtn_rep_legal,
        email,
        celular,
        id_ciudad,
        id_depto,
        direccion_empresa,
        inicio_periodo,
        fin_periodo,
    };

    await myConn.query("INSERT into empresa SET ?", [newEmpresa]);

    saveLog(req.user.USERNAME, `Creacion de nueva empresa con RTN ${rtn_empresa}`, 'CREACION')
    req.flash("success", "Empresa Registrada Exitosamente");

    res.redirect("/sys/mi-empresa/");
};

sysController.general = async (req, res) => {
    const queryEmpresa = `
  SELECT empresa.*, upper(ciudad.NOMBRE_CIUDAD) as CIUDAD, departamentos.NOMBRE_DEPTO
  FROM empresa
  INNER JOIN ciudad on empresa.ID_CIUDAD = ciudad.ID_CIUDAD and ciudad.ID_DEPTO = empresa.ID_DEPTO
  INNER JOIN departamentos on empresa.ID_DEPTO = departamentos.ID_DEPTO
  `;
    const empresa = await myConn.query(queryEmpresa);

    res.json(empresa);
};

sysController.editarEmpresa = async (req, res) => {
    const { id } = req.params;

    const empresaData = await myConn.query(
        "SELECT * FROM empresa WHERE id_empresa = ?",
        [id]
    );

    const departamentos = await myConn.query("SELECT * FROM departamentos");

    saveLog(req.user.USERNAME, "Visualizacion de pantalla de edicion de empresa", 'ACTUALIZACION')
    res.render("sys/mi-empresa/edit", {
        empresa: empresaData[0],
        departamentos,
    });
};

sysController.editInfoEmpresa = async (req, res) => {
    const { id } = req.params;

    const {
        rtn_empresa,
        razon_social,
        rep_legal,
        rtn_rep_legal,
        email,
        celular,
        id_ciudad,
        id_depto,
        direccion_empresa,
        inicio_periodo,
        fin_periodo,
    } = req.body;

    const newEmpresa = {
        rtn_empresa,
        razon_social,
        rep_legal,
        rtn_rep_legal,
        email,
        celular,
        id_ciudad,
        id_depto,
        direccion_empresa,
        inicio_periodo,
        fin_periodo,
    };

    await myConn.query("UPDATE empresa SET ? WHERE id_empresa = ?", [
        newEmpresa,
        id,
    ]);

    saveLog(req.user.USERNAME, `Actualizacion de datos de empresa con RTN ${id}`, 'ACTUALIZACION')
    req.flash("success", "Datos Actualizados Correctamente");

    res.redirect("/sys/mi-empresa/");
};

sysController.eliminarEmpresa = async (req, res) => {
    const { id } = req.params;

    await myConn.query("DELETE FROM empresa WHERE id_empresa = ?", [id]);

    saveLog(req.user.USERNAME, `Eliminacion de datos de empresa con RTN ${id}`, 'ANULACION')
    req.flash("success", "Datos Eliminados Correctamente");
    res.redirect("/sys/mi-empresa/");
};

/* Resoluciones */

sysController.miResolucion = async (req, res) => {
    const resolucionData = await myConn.query("SELECT * FROM resoluciones");
    res.render("sys/resoluciones", { resolucionData });
    saveLog(req.user.USERNAME, "Visualizacion de pantalla de Resolucion.", 'LECTURA')
};

sysController.nuevaResolucion = async (req, res) => {
    saveLog(req.user.USERNAME, `Visualizacion de pantalla creacion de Resolucion.`, 'LECTURA')
    res.render("sys/resoluciones/add");
};

sysController.agregarResolucion = async (req, res) => {
    const { cai, serie, num_inicial, num_final, fecha_limite, notificar } =
        req.body;

    const newResolucion = {
        cai,
        serie,
        num_inicial,
        num_final,
        fecha_limite,
        notificar,
    };

    try {
        const facturas = await myConn.query(
            "SELECT * FROM factura ORDER BY ID_FACTURA DESC LIMIT 1"
        );

        if (
            facturas.length === 0 ||
            parseInt(num_inicial) > parseInt(facturas[0].ID_FACTURA)
        ) {
            await myConn.query("INSERT INTO resoluciones SET ?", [
                newResolucion,
            ]);

            const numRes = await myConn.query(
                "SELECT NUM_INICIAL FROM resoluciones ORDER BY ID_RESOLUCION DESC LIMIT 1"
            );

            const numInicial = parseInt(numRes[0].NUM_INICIAL);

            await myConn.query("ALTER TABLE factura AUTO_INCREMENT = ?", [
                numInicial,
            ]);

            saveLog(req.user.USERNAME, `Registro de nueva resolucion.`, 'CREACION')
            req.flash("success", "Resolucion Agregada Correctamente");
            res.redirect("/sys/resoluciones");
        } else {
            req.flash(
                "warning",
                "El rango de resolucion es incorrecto, revise el dictamen del SAR"
            );
            res.redirect("/sys/resoluciones/agregar");
        }
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            "Hubo un error en el proceso, intente nuevamente."
        );
        res.redirect("/sys/resoluciones/agregar");
    }
};

sysController.detalleResolucion = async (req, res) => {
    const resolucion = await myConn.query("SELECT * FROM resoluciones");
    res.json(resolucion);
};

sysController.editarResolucion = async (req, res) => {
    const { id } = req.params;
    const resolucion = await myConn.query(
        "SELECT * FROM resoluciones WHERE id_resolucion = ?",
        [id]
    );
    saveLog(req.user.USERNAME, `Visualizacion pantalla editar resolucion.`, 'LECTURA')
    res.render("sys/resoluciones/edit", { dataResolucion: resolucion[0] });
};

sysController.editInfoResolucion = async (req, res) => {
    const { id } = req.params;

    const { cai, serie, num_inicial, num_final, fecha_limite, notificar } =
        req.body;

    const newResolucion = {
        cai,
        serie,
        num_inicial,
        num_final,
        fecha_limite,
        notificar,
    };

    try {
        const facturas = await myConn.query(
            "SELECT * FROM factura ORDER BY ID_FACTURA DESC LIMIT 1"
        );

        const resolucion = await myConn.query("SELECT * FROM resoluciones");

        if (
            facturas.length === 0 ||
            parseInt(num_inicial) === parseInt(resolucion[0].NUM_INICIAL) ||
            parseInt(num_inicial) > parseInt(facturas[0].ID_FACTURA)
        ) {
            await myConn.query(
                "UPDATE resoluciones SET ? WHERE id_resolucion = ?",
                [newResolucion, id]
            );

            const numRes = await myConn.query(
                "SELECT NUM_INICIAL FROM resoluciones WHERE id_resolucion = ?;",
                [id]
            );

            var numInicial = parseInt(numRes[0].NUM_INICIAL);

            await myConn.query("ALTER TABLE factura AUTO_INCREMENT = ?", [
                numInicial,
            ]);

            saveLog(req.user.USERNAME, `Actualizacion de resolucion vigente.`, 'ACTUALIZACION')
            req.flash("success", "Resolucion Actualizada Correctamente");

            res.redirect("/sys/resoluciones");
        } else {
            req.flash(
                "warning",
                "El rango de resolucion es incorrecto, revise el dictamen del SAR"
            );
            res.redirect("/sys/resoluciones");
        }
    } catch (err) {
        console.log(err);
        req.flash(
            "warning",
            "Hubo un error en el proceso, intente nuevamente."
        );
        res.redirect("/sys/resoluciones");
    }
};

sysController.eliminarResolucion = async (req, res) => {
    const { id } = req.params;

    await myConn.query("DELETE FROM resoluciones WHERE id_resolucion = ?", [
        id,
    ]);

    saveLog(req.user.USERNAME, `Eliminacion de resolucion ${id}`, 'ANULACION')
    req.flash("success", "Resolucion Eliminada Correctamente");
    res.redirect("/sys/resoluciones/");
};

/* Tickets */
sysController.tickets = async (req, res) => {
    const tickets = await myConn.query(`
    SELECT tickets.*,  categoria_laboral.DESCRIPCION_CATEGORIA
    FROM tickets
    INNER JOIN categoria_laboral on tickets.ID_AREA_LABORAL  = categoria_laboral.ID_CATEGORIA
    WHERE USERNAME = ?
    ORDER BY ID_TICKETS DESC
    `, [req.user.USERNAME]);
    const areaLaboral = await myConn.query("SELECT * FROM categoria_laboral;");

    saveLog(req.user.USERNAME, `Visualizacion de pantalla creacion de ticket`, 'LECTURA')
    res.render("sys/tickets", { tickets, areaLaboral });
};

sysController.detalleTickets = async (req, res) => {
    const { id } = req.params
    const tickets = await myConn.query(`
    SELECT tickets.*,  categoria_laboral.DESCRIPCION_CATEGORIA
    FROM tickets
    INNER JOIN categoria_laboral on tickets.ID_AREA_LABORAL  = categoria_laboral.ID_CATEGORIA
    WHERE ID_TICKETS = ?
    ORDER BY ID_TICKETS DESC
    `, [id]);

    saveLog(req.user.USERNAME, `Visualizacion de pantalla detalle de ticket`, 'LECTURA')
    res.render("sys/tickets/detalle", { ticketsData: tickets[0] })
}

module.exports = sysController;
