const express = require("express");
const router = express.Router();
const sysCont = require("../controllers/sysController");
const { isLoggedIn, existsEmpresa, existsResolucion } = require("../lib/auth");
const { saveLog } = require("../lib/logs");

const { uploadsDir } = require("../config/directories");

const cloudinary = require("../config/cloudinary");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
const myConn = require("../db");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + uniqid() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png/;
        const mimeType = fileType.test(file.mimetype);
        const extname = fileType.test(path.extname(file.originalname));
        if (mimeType && extname) {
            return cb(null, true);
        }
        return cb(new Error("goes wrong on the mimetype!"), false);
    },
}).single("img_adjunta");

/* LISTAR */
router.get("/mi-empresa", isLoggedIn, sysCont.miEmpresa);

router.get(
    "/mi-empresa/agregar",
    isLoggedIn,
    existsEmpresa,
    sysCont.nuevaEmpresa
);

router.post(
    "/mi-empresa/agregar",
    isLoggedIn,
    existsEmpresa,
    sysCont.agregarEmpresa
);

router.get("/mi-empresa/edit/:id", isLoggedIn, sysCont.editarEmpresa);

router.post("/mi-empresa/edit/:id", isLoggedIn, sysCont.editInfoEmpresa);

router.get("/mi-empresa/eliminar/:id", isLoggedIn, sysCont.eliminarEmpresa);

/* JSON */
router.get("/general/empresa", isLoggedIn, sysCont.general);

/* RESOLUCIONES */
router.get("/resoluciones", isLoggedIn, sysCont.miResolucion);

router.get(
    "/resoluciones/agregar",
    isLoggedIn,
    existsResolucion,
    sysCont.nuevaResolucion
);

router.post(
    "/resoluciones/agregar",
    isLoggedIn,
    existsResolucion,
    sysCont.agregarResolucion
);

router.get(
    "/resoluciones/eliminar/:id",
    isLoggedIn,
    sysCont.eliminarResolucion
);

router.get("/resoluciones/detalle", isLoggedIn, sysCont.detalleResolucion);

router.get("/resoluciones/edit/:id", isLoggedIn, sysCont.editarResolucion);

router.post("/resoluciones/edit/:id", isLoggedIn, sysCont.editInfoResolucion);

/* Tickets */
router.get("/tickets", isLoggedIn, sysCont.tickets);

router.post("/tickets", isLoggedIn, (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            req.flash(
                "warning",
                "El tamaño minimo de la imagen debe ser de 1 MB, por favor intente nuevamente."
            );
        } else if (err) {
            req.flash(
                "warning",
                "La extensión del archivo debe ser .jpg | .jpeg | .png, por favor intente nuevamente"
            );
        } else {
            const { id_area_laboral, asunto, descripcion } = req.body;

            const newTicket = {
                id_area_laboral,
                asunto,
                descripcion,
                username: req.user.USERNAME,
            };

            await myConn.query("INSERT INTO tickets set ?", [newTicket]);
            if (req.file) {
                const uploader = async (path) =>
                    await cloudinary.uploads(path, "Tickets");

                const { path } = req.file;

                const myLastTicket = await myConn.query(
                    `
                    SELECT ID_TICKETS 
                    FROM tickets 
                    WHERE username = ? 
                    ORDER BY ID_TICKETS DESC
                    LIMIT 1
                    `,
                    [req.user.USERNAME]
                );

                try {
                    const newPath = await uploader(path);

                    const newTicketWithImage = {
                        img_adjunta: newPath.url,
                    };

                    await myConn.query(
                        "UPDATE tickets set ? WHERE ID_TICKETS = ?",
                        [newTicketWithImage, myLastTicket[0].ID_TICKETS]
                    );

                    fs.unlinkSync(path);
                } catch (err) {
                    throw err;
                }
            }
            saveLog(req.user.USERNAME, `Registro de nuevo ticket.`, "CREACION");
            req.flash("success", "Ticket enviado correctamente");
        }
        return res.redirect("/sys/tickets");
    });
});

router.get("/tickets/detalle/:id", isLoggedIn, sysCont.detalleTickets);

/* Listar Logs */
router.get("/logs", isLoggedIn, async (req, res) => {
    const logs = await myConn.query("SELECT * FROM logs ORDER BY FECHA DESC;");
    res.render("sys/logs", { logs });
});

module.exports = router;
