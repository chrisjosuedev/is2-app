const noFound = $("#alert");
const tableVenta = $("tbody");
const selectVenta = $("#articles");
const devParcial = $(".devolucion-parcial");
const btnAgregar = $("#btn-agregar");
const devolucionesForm = $("#devoluciones_form");

btnAgregar.prop("disabled", true);
$("#loading-invoice").addClass("d-none")

// --- Configuracion Tipo de Devolucion
$("#totalDevolucion").change(function () {
    if (this.checked) {
        devParcial.addClass("d-none");
    } else {
        devParcial.removeClass("d-none");
    }
    cleanFields();
    tableVenta.html("");
});

$("#parcialDevolucion").change(function () {
    if (this.checked) {
        devParcial.removeClass("d-none");
    } else {
        devParcial.addClass("d-none");
    }
    cleanFields();
    tableVenta.html("");
});

// Evitar Submit Post ---
$(".factura_input").keypress(function (e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code == 13) {
        e.preventDefault();
    }
});

// Buscar ENTER KEY Factura
$("#id_factura").keypress(function (e) {
    const code = e.keyCode ? e.keyCode : e.which;
    if (code == 13) {
        let id = $(this).val();
        startFactura(id);
    }
});

// Buscar Click Factura
$("#btn_buscar_factura").click(function () {
    var id = $("#id_factura").val();
    startFactura(id);
});

const startFactura = (idFactura) => {
    if (idFactura === "") {
        alertFound("Ingrese código de la Factura");
    } else {
        validateFactura(idFactura);
    }
};

const validateFactura = (id) => {
    $.ajax({
        url: `/transacciones/devoluciones/factura/validar/${id}`,
        success: function (res) {
            if (res.length === 0) {
                foundFactura(id);
            } else {
                if (res[0].TIPO) {
                    alertFound(
                        "Articulos de Factura ingresada ya han sido devueltos en su totalidad."
                    );
                } else if (
                    !res[0].TIPO &&
                    $("#totalDevolucion").is(":checked")
                ) {
                    alertFound(
                        "Articulos de Factura pueden ser devueltos en tipo parcial."
                    );
                } else if (
                    !res[0].TIPO &&
                    $("#parcialDevolucion").is(":checked")
                ) {
                    foundFactura(id);
                }
            }
        },
    });
};

/* Buscar Factura */
const foundFactura = (id) => {
    $.ajax({
        url: `/transacciones/devoluciones/factura/${id}`,
        success: function (res) {
            if (res[1].length === 0) {
                alertFound(
                    "Factura no existente o anulada, revise el código ingresado"
                );
            } else {
                $("#name-cli").val(res[1][0].Cliente);
                $("#name-emp").val(res[1][0].Empleado);
                if ($("#totalDevolucion").is(":checked")) {
                    agregarTabla(res[0]);
                } else {
                    agregarMultipleSelect(res[0]);
                }
            }
        },
    });
};

// Boton agregar
btnAgregar.click(function () {
    agregarArticuloTabla();
});

/* Alert */
const alertFound = (msg) => {
    noFound.text(msg);
    noFound.removeClass("d-none");

    setTimeout(function () {
        noFound.addClass("d-none");
    }, 5000);
};

const contarFilas = () => {
    var numFilas = 0;
    $(".isRow").each(function () {
        numFilas++;
    });
    return numFilas;
};

const checkAmount = (id) => {
    var cumAmount = 0;
    $("#table-venta tbody tr").each(function () {
        var idColumn = $(this).find(".idArt").val();
        var amountColumn = $(this).find(".amount").val();
        if (idColumn === id) {
            cumAmount += parseInt(amountColumn);
        }
    });

    return cumAmount;
};

const sumarDatos = () => {
    var st = 0;
    var des = 0;
    var isv = 0;
    var total = 0;

    $("#table-venta tbody tr").each(function () {
        var stColumn = $(this).find("td").eq(4).html();
        var descColumn = $(this).find("td").eq(5).html().trim();
        var newStColumn = stColumn.substring(4, stColumn.length - 1);
        var newDescColumn = parseFloat(descColumn);
        st += parseFloat(newStColumn);
        des += parseFloat(newDescColumn);
    });

    isv = st * 0.15;
    total = st - des + isv;

    $("#st-venta").val("L. " + st.toFixed(2));
    $("#desc-st").val("L. " + des.toFixed(2));

    $("#isv").val("L. " + isv.toFixed(2));
    $("#total").val("L. " + total.toFixed(2));

    $("#total_fact").val(total.toFixed(2));
};

const cleanFields = () => {
    $("#cantidad_compra").val("");
    $("#desc").val("");
    $("#precio_unit").val("");
    $("#st-venta").val("L. 0.00");
    $("#desc-st").val("L. 0.00");

    $("#isv").val("L. 0.00");
    $("#total").val("L. 0.00");

    $("#total_fact").val("L. 0.00");
    $("#id_producto").focus();
};

selectVenta.on("click", "option", function () {
    $("#cantidad_compra").val("");
    $("#precio_unit").val("");
    $("#desc").val("");
    let id = this.value;
    const idfact = $("#id_factura").val();

    if (idfact === "") {
        alertFound("Por favor, ingrese el numero de factura");
    } else {
        $.ajax({
            url: `/transacciones/devoluciones/factura/cantidad/${id}/${idfact}`,
            success: function (res) {
                if (res.length === 0) {
                    dataSelect(id, idfact);
                } else {
                    dataAmount(res[0]);
                }
            },
        });
    }
});

// No hay devoluciones de el articulo
const dataSelect = (id, idfact) => {
    $.ajax({
        url: `/transacciones/devoluciones/factura/articulos/${id}/${idfact}`,
        success: function (res) {
            $("#cantidad_compra").val(res[0].CANTIDAD);

            $("#cantidad_compra").prop("max", res[0].CANTIDAD);

            $("#precio_unit").val(res[0].PRECIO_UNIT);
            let desc = parseFloat(res[0].DISC) / parseInt(res[0].CANTIDAD);
            $("#desc").val(desc.toFixed(2));
            btnAgregar.prop("disabled", false);
        },
    });
};

// Cuando ya existen devoluciones
const dataAmount = (dataArticle) => {
    let vend = parseInt(dataArticle.Cantidad_Vend);
    let dev = parseInt(dataArticle.Cantidad_Dev);
    if (vend > dev) {
        $("#cantidad_compra").val(vend - dev);
        $("#cantidad_compra").prop("max", vend - dev);
        $("#precio_unit").val(dataArticle.PRECIO_UNIT);
        let desc = parseFloat(dataArticle.DESCUENTO) / (vend - dev);
        $("#desc").val(desc.toFixed(2));

        btnAgregar.prop("disabled", false);
    } else {
        alertFound(
            "Ya no puede devolver mas unidades del articulo seleccionado."
        );
        btnAgregar.prop("disabled", true);
    }
};

/* SELECTS - DEVOLUCION PARCIAL */
const agregarMultipleSelect = (dataFacturaParcial) => {
    tableVenta.html("");
    selectVenta.empty();

    dataFacturaParcial.forEach((item) => {
        selectVenta.append(`
        <option value='${item.ID_ARTICULO}'> ${item.DESCRIPCION} </option>
        `);
    });
};

const agregarArticuloTabla = () => {
    const maxValue = $("#cantidad_compra").attr("max");
    let cantidad = $("#cantidad_compra").val();
    let id = $("#articles option").filter(":selected").val();
    if (cantidad === "") {
        alertFound("Por favor, ingrese cantidad a devolver.");
        $("#cantidad_compra").focus();
    } else {
        let descripcion = $("#articles option").filter(":selected").text();
        let precioUnit = $("#precio_unit").val();
        let desc = $("#desc").val();

        let stItem = parseInt(cantidad) * parseFloat(precioUnit);

        tableVenta.append(`
              <tr class="isRow" id="${id}">
                    <td> ${id} 
                      <input type="number" class="idArt" name="id_articulo" value="${id}" hidden/> 
                    </td>
                    <td> ${descripcion} </td>
                    <td> ${cantidad} 
                        <input class="form-control amount" type="number" name="cantidad" value="${cantidad}" hidden />
                    </td>
                    <td> ${precioUnit} 
                        <input type="number" name="precio_unit" value="${precioUnit}" hidden/>
                    </td>
                    <td> L. ${stItem.toFixed(2)} </td>
                    <td> ${desc} 
                        <input class="form-control" type="number" name="descuento" value="${desc}" hidden/>
                    </td>
                    <td>
                        <input class="form-control" type="text" name="obs"/>
                    </td>
                    <td>
                      <button class="btn btn-danger btnDeleteItem">
                          <i class="fa fa-trash"></i>
                      </button>
                    </td> 
              </tr>
        `);

        $(".btnDeleteItem").click(function () {
            $(this).closest("tr").remove();
            sumarDatos();
        });
    }

    if (checkAmount(id) > maxValue) {
        alertFound(
            "La cantidad de articulos que desea devolver excede la cantidad adquirida por el cliente, por favor, ingrese los datos correctamente."
        );
        $("#table-venta tbody tr:last").remove();
    } else {
        sumarDatos();
    }
};

/* TABLA - DEVOLUCION TOTAL */
const agregarTabla = (dataFactura) => {
    tableVenta.html("");
    // Llenar Tabla
    dataFactura.forEach((item) => {
        let stItem = parseInt(item.CANTIDAD) * parseFloat(item.PRECIO_UNIT);

        tableVenta.append(`
              <tr class="isRow" id="${item.ID_ARTICULO}">
                  <td> ${item.ID_ARTICULO} 
                      <input type="number" name="id_articulo" value="${
                          item.ID_ARTICULO
                      }" hidden/> 
                  </td>
                  <td> ${item.DESCRIPCION} </td>
                  <td> ${item.CANTIDAD} 
                  <input class="form-control" type="number" name="cantidad" value="${
                      item.CANTIDAD
                  }" hidden />
                  </td>
                  <td> ${item.PRECIO_UNIT} 
                  <input type="number" name="precio_unit" value="${
                      item.PRECIO_UNIT
                  }" hidden/>
                  </td>
                  <td> L. ${stItem.toFixed(2)} </td>
                  <td> ${item.DISC} 
                  <input class="form-control" type="number" name="descuento" value="${
                      item.DISC
                  }" hidden/>
                  </td>
                  <td>
                  <input class="form-control" type="text" name="obs"/>
                    </td> 
              </tr>
        `);
    });
    sumarDatos();
};

// ---- Submit Button ----
devolucionesForm.submit(function (event) {
    if (contarFilas() > 0) {
        $("#loading-invoice").removeClass("d-none");
        return;
    }

    alertFound("Por favor, ingrese los datos correctamente.");
    event.preventDefault();
});
