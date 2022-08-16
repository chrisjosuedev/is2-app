$(function () {
    $(".loader-wrapper").fadeOut("slow")
    const verificarDias = () => {
        $.ajax({
            url: "/sys/resoluciones/detalle",
            success: function (res) {
                const alertDays = parseInt(res[0].NOTIFICAR);

                const dateLimit = new Date(res[0].FECHA_LIMITE);

                const currentDate = new Date();
                const diffTime = dateLimit - currentDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > alertDays) {
                    $("#alert-container").addClass("d-none");
                    $("#alert-resolucion").addClass("d-none");
                    $("#alert-resolucion").text("");
                } else if (diffDays <= alertDays) {
                    if (diffDays === -1) {
                        $("#alert-container").removeClass("d-none");
                        $("#alert-resolucion").removeClass("d-none");
                        $("#alert-resolucion").html(`
                            <i class="fas fa-exclamation-circle"></i> Resolución vencida <strong> hoy. </strong>
                        `);
                    } else if (diffDays === -0) {
                        $("#alert-container").removeClass("d-none");
                        $("#alert-resolucion").removeClass("d-none");
                        $("#alert-resolucion").html(`
                            <i class="fas fa-exclamation-circle"></i> Resolución vence <strong> mañana. </strong>
                        `);
                    } else if (diffDays < 0) {
                        $("#alert-container").removeClass("d-none");
                        $("#alert-resolucion").removeClass("d-none");
                        $("#alert-resolucion").html(`
                            <i class="fas fa-exclamation-circle"></i> Resolución vencida hace <strong> ${Math.abs(
                                diffDays
                            )} días. </strong>
                        `);
                    } else {
                        $("#alert-container").removeClass("d-none");
                        $("#alert-resolucion").removeClass("d-none");
                        $("#alert-resolucion").html(`
                            <i class="fas fa-exclamation-circle"></i> Resolución pronta a vencer. Faltan <strong> ${diffDays} días. </strong>
                        `);
                    }
                }
            },
        });
    };

    verificarDias();

    function confirmarSalir() {
        Swal.fire({
            title: "¿Desea salir de la Aplicación?",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Salir",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                $(".loader-wrapper").fadeIn("slow");
                setTimeout(() => {
                    window.location = "/logout";
                }, 1000);
            }
        });
    }

    $("#logout").on("click", function () {
        confirmarSalir();
    });
});
