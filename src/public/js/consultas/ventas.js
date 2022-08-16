$(document).on("click", "#filterDate", function () {
    const tableVentas = $("tbody");
    // Revisar si está checado
    if ($("#filterDate").prop("checked")) {
        $("#rangeDate").removeClass("d-none");
    }

    // Verificar si desea buscar por rango de fechas
    $("#filterDate").click(function () {
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
    });

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
            ventasByDate(fechaIn, fechaOut);
        }
    });

    // ------- Funciones

    function limpiarDate() {
        $("#fecha-in").val("");
        $("#fecha-out").val("");
    }

    function limpiarTabla() {
        tableVentas.html("");
    }

    function ventasByDate(init, out) {
        $.ajax({
            url: "/consultas/ventas/fecha/" + init + "/" + out,
            success: function (res) {
                if (res.length === 0) {
                    $("#alert").html(
                        "No hay ventas registradas entre el " +
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

                        tableVentas.append(`
                <tr>
                  <td>
                    ${res.ID_FACTURA}
                  </td>
                  <td>
                    ${res.NOMBRE_PERSONA} ${res.APELLIDO_PERSONA}
                  </td>
                  <td>
                    ${fecha}
                  </td>
                  <td>
                    ${res.ESTATUS ? "PROCESADA" : "ANULADA"}
                  </td>
                  <td class="text-right">
                    <a href="/consultas/ventas/detalle/${
                        res.ID_FACTURA
                    }" class="btn btn-secondary">
                      <i class="fas fa-eye"></i>
                    </a>
                    <a id="${
                        res.ID_FACTURA
                    }" class="btn btn-warning text-white anul-sel-factura" role="button">
                      <i class="fas fa-ban"></i>
                    </a>
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
            url: "/consultas/ventas/listado",
            success: function (res) {
                res.forEach((res) => {
                    var fecha = new Date(res.FECHA);
                    var dd = String(fecha.getDate()).padStart(2, "0");
                    var mm = String(fecha.getMonth() + 1).padStart(2, "0");
                    var yyyy = fecha.getFullYear();
                    fecha = dd + "/" + mm + "/" + yyyy;

                    tableVentas.append(`
              <tr>
                <td>
                  ${res.ID_FACTURA}
                </td>
                <td>
                  ${res.NOMBRE_PERSONA} ${res.APELLIDO_PERSONA}
                </td>
                <td>
                  ${fecha}
                </td>
                <td>
                  ${res.ESTATUS ? "PROCESADA" : "ANULADA"}
                </td>
                <td class="text-right">
                  <a href="/consultas/ventas/detalle/${
                      res.ID_FACTURA
                  }" class="btn btn-secondary">
                    <i class="fas fa-eye"></i>
                  </a>
                  <a id="${
                      res.ID_FACTURA
                  }" class="btn btn-warning text-white anul-sel-factura" role="button">
                      <i class="fas fa-ban"></i>
                  </a>
                </td>
              </tr>
            `);
                });
            },
        });
    }
});

$(document).on("click", ".anul-sel-factura", function () {
    const id = $(this).attr("id");
    const source = "false";
    if (!id) {
        alertFound(`No existen ventas registradas`);
    } else {
        if (verificarEstatus(id)) {
            confirmarDelete(id, source);
        } else {
            alertFound(`La venta ya ha sido anulada.`);
        }
    }
    /* Anulacion de Factura */
    /* Confirmacion */
    function confirmarDelete(id, source) {
        Swal.fire({
            title: `¿Esta seguro de anular la venta?`,
            text: "Esta accion es irreversible",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = `/transacciones/facturas/anular/${id}/${source}`;
            }
        });
    }

    function alertFound(msg) {
        $("#alert").text(msg);
        $("#alert").removeClass("d-none");

        setTimeout(function () {
            $("#alert").addClass("d-none");
        }, 4000);
    }

    // Verificar Estatus
    function verificarEstatus(id) {
        var flag = true;
        $.ajax({
            url: "/transacciones/facturas/estatus/" + id,
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
