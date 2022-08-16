$(document).on("click", "#filterDate", function () {
    const tableCompras = $("tbody");

    // Revisar si está checado
    if ($("#filterDate").prop("checked")) {
        $("#rangeDate").removeClass("d-none");
    }

    // Verificar si desea buscar por rango de fechas
    if ($("#filterDate").prop("checked")) {
        $("#rangeDate").removeClass("d-none");
    } else {
        $("#rangeDate").addClass("d-none");
        // Comprobar value, si es '' no rellenar tabla de nuevo, si lo es rellenar y poner valores
        // por defecto
        if ($("#fecha-in").val() === "" && $("#fecha-out").val() === "") {
            limpiarDate();
        } else {
            limpiarDate();
            limpiarTabla();
            defaultTable();
        }
    }

    $("#fecha-out").on("change", function () {
        var fechaIn = $("#fecha-in").val();
        var fechaOut = $(this).val();

        if (fechaIn > fechaOut) {
            $("#alert").text("El rango establecido es incorrecto");
            $("#alert").removeClass("d-none");

            setTimeout(function () {
                $("#alert").addClass("d-none");
            }, 5000);
        } else {
            comprasByDate(fechaIn, fechaOut);
        }
    });

    // ------- Funciones

    function limpiarDate() {
        $("#fecha-in").val("");
        $("#fecha-out").val("");
    }

    function limpiarTabla() {
        tableCompras.html("");
    }

    function comprasByDate(init, out) {
        $.ajax({
            url: `/consultas/compras/fecha/${init}/${out}`,
            success: function (res) {
                if (res.length === 0) {
                    $("#alert").html(
                        "No hay compras registradas entre el " +
                            "<strong>" +
                            init +
                            "</strong>" +
                            " y el " +
                            "<strong>" +
                            out +
                            "</strong>"
                    );
                    $("#alert").removeClass("d-none");

                    setTimeout(function () {
                        $("#alert").addClass("d-none");
                    }, 5000);
                } else {
                    limpiarTabla();
                    res.forEach((res) => {
                        var fecha = new Date(res.FECHA);
                        var dd = String(fecha.getDate()).padStart(2, "0");
                        var mm = String(fecha.getMonth() + 1).padStart(2, "0");
                        var yyyy = fecha.getFullYear();
                        fecha = dd + "/" + mm + "/" + yyyy;

                        tableCompras.append(`
            <tr>
                <td>
                    ${res.ID_COMPRA}
                </td>
                <td>
                    ${res.NOMBRE_PROVEEDOR}
                </td>
                <td>
                    ${fecha}
                </td>
                <td>
                    ${res.ESTATUS ? "PROCESADA" : "ANULADA"}
                </td>
                <td>
                    <a href="/consultas/compras/detalle/${
                        res.ID
                    }" class="btn btn-secondary mb-2 btn-block">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button type="button" id="${
                        res.ID
                    }" class="btn btn-warning anul-compra btn-block">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
            `);
                    });
                }
            },
        });
    }

    function defaultTable() {
        $.ajax({
            url: "/consultas/compras/listado",
            success: function (res) {
                res.forEach((res) => {
                    var fecha = new Date(res.FECHA);
                    var dd = String(fecha.getDate()).padStart(2, "0");
                    var mm = String(fecha.getMonth() + 1).padStart(2, "0");
                    var yyyy = fecha.getFullYear();
                    fecha = dd + "/" + mm + "/" + yyyy;

                    tableCompras.append(`
                <tr>
                    <td>
                        ${res.ID_COMPRA}
                    </td>
                    <td>
                        ${res.NOMBRE_PROVEEDOR}
                    </td>
                    <td>
                        ${fecha}
                    </td>
                    <td>
                        ${res.ESTATUS ? "PROCESADA" : "ANULADA"}
                    </td>
                    <td>
                        <a href="/consultas/compras/detalle/${
                            res.ID
                        }" class="btn btn-secondary mt-2 btn-block">
                        <i class="fas fa-eye"></i>
                    </a>
                        <button type="button" id="${
                            res.ID
                        }" class="btn btn-warning anul-compra btn-block">
                        <i class="fas fa-ban"></i>
                        </button>
                    </td>
                </tr>
          `);
                });
            },
        });
    }
});

$(document).on("click", ".anul-compra", function () {
    const tableCompras = $("tbody");

    var id = $(this).attr("id");
    if (verificarEstatus(id)) {
        confirmarDelete(id);
    } else {
        $("#alert").text(`La compra seleccionada ya ha sido anulada.`);
        $("#alert").removeClass("d-none");

        setTimeout(function () {
            $("#alert").addClass("d-none");
        }, 5000);
    }

    function confirmarDelete(id) {
        Swal.fire({
            title: `¿Esta seguro de anular la compra`,
            text: "Esta accion es irreversible",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = "/transacciones/compras/anular/" + id;
            }
        });
    }

    // Confirmacion de anulacion
    // $(".anul-compra").click(function () {

    // });

    // Verificar Estatus
    function verificarEstatus(id) {
        var flag = true;
        $.ajax({
            url: "/transacciones/compras/estatus/" + id,
            async: false,
            success: function (res) {
                if (res[0].ESTATUS) {
                    flag = true;
                } else {
                    flag = false;
                }
            },
        });
        return flag;
    }
});
