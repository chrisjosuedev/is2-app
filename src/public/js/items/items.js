$(function () {
  const actionForm = $("#edit-art");

  const deleteItem = $(".del-item");

  function confirmarDelete(id) {
    Swal.fire({
      title: "¿Confirma eliminar el articulo?",
      icon: "warning",
      confirmButtonColor: "#3F84FC",
      cancelButtonColor: "#FC413F",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location = "/articulos/delete/" + id;
      }
    });
  }

  deleteItem.on("click", function () {
    var id = $(this).attr("id");
    confirmarDelete(id);
  });

  $(".editItem").click(function () {
    const dataItem = $(this).data("art");
    var urlItemForm = "/articulos/edit/" + dataItem;
    console.log(urlItemForm)
    actionForm.prop("action", urlItemForm);

    $.ajax({
      url: "/articulos/general/" + dataItem,
      success: function (res) {
        $("#descripcion-edit").val(res[0].DESCRIPCION);
        $("#marca-edit").val(res[0].ID_MARCA);
        $("#linea-edit").val(res[0].ID_TIPOARTICULO);
        $("#precio-edit").val(res[0].PRECIO_UNIT);
        $("#descuento-edit").val(res[0].DESCUENTO);
      },
    });
  });

  

});
