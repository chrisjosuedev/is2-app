$(function() {
  const btnNuevo = $('#newProveedorCompras')
  const msg = $('#msg-valid')
  const rtnProveedor = $('#rtn')

  btnNuevo.click(function(event) {
    event.preventDefault()
    var id = $('#rtn').val()
    if (verificarProveedor(id)) {
      $.ajax({
        global: false,
        type: 'POST',
        url: '/proveedores/new',
        dataType: 'html',
        data: {
            rtn_proveedor: $("#rtn").val(),
            nombre_proveedor: $("#nproveedor").val(),
            email_proveedor: $("#emailproveedor").val(),
            cel_proveedor: $("#celproveedor").val()
        },
        success: function (result) {
            successDialog()
        }
      })
    }
  })

  // ------------ Mensaje Exitoso
  function successDialog() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      confirmButtonColor: '#3F84FC',
      title: 'Proveedor Guardado Satisfactoriamente',
      showConfirmButton: true
    }).then((result) => {
      if (result.isConfirmed) {   
          // Cerrar y Limpiar Modal
          $("#rtn").val('')
          $("#nproveedor").val('')
          $("#emailproveedor").val('')
          $("#celproveedor").val('')
          msg.removeClass('valid-feedback')
          rtnProveedor.removeClass('is-valid')
          msg.text('')                            
      }
    })
  }

  // ------------------ Funcion de Validacion de RTN
  function verificarProveedor(id) {
    var submitProveedor = false

    // Comprobar si tiene el formato requerido
    if (!isNaN(id)) {
        $.ajax({
            url: '/proveedores/' + id,
            async: false,
            success: function(res) {
                if (res.length === 0) {
                    rtnProveedor.removeClass('is-invalid')
                    msg.addClass('valid-feedback')
                    msg.text("RTN correcto")
                    rtnProveedor.addClass('is-valid')
                    msg.removeClass('invalid-feedback')
                    submitProveedor = true
                }
                else {
                    rtnProveedor.addClass('is-invalid')
                    rtnProveedor.removeClass('is-valid')
                    msg.addClass('invalid-feedback')
                    msg.text("RTN ya fue registrado")
                    msg.removeClass('valid-feedback')
                    submitProveedor = false
                }
            }
        })
        return submitProveedor
    }
    else {
        rtnProveedor.addClass('is-invalid')
        rtnProveedor.removeClass('is-valid')
        msg.addClass('invalid-feedback')
        msg.text("Porfavor, ingrese en formato requerido. (Ej. 01011821270992, sin guiones)")
        msg.removeClass('valid-feedback')
        return submitProveedor
    }
  }

})