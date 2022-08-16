$(function () {
    const actionForm = $(".empresa");
    const msgRtnEmpresa = $("#msg-rtn-valid");
    const msgRtnRep = $("#msg-reprtn-valid");

    ///sys/mi-empresa/eliminar/{{ID_EMPRESA}}

    function confirmarDelete(id) {
        Swal.fire({
            title: `¿Esta seguro de eliminar datos de la empresa?`,
            text: "Esta accion es irreversible, debera ingresar nuevamente los datos",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = "/sys/mi-empresa/eliminar/" + id;
            }
        });
    }

    $(".del-empresa").click(function () {
        const id = $(this).attr("id");
        confirmarDelete(id);
    });

    dataFecha();

    function dataFecha() {
        $.ajax({
            url: "/sys/general/empresa",
            success: function (res) {
                $("#fecha_in").val(formatDate(res[0].INICIO_PERIODO));
                $("#fecha_final").val(formatDate(res[0].FIN_PERIODO));
                $("#select-depto").val(res[0].ID_DEPTO);

                var deptoEmpresa = $("#select-depto option:selected").val();
                var ciudadEmpresa = res[0].ID_CIUDAD;

                getCiudad(deptoEmpresa, ciudadEmpresa);
            },
        });
    }

    function getCiudad(id, idCity) {
        $.ajax({
            url: "/persona/ciudad/" + id,
            success: function (res) {
                $("#select-ciudad").empty();
                res.forEach((res) => {
                    $("#select-ciudad").append(`
                  <option value='${res.ID_CIUDAD}'> ${res.NOMBRE_CIUDAD} </option>
                `);
                });
                $("#select-ciudad").val(idCity);
            },
        });
    }

    /* Format Fecha */
    function formatDate(fecha) {
        var d = new Date(fecha),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) {
            month = "0" + month;
        }

        if (day.length < 2) {
            day = "0" + day;
        }

        return [year, month, day].join("-");
    }

    function verificarRtn(rtnEmpresa, rtnRep) {
        if (!isNaN(rtnEmpresa) && !isNaN(rtnRep)) {
            $("#rtn_empresa").removeClass("is-invalid");
            msgRtnEmpresa.removeClass("invalid-feedback");
            msgRtnEmpresa.addClass("valid-feedback");
            msgRtnEmpresa.text("R.T.N. Correcto");
            $("#rtn_empresa").addClass("is-valid");

            $("#rtn_rep").removeClass("is-invalid");
            $("#rtn_rep").addClass("is-valid");
            msgRtnRep.removeClass("invalid-feedback");
            msgRtnRep.addClass("valid-feedback");
            msgRtnRep.text("R.T.N. Correcto");

            return true;
        }
        if (isNaN(rtnEmpresa) && isNaN(rtnRep)) {
            $("#rtn_empresa").removeClass("is-valid");
            msgRtnEmpresa.addClass("invalid-feedback");
            msgRtnEmpresa.text(
                "ingrese en formato requerido. (Ej. 01011824127099, sin guiones)"
            );
            $("#rtn_empresa").addClass("is-invalid");

            $("#rtn_rep").removeClass("is-valid");
            $("#rtn_rep").addClass("is-invalid");
            msgRtnRep.addClass("invalid-feedback");
            msgRtnRep.text(
                "Ingrese en formato requerido. (Ej. 01011821327099, sin guiones)"
            );

            return false;
        }
        if (!isNaN(rtnEmpresa) && isNaN(rtnRep)) {
            $("#rtn_empresa").removeClass("is-invalid");
            msgRtnEmpresa.removeClass("invalid-feedback");
            msgRtnEmpresa.addClass("valid-feedback");
            msgRtnEmpresa.text("R.T.N. Correcto");
            $("#rtn_empresa").addClass("is-valid");

            $("#rtn_rep").removeClass("is-valid");
            $("#rtn_rep").addClass("is-invalid");
            msgRtnRep.addClass("invalid-feedback");
            msgRtnRep.removeClass("valid-feedback");
            msgRtnRep.text(
                "Ingrese en formato requerido. (Ej. 01011821327099, sin guiones)"
            );

            return false;
        }
        if (isNaN(rtnEmpresa) && !isNaN(rtnRep)) {
            $("#rtn_empresa").removeClass("is-valid");
            msgRtnEmpresa.addClass("invalid-feedback");
            msgRtnEmpresa.removeClass("valid-feedback");
            msgRtnEmpresa.text(
                "Ingrese en formato requerido. (Ej. 01011821327099, sin guiones)"
            );
            $("#rtn_empresa").addClass("is-invalid");

            $("#rtn_rep").removeClass("is-invalid");
            $("#rtn_rep").addClass("is-valid");
            msgRtnRep.addClass("valid-feedback");
            msgRtnRep.removeClass("invalid-feedback");
            msgRtnRep.text("R.T.N. Correcto");

            return false;
        }
    }

    function verificarFechas(inicio, final) {
        if (inicio > final) {
            $("#alert").text("El rango establecido es incorrecto");
            $("#alert").removeClass("d-none");
            return false;
        } else {
            $("#alert").addClass("d-none");
            return true;
        }
    }

    actionForm.submit(function (event) {
        var rtn_empresa = $("#rtn_empresa").val();
        var rtn_rep = $("#rtn_rep").val();

        var fechaIn = $("#fecha_in").val();
        var fechaOut = $("#fecha_final").val();

        if (
            verificarRtn(rtn_empresa, rtn_rep) &&
            verificarFechas(fechaIn, fechaOut)
        ) {
            return;
        }

        event.preventDefault();
    });
});
