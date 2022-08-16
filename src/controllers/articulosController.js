const myConn = require('../db')
const artController = {}
const { saveLog } = require('../lib/logs')
/* ----------- ARTICULOS --------------- */

// Articulos Listar 
artController.listArticulos = async (req, res) => {
    const queryArt = `SELECT articulos.*, format(articulos.PRECIO_UNIT, 2) AS PRECIO, marca.NOMBRE_MARCA, tipo_articulos.NOMBRE_TIPOARTICULO
    FROM articulos
    INNER JOIN marca ON marca.ID_MARCA = articulos.ID_MARCA
    INNER JOIN tipo_articulos ON tipo_articulos.ID_TIPOARTICULO = articulos.ID_TIPOARTICULO
    GROUP BY articulos.ID_ARTICULO
    ORDER BY articulos.ID_ARTICULO ASC;`
    const articulos = await myConn.query(queryArt)

    // Consultas para Selects
    const tipo_articulos = await myConn.query("SELECT * FROM tipo_articulos")
    const marca = await myConn.query("SELECT * FROM marca")

    saveLog(req.user.USERNAME, 'Visualizacion de pantalla de articulos.', 'LECTURA')
    res.render('articulos/items', { articulos, marca, tipo_articulos })
}

/* GET ARTICULO POR ID */
artController.getArtById = async (req, res) => {
    const { id } = req.params

    const articulos = await myConn.query("SELECT * FROM articulos WHERE ID_ARTICULO = ?", [id])

    res.json(articulos)
}

/* Nuevo Articulo */
artController.newArticulo = async (req, res) => {
    const { descripcion, precio_unit, descuento, id_marca, id_tipoarticulo } = req.body

    const newItem = {
        descripcion,
        precio_unit,
        descuento,
        id_marca,
        id_tipoarticulo
    }


    await myConn.query("INSERT INTO articulos set ?", [ newItem ])

    saveLog(req.user.USERNAME, `Creacion de articulo ${descripcion}`, 'CREACION')
    req.flash('success', "Articulo Agregado Correctamento")
    res.redirect('/articulos')


}

/* Editar */
artController.editArticulo = async (req, res) => {
    const { id } = req.params
    const { descripcion, precio_unit, descuento, id_marca, id_tipoarticulo } = req.body

    const newItem = {
        descripcion,
        precio_unit,
        descuento,
        id_marca,
        id_tipoarticulo
    }

    await myConn.query("UPDATE articulos set ? WHERE id_articulo = ?", [
        newItem,
        id,
    ])

    saveLog(req.user.USERNAME, `Actualizacion de articulo con codigo ${id}`, 'ACTUALIZACION')
    req.flash("success", "Articulo Actualizado Correctamente")

    res.redirect('/articulos')

}

/* Delete */
artController.deleteArticulo = async (req, res) => {
    const { id } = req.params

    await myConn.query("DELETE FROM articulos WHERE id_articulo = ?", [id], (error, results) => {
        if (error) {
            req.flash("warning", "El Articulo seleccionado no puede ser eliminada");
            res.redirect("/articulos");
        }
        else {
            saveLog(req.user.USERNAME, `Eliminacion de articulo con codigo ${id}`, 'ANULACION')
            req.flash("success", "Articulo Eliminado Correctamente");
            res.redirect("/articulos");   
        }
    })
}

/* ------------- FIN ARTICULOS ------------- */

// Tipos
artController.listTipos = async (req, res) => {
    const tipos = await myConn.query("SELECT * FROM tipo_articulos;")
    saveLog(req.user.USERNAME, "Visualizacion de pantalla de tipos de articulos", 'LECTURA')
    res.render('articulos/tipos', { tipos })
}

artController.newTipos = async (req, res) => {
    const { nombre_tipoarticulo } = req.body

    const newTipo = {
        nombre_tipoarticulo
    }

    await myConn.query("INSERT INTO tipo_articulos set ?", [newTipo])


    saveLog(req.user.USERNAME, `Creacion de tipo de articulo ${nombre_tipoarticulo}`, 'CREACION')
    req.flash("success", "Tipo de Articulo Agregado Correctamente")

    res.redirect('/articulos/tipos')
}

artController.getTipoById = async (req, res) => {
    const { id } = req.params
    const tipos = await myConn.query("SELECT * FROM tipo_articulos WHERE id_tipoarticulo = ?", [id])
    res.json(tipos)
}

artController.editTipos = async (req, res) => {
    const { id } = req.params;
    const { nombre_tipoarticulo } = req.body;
    const newTipo = {
        nombre_tipoarticulo
    }

    await myConn.query("UPDATE tipo_articulos set ? WHERE id_tipoarticulo = ?", [
        newTipo,
        id,
    ])

    saveLog(req.user.USERNAME, `Actualizacion de articulo con codigo ${id}`, 'ACTUALIZACION')
    req.flash("success", "Tipo de Articulo Actualizado Correctamente");
    res.redirect("/articulos/tipos");
}

artController.deleteTipos = async (req, res) => {
    const { id } = req.params;
    await myConn.query("DELETE FROM tipo_articulos WHERE id_tipoarticulo = ?", [id], (error, results) => {
        if (error) {
            req.flash("warning", "El tipo de Articulo seleccionado no puede ser eliminada");
            res.redirect("/articulos/tipos");
        }
        else {
            saveLog(req.user.USERNAME, `Eliminacion de articulo con codigo ${id}`, 'ANULACION')
            req.flash("success", "Tipo de Articulo Eliminado Correctamente");
            res.redirect("/articulos/tipos");   
        }
    });
    
}

// Marcas Listar
artController.listMarcas = async (req, res) => {
    const marca = await myConn.query("SELECT * FROM marca;")
    saveLog(req.user.USERNAME, "Visualizacion de pantalla de marca.", 'LECTURA')
    res.render('articulos/marca', { marca })
}

artController.newMarca = async (req, res) => {
    const { nombre_marca } = req.body

    const newMarca = {
        nombre_marca
    }

    await myConn.query("INSERT INTO marca set ?", [newMarca])

    saveLog(req.user.USERNAME, `Creacion de marca ${nombre_marca}`, 'CREACION')

    req.flash("success", "Marca Agregada Correctamente")

    res.redirect('/articulos/marcas')
}

// ------ EDITAR MARCA
artController.getMarcaById = async (req, res) => {
    const { id } = req.params
    const marca = await myConn.query("SELECT * FROM marca WHERE id_marca = ?", [id])
    res.json(marca)
}

artController.editMarca = async (req, res) => {
    const { id } = req.params;
    const { nombre_marca } = req.body;
    const newMarca = {
        nombre_marca,
    }

    await myConn.query("UPDATE marca set ? WHERE id_marca = ?", [
        newMarca,
        id,
    ])

    saveLog(req.user.USERNAME, `Actualizacion de marca con codigo ${id}`, 'ACTUALIZACION')
    req.flash("success", "Marca Actualizada Correctamente");
    res.redirect("/articulos/marcas");
}

// -- Eliminar Marca
artController.deleteMarca = async (req, res) => {
    const { id } = req.params;
    await myConn.query("DELETE FROM marca WHERE id_marca = ?", [id], (error, results) => {
        if (error) {
            req.flash("warning", "La marca seleccionada no puede ser eliminada");
            res.redirect("/articulos/marcas");
        }
        else {
            saveLog(req.user.USERNAME, `Eliminacion de marca con codigo ${id}`, 'ANULACION')
            req.flash("success", "Marca Eliminada Correctamente");
            res.redirect("/articulos/marcas");   
        }
    });
    
}

module.exports = artController