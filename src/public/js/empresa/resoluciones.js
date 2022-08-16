$(function () {
    const actionForm = $(".resolucion");
    const numInicial = $("#num_inicial");
    const numFinal = $("#num_final");
    const numSerie = $("#serie");

    // Mask
    const RANGO = new Inputmask("99999999");
    const SERIE = new Inputmask("999-999-99");
    RANGO.mask(numInicial);
    RANGO.mask(numFinal);
    SERIE.mask(numSerie);


    function confirmarDelete(id) {
        Swal.fire({
            title: `¿Esta seguro de eliminar la resolucion vigente?`,
            text: "Esta accion es irreversible, debera ingresar nuevamente los datos.",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = "/sys/resoluciones/eliminar/" + id;
            }
        });
    }

    $(".del-resolucion").click(function () {
        const id = $(this).attr("id");
        confirmarDelete(id);
    });


    function verificarCai() {
        var cai = $("#cai").val();

        if (
            cai.charAt(6) != "-" ||
            cai.charAt(13) != "-" ||
            cai.charAt(20) != "-" ||
            cai.charAt(27) != "-" ||
            cai.charAt(34) != "-"
        ) {
            msgAlert(
                "Escriba el CAI en el formato correcto. (Ej. 321433-6E8E7B-8D4DA5-6EC686-EB842B-A3)"
            );
            return false;
        } else {
            $("#alert").addClass("d-none");
            return true;
        }
    }

    function msgAlert(msg) {
        $("#alert").text(msg);
        $("#alert").removeClass("d-none");
    }

    function verificarRango() {
        var inicial = $("#num_inicial").val();
        var final = $("#num_final").val();

        if (parseInt(inicial) > parseInt(final)) {
            msgAlert("Rango inicial no puede ser mayor que el final.");
            return false;
        } else {
            $("#alert").addClass("d-none");
            return true;
        }
    }

    function verificarFecha() {
        const fecha = $("#fecha_limite").val();
        // Systems Date
        const currentDate = new Date();

        // Limit Date
        const dateLimit = new Date(fecha);

        if (dateLimit <= currentDate) {
            msgAlert(
                "La fecha limite, debe ser mayor que la fecha actual del sistema."
            );
            return false;
        } else {
            const diffTime = Math.abs(dateLimit - currentDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const daysAlert = parseInt($("#notificar").val());

            if (daysAlert > diffDays) {
                msgAlert(
                    "Los dias para alertar debe estar en el rango de fecha limite y actual, no puede ser mayor."
                );
                return false;
            } else {
                $("#alert").addClass("d-none");
                return true;
            }
        }
    }

    actionForm.submit(function (event) {
        if (verificarCai() && verificarRango() && verificarFecha()) {
            return;
        }
        event.preventDefault();
    });
});
