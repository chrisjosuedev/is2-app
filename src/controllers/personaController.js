const myConn = require("../db");
const personaController = {};
const { saveLog } = require('../lib/logs')

// Persona
personaController.getPersonaById = async (req, res) => {
    const { id } = req.params;

    const persona = await myConn.query(
        "SELECT * FROM persona WHERE id_persona = ?",
        [id]
    );

    res.json(persona);
};

// Clientes
personaController.listClientes = async (req, res) => {
    const clientesQuery = `SELECT persona.ID_PERSONA, concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) as CLIENTE, (if(persona.SEXO = 1, 'F', 'M')) as SEXO, persona.CELULAR, 
    concat_ws(', ', persona.DIRECCION_RESIDENCIA, ciudad.NOMBRE_CIUDAD, 
    concat(upper(LEFT(departamentos.NOMBRE_DEPTO, 1)), lower(substring(departamentos.NOMBRE_DEPTO, 2)))) AS DOMICILIO
    FROM persona
    left join empleado on persona.ID_PERSONA = empleado.ID_PERSONA 
    INNER JOIN ciudad on persona.ID_CIUDAD = ciudad.ID_CIUDAD and ciudad.ID_DEPTO = persona.ID_DEPTO
    INNER JOIN departamentos on persona.ID_DEPTO = departamentos.ID_DEPTO
    WHERE (persona.ID_PERSONA NOT IN (SELECT empleado.ID_PERSONA FROM empleado));`;

    const persona_cliente = await myConn.query(clientesQuery);

    const departamentos = await myConn.query("SELECT * FROM departamentos");

    saveLog(req.user.USERNAME, "Visualizacion de patantalla Clientes", 'LECTURA')
    res.render("persona/clientes", { persona_cliente, departamentos });
};

// ----------- NUEVO CLIENTE ------------ //
personaController.newCliente = async (req, res) => {
    const {
        id_persona,
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    } = req.body;

    const newCliente = {
        id_persona,
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    };

    await myConn.query("INSERT INTO persona set ?", [newCliente]);

    saveLog(req.user.USERNAME, `Creacion de Nuevo cliente con RTN ${id_persona}`, 'CREACION')
    req.flash("success", "Cliente Agregado Correctamente");

    res.redirect("/persona/clientes");
};

// -------- EDITAR CLIENTE -------------------
personaController.getClienteById = async (req, res) => {
    const { id } = req.params;

    const persona = await myConn.query(
        "SELECT * FROM persona WHERE id_persona = ?",
        [id]
    );

    res.json(persona);
};

personaController.editCliente = async (req, res) => {
    const { id } = req.params;
    const {
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    } = req.body;

    const newPersona = {
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    };

    await myConn.query("UPDATE persona set ? WHERE id_persona = ?", [
        newPersona,
        id,
    ]);

    saveLog(req.user.USERNAME, `Actualizacion de datos de cliente con RTN ${id}`, 'ACTUALIZACION')
    req.flash("success", "Cliente Actualizado Correctamente");
    res.redirect("/persona/clientes");
};

// ----- Eliminar Cliente
personaController.deleteCliente = async (req, res) => {
    const { id } = req.params;

    await myConn.query(
        "DELETE FROM persona WHERE id_persona = ?",
        [id],
        (error, results) => {
            if (error) {
                req.flash(
                    "warning",
                    "El Cliente seleccionado no puede ser eliminado"
                );
                res.redirect("/persona/clientes");
            } else {
                req.flash("success", "Cliente Eliminado Correctamente");
                res.redirect("/persona/clientes");
            }
        }
    );
};

personaController.listEmpleados = async (req, res) => {
    const empleadoQuery = `SELECT persona.ID_PERSONA, concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) as EMPLEADO, 
    (if(persona.SEXO = 1, 'F', 'M')) as SEXO, persona.CELULAR,
    empleado.ID_EMPLEADO, 
    categoria_laboral.DESCRIPCION_CATEGORIA, empleado.FECHA_CONTRATACION 
    FROM persona 
    INNER JOIN empleado on persona.ID_PERSONA = empleado.ID_PERSONA
    INNER JOIN categoria_laboral on empleado.ID_CATEGORIA = categoria_laboral.ID_CATEGORIA
    INNER JOIN ciudad on persona.ID_CIUDAD = ciudad.ID_CIUDAD and ciudad.ID_DEPTO = persona.ID_DEPTO
    INNER JOIN departamentos on persona.ID_DEPTO = departamentos.ID_DEPTO
    WHERE empleado.ESTATUS = 1;`;

    const empleadoDesQuery = `SELECT persona.ID_PERSONA, concat_ws(' ', persona.NOMBRE_PERSONA, persona.APELLIDO_PERSONA) as EMPLEADO, 
    (if(persona.SEXO = 1, 'F', 'M')) as SEXO, persona.CELULAR,
    empleado.ID_EMPLEADO, 
    categoria_laboral.DESCRIPCION_CATEGORIA, empleado.FECHA_CONTRATACION 
    FROM persona 
    INNER JOIN empleado on persona.ID_PERSONA = empleado.ID_PERSONA
    INNER JOIN categoria_laboral on empleado.ID_CATEGORIA = categoria_laboral.ID_CATEGORIA
    INNER JOIN ciudad on persona.ID_CIUDAD = ciudad.ID_CIUDAD and ciudad.ID_DEPTO = persona.ID_DEPTO
    INNER JOIN departamentos on persona.ID_DEPTO = departamentos.ID_DEPTO
    WHERE empleado.ESTATUS = 0;`;

    const persona_empleado = await myConn.query(empleadoQuery);
    const persona_empleado_des = await myConn.query(empleadoDesQuery);

    const categoria_laboral = await myConn.query(
        "SELECT * FROM categoria_laboral"
    );

    const departamentos = await myConn.query("SELECT * FROM departamentos");

    saveLog(req.user.USERNAME, "Visualizacion de pantalla Empleados", 'LECTURA')
    res.render("persona/empleado", {
        persona_empleado,
        persona_empleado_des,
        categoria_laboral,
        departamentos,
    });
};

/* NUEVO EMPLEADO */
personaController.newEmpleado = async (req, res) => {
    const {
        id_persona,
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        fecha_contratacion,
        id_categoria,
        direccion_residencia,
        id_ciudad,
        id_depto,
    } = req.body;

    const newPersona = {
        id_persona,
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    };

    // Empleado

    const newEmpleado = {
        id_persona,
        id_categoria,
        fecha_contratacion,
    };

    await myConn.query("INSERT INTO persona set ?", [newPersona]);

    await myConn.query("INSERT INTO empleado set ?", [newEmpleado]);

    saveLog(req.user.USERNAME, `Creacion de empleado con ID ${id_persona}`, 'CREACION')
    req.flash("success", "Empleado Agregado Correctamente");

    res.redirect("/persona/empleados");
};

// -------- EDITAR EMPLEADO -------------------
personaController.getEmpleadoById = async (req, res) => {
    const { id } = req.params;

    const empleado = await myConn.query(
        "SELECT persona.*, empleado.ESTATUS, empleado.ID_EMPLEADO, empleado.FECHA_CONTRATACION, empleado.ID_CATEGORIA as PUESTO FROM persona INNER JOIN empleado ON empleado.ID_PERSONA = persona.ID_PERSONA HAVING id_persona = ?",
        [id]
    );

    res.json(empleado);
};

personaController.editEmpleado = async (req, res) => {
    const { id } = req.params;
    const {
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        fecha_contratacion,
        id_depto,
        id_categoria,
    } = req.body;
    const newPersona = {
        nombre_persona,
        apellido_persona,
        sexo,
        celular,
        direccion_residencia,
        id_ciudad,
        id_depto,
    };

    const newEmpleado = {
        id_categoria,
        fecha_contratacion,
    };

    await myConn.query("UPDATE persona set ? WHERE id_persona = ?", [
        newPersona,
        id,
    ]);

    await myConn.query("UPDATE empleado set ? WHERE id_persona = ?", [
        newEmpleado,
        id,
    ]);

    saveLog(req.user.USERNAME, `Actualizacion de datos de empleado con codigo ${id}`, 'ACTUALIZACION')
    req.flash("success", "Empleado Actualizado Correctamente");

    res.redirect("/persona/empleados");
};

// ----- Eliminar Empleado
personaController.deleteEmpleado = async (req, res) => {
    const { id } = req.params;

    await myConn.query(
        `UPDATE empleado
          SET ESTATUS = (if (ESTATUS = 1, 0, 1))
          WHERE ID_EMPLEADO = ?;`,
        [id]
    );

    await myConn.query(
        `UPDATE usuario
        SET ESTATUS = (if (ESTATUS = 1, 0, 1))
        WHERE ID_EMPLEADO = ?;`,
        [id]
    );

    saveLog(req.user.USERNAME, `Actualizacion del estatus de empleado con codigo ${id}`, 'ACTUALIZACION')
    req.flash("success", "Acción Realizada Correctamente");
    res.redirect("/persona/empleados");
};

// JSON Ciudad por Departamento
personaController.getDeptoByCiudad = async (req, res) => {
    const { id } = req.params;
    const ciudad = await myConn.query(
        "SELECT * FROM ciudad WHERE ID_DEPTO = ?",
        [id]
    );
    res.json(ciudad);
};

module.exports = personaController;
