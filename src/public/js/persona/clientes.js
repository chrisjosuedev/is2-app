const actionForm = $("#edit-cliente");

const deleteCliente = $(".delete-cliente");

const clientesForm = $("#clientes_form");

const msg = $("#msg-valid");
const msgCiudad = $("#ciudad-valid");
const msg_cel = $(".msg-cel-valid");
const msgDepto = $("#depto-valid");
const idCliente = $("#id-cliente");
const celInputJQuery = $(".phone");

/* Cel Input */
const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
    onlyCountries: [
        "hn"
    ],
    autoPlaceholder: "off",
    hiddenInput: "celular",
    utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});
/* End Cel Input */

/* Cel Edit Input */
const phoneEditInputField = document.querySelector("#celular");
const phoneEditInput = window.intlTelInput(phoneEditInputField, {
    onlyCountries: [
        "hn"
    ],
    autoPlaceholder: "off",
    hiddenInput: "celular",
    utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});
/* End Cel Input */

// ----- Eliminar Usuario
function confirmarDelete(id) {
    Swal.fire({
        title: "¿Confirma eliminar el Cliente?",
        icon: "warning",
        confirmButtonColor: "#3F84FC",
        cancelButtonColor: "#FC413F",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location = "/persona/clientes/delete/" + id;
        }
    });
}

// -- Boton Eliminar Cliente
deleteCliente.on("click", function () {
    var id = $(this).attr("id");
    confirmarDelete(id);
});

$(".editCliente").click(function () {
    const dataCliente = $(this).data("cliente");

    var urlPersonaForm = "/persona/clientes/edit/" + dataCliente;

    actionForm.prop("action", urlPersonaForm);

    $.ajax({
        url: "/persona/clientes/" + dataCliente,
        success: function (res) {
            $("#id_persona").val(res[0].ID_PERSONA);
            $("#nombre_persona").val(res[0].NOMBRE_PERSONA);
            $("#apellido_persona").val(res[0].APELLIDO_PERSONA);

            if (res[0].SEXO === 0) {
                $("#male").prop("checked", true);
            } else {
                $("#female").prop("checked", true);
            }

            $("#celular").val(res[0].CELULAR);

            $("#direccion_residencia").val(res[0].DIRECCION_RESIDENCIA);

            $("#select-depto").val(res[0].ID_DEPTO);

            var deptoID = $("#select-depto option:selected").val();
            var ciudadID = res[0].ID_CIUDAD;

            getEditByCiudad(deptoID, ciudadID);
        },
    });
});

function getEditByCiudad(id, idCity) {
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

// Funcion que verifica si se ha seleccionado departamento y ciudad
function verificarSelects() {
    if ($("#depto").val() === "0" || $("#ciudad").val() === "0") {
        $("#depto").addClass("is-invalid");
        $("#depto").removeClass("is-valid");
        msgDepto.addClass("invalid-feedback");
        msgDepto.text("Seleccione un departamento válido");
        msgDepto.removeClass("valid-feedback");

        $("#ciudad").addClass("is-invalid");
        $("#ciudad").removeClass("is-valid");
        msgCiudad.addClass("invalid-feedback");
        msgCiudad.text("Seleccione una Ciudad válida");
        msgCiudad.removeClass("valid-feedback");

        return false;
    } else {
        $("#depto").removeClass("is-invalid");
        msgDepto.addClass("valid-feedback");
        msgDepto.text("Departamento valido");
        $("#depto").addClass("is-valid");
        msgDepto.removeClass("invalid-feedback");

        $("#ciudad").removeClass("is-invalid");
        msgCiudad.addClass("valid-feedback");
        msgCiudad.text("Ciudad valida");
        $("#ciudad").addClass("is-valid");
        msgCiudad.removeClass("invalid-feedback");

        return true;
    }
}

// Funcion que verifica si el cliente ya fue registrado
function verificarCliente(id) {
    var submitCliente = false;

    // Comprobar si tiene el formato requerido
    if (!isNaN(id)) {
        $.ajax({
            url: "/persona/general/" + id,
            async: false,
            success: function (res) {
                if (res.length === 0) {
                    idCliente.removeClass("is-invalid");
                    msg.addClass("valid-feedback");
                    msg.text("Identificacion correcta");
                    idCliente.addClass("is-valid");
                    msg.removeClass("invalid-feedback");
                    submitCliente = true;
                } else {
                    idCliente.addClass("is-invalid");
                    idCliente.removeClass("is-valid");
                    msg.addClass("invalid-feedback");
                    msg.text("Identificacion ya fue registrada");
                    msg.removeClass("valid-feedback");
                    submitCliente = false;
                }
            },
        });
        return submitCliente;
    } else {
        idCliente.addClass("is-invalid");
        idCliente.removeClass("is-valid");
        msg.addClass("invalid-feedback");
        msg.text(
            "Porfavor, ingrese en formato requerido. (Ej. 0101182127099, sin guiones)"
        );
        msg.removeClass("valid-feedback");
        return submitCliente;
    }
}

function verificarNumero(celSelector) {
    if (celSelector.isValidNumber()) {
        celInputJQuery.addClass("is-valid");
        msg_cel.addClass("valid-feedback");
        celInputJQuery.removeClass("is-invalid");
        msg_cel.removeClass("invalid-feedback");
        return true;
    } else {
        celInputJQuery.addClass("is-invalid");
        msg_cel.addClass("invalid-feedback");
        celInputJQuery.removeClass("is-valid");
        msg_cel.removeClass("valid-feedback");
        return false;
    }
}

// ----------- Validacion Formulario Agregar Cliente
clientesForm.submit(function (event) {
    var id = $("#id-cliente").val();

    if (verificarCliente(id) && verificarSelects() && verificarNumero(phoneInput)) {
        return;
    }

    event.preventDefault();
});

// ----------- Validacion Formulario Editar Empleado
actionForm.submit(function (event) {
    if (verificarNumero(phoneEditInput)) {
        return;
    }

    event.preventDefault();
});
