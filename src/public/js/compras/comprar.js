$(function () {
    const noFound = $("#alert");
    const tableCompra = $("tbody");
    const btnAgregar = $("#btn-agregar");
    const comprasForm = $("#compra_form");
    const idCompra = $("#id_compra");
    const msgCai = $("#msg-cai-valid");

    // Mask
    var im = new Inputmask("999-999-99-99999999");
    im.mask(idCompra);

    function verificarCai() {
        var cai = $("#cai").val();

        if (
            cai.charAt(6) != "-" ||
            cai.charAt(13) != "-" ||
            cai.charAt(20) != "-" ||
            cai.charAt(27) != "-" ||
            cai.charAt(34) != "-"
        ) {
            // Error
            $("#cai").addClass("is-invalid");
            $("#cai").removeClass("is-valid");
            msgCai.addClass("invalid-feedback");
            msgCai.text(
                "Formato CAI invalido (Valido: Ej. 03F2AA-D172AA-484D9E-6599EE-7BF412-CE)"
            );
            msgCai.removeClass("valid-feedback");
            return false;
        } else {
            // Succesfull
            $("#cai").removeClass("is-invalid");
            msgCai.addClass("valid-feedback");
            msgCai.text("Formato CAI correcto.");
            $("#cai").addClass("is-valid");
            msgCai.removeClass("invalid-feedback");
            return true;
        }
    }

    // Verificar Validez Documento
    $("#btn-verificar-compra").click(function () {
        window.open(
            "https://validador.sar.gob.hn/",
            "Verificar Documento",
            "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=500,height=800"
        );
    });

    // ----- Anular Compra
    function confirmarDelete(id) {
        Swal.fire({
            title: `¿Esta seguro de anular la compra?`,
            text: "Esta accion es irreversible",
            icon: "warning",
            confirmButtonColor: "#3F84FC",
            cancelButtonColor: "#FC413F",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = "/transacciones/compras/anular";
            }
        });
    }

    // Confirmacion de anulacion
    $(".anul-ultima-compra").click(function () {
        var id = $(this).attr("id");
        if (!id) {
            alertFound(`No existen compras registradas`);
        } else {
            if (verificarEstatus(id)) {
                confirmarDelete(id);
            } else {
                alertFound(`La compra ya ha sido anulada.`);
            }
        }
    });

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

    // Evitar Submit Post
    $(".compra_input").keypress(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            e.preventDefault();
        }
    });

    // Buscar ENTER KEY Proveedor
    $("#id_proveedor").keypress(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            var id = $(this).val();
            startProveedor(id);
        }
    });

    // Buscar Click Proveedor
    $("#btn_buscar_proveedor").click(function () {
        var id = $("#id_proveedor").val();
        startProveedor(id);
    });

    // Buscar ENTER KEY Articulo
    $("#id_producto").keypress(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            var cod = $(this).val();
            startArticulo(cod);
        }
    });

    // Buscar Click Articulo
    $("#btn_buscar_producto").click(function () {
        var cod = $("#id_producto").val();
        startArticulo(cod);
    });

    // ENTER FOCUS
    $("#cantidad_compra").keypress(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            $("#precio_compra").focus();
        }
    });

    // ENTER PRECIO COMPRA
    $("#precio_compra").keypress(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
            agregarTabla();
        }
    });

    // Boton agregar
    btnAgregar.click(function () {
        agregarTabla();
    });

    // ------------- FUNCIONES

    // Agregar a tabla
    function agregarTabla() {
        let cantidad = $("#cantidad_compra").val();
        let precioUnit = $("#precio_compra").val();
        let proveedor = $("#id_proveedor").val();

        if (cantidad === "" || precioUnit === "" || proveedor === "") {
            alertFound("Por favor, ingrese todos los datos solicitados.");
        } else {
            let stItem = parseInt(cantidad) * parseFloat(precioUnit);

            tableCompra.append(`
                <tr class="isRow">
                    <td> ${$("#id_producto").val()} 
                        <input type="number" name="id_articulo" value="${$(
                            "#id_producto"
                        ).val()}" hidden/> 
                    </td>
                    <td> ${$("#descripcion").val()} </td>
                    <td> ${cantidad} 
                        <input type="number" name="cantidad" value="${cantidad}" hidden/>
                    </td>
                    <td> ${precioUnit} 
                        <input type="number" name="precio_compra" value="${precioUnit}" hidden/>
                    </td>
                    <td> L. ${stItem.toFixed(2)} </td>
                    <td>
                        <button class="btn btn-danger btnDeleteItem">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);

            cleanFields();

            $(".btnDeleteItem").click(function () {
                $(this).closest("tr").remove();
                sumarDatos();
            });
        }

        sumarDatos();
    }

    // Calculo de Subtotal
    function sumarDatos() {
        var st = 0;
        var isv = 0;
        var total = 0;

        $("#table-compra tbody tr").each(function () {
            var stColumn = $(this).find("td").eq(4).html();
            var newStColumn = stColumn.substring(4, stColumn.length - 1);
            st += parseFloat(newStColumn);
        });

        isv = st * 0.15;
        total = st + isv;

        $("#st-compra").val("L. " + st.toFixed(2));
        $("#isv").val("L. " + isv.toFixed(2));
        $("#total").val("L. " + total.toFixed(2));
        // Contador de Filas
        $("#contadorFilas").val(contarFilas());
    }

    function cleanFields() {
        $("#id_producto").val("");
        $("#descripcion").val("");
        $("#cantidad_compra").val("");
        $("#precio_compra").val("");
        $("#id_producto").focus();
    }

    function startArticulo(idArticulo) {
        if (idArticulo === "") {
            alertFound("Ingrese código del Artículo");
        } else {
            foundArticulo(idArticulo);
        }
    }

    function startProveedor(idProveedor) {
        if (idProveedor === "") {
            alertFound("Ingrese código del Proveedor");
        } else {
            foundProveedor(idProveedor);
        }
    }

    function foundProveedor(id) {
        $.ajax({
            url: "/proveedores/" + id,
            success: function (res) {
                if (res.length === 0) {
                    alertFound(
                        "Proveedor no existe, revise el código ingresado"
                    );
                } else {
                    $("#nombre_proveedor").val(res[0].NOMBRE_PROVEEDOR);
                    $("#cel_pro").val(res[0].CEL_PROVEEDOR);
                    $("#id_compra").focus();
                }
            },
        });
    }

    function foundArticulo(codigo) {
        $.ajax({
            url: "/articulos/general/" + codigo,
            success: function (res) {
                if (res.length === 0) {
                    alertFound(
                        "Artículo no existe, revise el código ingresado"
                    );
                } else {
                    $("#descripcion").val(res[0].DESCRIPCION);
                    $("#cantidad_compra").focus();
                }
            },
        });
    }

    function alertFound(msg) {
        noFound.text(msg);
        noFound.removeClass("d-none");

        setTimeout(function () {
            noFound.addClass("d-none");
        }, 8000);
    }

    function contarFilas() {
        var numFilas = 0;
        $(".isRow").each(function () {
            numFilas++;
        });
        return numFilas;
    }

    // -------------------- Validar Formulario
    // ----- Verificar que no ha modificado el Proveedor
    function verificarProveedor(rtn) {
        var flag = true;
        $.ajax({
            url: "/proveedores/" + rtn,
            async: false,
            success: function (res) {
                if (res.length === 0) {
                    alertFound(
                        "Proveedor no existe, revise el código ingresado"
                    );
                    $("#id_proveedor").focus();
                    flag = false;
                } else {
                    flag = true;
                }
            },
        });
        return flag;
    }

    comprasForm.submit(function (event) {
        var rtn = $("#id_proveedor").val();

        if (verificarProveedor(rtn) && contarFilas() > 0 && verificarCai()) {
            $(".loader-wrapper").fadeIn("slow");
            return;
        }

        alertFound("Por favor, ingrese los datos correctamente.");
        event.preventDefault();
    });
});
