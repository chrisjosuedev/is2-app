$(function () {
    const noRows = $("#alert");
    const bEmp = $("#bEmp");
    const idEmp = $("#idEmp");

    const idNameEmp = $("#nameEmp");
    const idCodEmp = $("#codEmp");

    const actionForm = $("#edit-Usuario");

    const user = $("#user");
    const msg = $("#msg-valid");

    const formusers = $("#users_form");

    const guardarUsuario = $("#saveUsuario");

    const deleteUsuario = $(".delete-user");

    const rolSelect = $(".rol_selected");

    // ----- Eliminar Usuario
    function confirmarDelete(id) {
        Swal.fire({
            title: "¿Confirma realizar la acción?",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = "/config/usuarios/anular/" + id;
            }
        });
    }

    // -- Boton Eliminar Usuario
    deleteUsuario.on("click", function () {
        var user = $(this).attr("id");
        confirmarDelete(user);
    });

    // ------------- Mensaje de Validacion
    function msgValidacion(msg) {
        noRows.text(msg);
        noRows.removeClass("d-none");

        setTimeout(function () {
            noRows.addClass("d-none");
        }, 5000);
    }

    // ----------------- Agregar Usuario -------------------- //
    bEmp.on("click", function () {
        var id = idEmp.val();
        if (id === "") {
            msgValidacion("Por favor, ingrese el DNI del empleado.");
            $("#idEmp").focus();
        } else {
            $.ajax({
                url: "/persona/empleados/" + id,
                success: function (empleado) {
                    if (empleado.length === 0) {
                        msgValidacion(
                            "Empleado no existe, ingrese el DNI correctamente."
                        );
                        $("#idEmp").focus();
                    } else {
                        if (!empleado[0].ESTATUS) {
                            msgValidacion(
                                "Empleado esta deshabilitado, no se le puede asignar un usuario."
                            );
                            $("#idEmp").focus();
                        } else {
                            idCodEmp.val(empleado[0].ID_EMPLEADO);
                            populateRoleSelect(empleado[0].PUESTO);
                            if (userId(idCodEmp.val())) {
                                // No tiene usuario
                                idNameEmp.val(
                                    empleado[0].NOMBRE_PERSONA +
                                        " " +
                                        empleado[0].APELLIDO_PERSONA
                                );
                                $("#user").focus();
                                guardarUsuario.attr("disabled", false);
                            } else {
                                // Tiene usuario
                                idEmp.focus();
                                msgValidacion(
                                    "El empleado ya tiene un perfil registrado"
                                );
                            }
                        }
                    }
                },
            });
        }
    });

    // Verificar el disponibilidad del usuario
    function verificarUsuario(usuario) {
        var submitUsuario = false;
        $.ajax({
            url: "/config/usuarios/" + usuario,
            async: false,
            success: function (res) {
                if (res.length === 0) {
                    // NO existe
                    submitUsuario = true;
                } else {
                    // SI existe
                    submitUsuario = false;
                }
            },
        });
        return submitUsuario;
    }

    // ---------- Editar ----------------

    $(".editUsuario").click(function () {
        const dataUsuarios = $(this).data("usuario");

        var urlUsuariosForm = "/config/usuarios/edit/" + dataUsuarios;

        actionForm.prop("action", urlUsuariosForm);

        $.ajax({
            url: "/config/usuarios/" + dataUsuarios,
            success: function (res) {
                $("#username").val(res[0].USERNAME);
                $("#email_user").val(res[0].EMAIL_USER);
                $("#select-rol").val(res[0].ID_ROL);
                populateRoleSelect(res[0].ID_CATEGORIA);
            },
        });
    });

    // Verificar si se desea una nueva contraseña para el usuario
    $("#verify-Password").click(function () {
        if ($("#verify-Password").prop("checked")) {
            $("#password").removeClass("d-none");
            $("#password").focus();
        } else {
            $("#password").addClass("d-none");
        }
    });

    // Verificar si el empleado ya tiene un usuario
    function userId(cod) {
        var flag = true;
        $.ajax({
            url: "/config/usuarios/empleados/" + cod,
            async: false,
            success: function (res) {
                if (res.length === 0) {
                    flag = true;
                } else {
                    flag = false;
                }
            },
        });
        return flag;
    }

    // Populate Select
    const populateRoleSelect = (id) => {
        rolSelect.empty();
        if (id === 1 || id === 4) {
            rolSelect.append(`<option value="3"> AUTOR </option>`);
        } else if (id === 3) {
            rolSelect.append(`<option value="2"> EDITOR </option>`);
        } else if (id === 5) {
            rolSelect.append(`<option value="1"> ADMINISTRADOR </option>`);
        } else if (id === 6) {
            rolSelect.append(`<option value="4"> DISEÑADOR </option>`);
        } else if (id === 9 || id === 8) {
            rolSelect.append(`<option value="5"> GESTOR </option>`);
        }
    };

    // --------- Verificar Roles
    function verificarRol(id) {
        var rol = false;
        $.ajax({
            url: "/persona/empleados/" + id,
            async: false,
            success: function (empleado) {
                if ($("#rol-selected").val() === "1" && empleado.PUESTO != 5) {
                    rol = false;
                } else if (
                    $("#rol-selected").val() === "4" &&
                    empleado.PUESTO != 6
                ) {
                    rol = false;
                } else {
                    rol = true;
                }
            },
        });
        return rol;
    }

    formusers.submit(function (event) {
        // var idEmpleado = $('#codEmp').val()

        if (verificarUsuario(user.val())) {
            return;
        } else if (!verificarUsuario(user.val())) {
            /*
        if (!verificarRol(idEmpleado)) {
            msgValidacion("El empleado no puede tener el control de acceso seleccionado.")
        }
        */
            msgValidacion("Por favor, cambie el nombre de usuario.");
        }
        event.preventDefault();
    });
});
