$(function() {
  const btnNuevo = $('#newClienteVenta')
  const msg = $('#msg-valid')
  const msgCiudad = $('#ciudad-valid')
  const msgDepto = $('#depto-valid')
  const idCliente = $('#id-cliente')

  // ---- Funciones de Validacion
  
  // Funcion que verifica si se ha seleccionado departamento y ciudad
  function verificarSelects() {
    if ($('#depto').val() === '0' || $('#ciudad').val() === '0') {
        $('#depto').addClass('is-invalid')
        $('#depto').removeClass('is-valid')
        msgDepto.addClass('invalid-feedback')
        msgDepto.text("Seleccione un departamento válido")
        msgDepto.removeClass('valid-feedback')

        $('#ciudad').addClass('is-invalid')
        $('#ciudad').removeClass('is-valid')
        msgCiudad.addClass('invalid-feedback')
        msgCiudad.text("Seleccione una Ciudad válida")
        msgCiudad.removeClass('valid-feedback')

        return false

    }
    else {
        $('#depto').removeClass('is-invalid')
        msgDepto.addClass('valid-feedback')
        msgDepto.text("Departamento valido")
        $('#depto').addClass('is-valid')
        msgDepto.removeClass('invalid-feedback')

        $('#ciudad').removeClass('is-invalid')
        msgCiudad.addClass('valid-feedback')
        msgCiudad.text("Ciudad valido")
        $('#ciudad').addClass('is-valid')
        msgCiudad.removeClass('invalid-feedback')

        return true
    }
  }

  // Si existe el Cliente
  function verificarCliente(id) {
    var submitCliente = false

    // Comprobar si tiene el formato requerido
    if (!isNaN(id)) {
        $.ajax({
            url: '/persona/general/' + id,
            async: false,
            success: function(res) {
                if (res.length === 0) {
                    idCliente.removeClass('is-invalid')
                    msg.addClass('valid-feedback')
                    msg.text("Identificacion correcta")
                    idCliente.addClass('is-valid')
                    msg.removeClass('invalid-feedback')
                    submitCliente = true
                }
                else {
                    idCliente.addClass('is-invalid')
                    idCliente.removeClass('is-valid')
                    msg.addClass('invalid-feedback')
                    msg.text("Identificacion ya fue registrada")
                    msg.removeClass('valid-feedback')
                    submitCliente = false
                }
            }
        })
        return submitCliente
    }
    else {
        idCliente.addClass('is-invalid')
        idCliente.removeClass('is-valid')
        msg.addClass('invalid-feedback')
        msg.text("Porfavor, ingrese en formato requerido. (Ej. 0101182127099, sin guiones)")
        msg.removeClass('valid-feedback')
        return submitCliente
    }
  }

  btnNuevo.click(function(event) {
    event.preventDefault()
    var id = $('#id-cliente').val()
    if (verificarCliente(id) && verificarSelects()) {
      $.ajax({
        global: false,
        type: 'POST',
        url: '/persona/clientes/new',
        dataType: 'html',
        data: {
            id_persona: $("#id-cliente").val(),
            nombre_persona: $("#npersona").val(),
            apellido_persona: $("#apersona").val(),
            sexo: $(".sex:checked").val(),
            celular: $("#cel").val(),
            direccion_residencia: $("#residencia").val(),
            id_ciudad: $("#ciudad").val(),
            id_depto: $("#depto").val()
        },
        success: function (result) {
            successDialog()
        }
      })
    }
  })

  // Vaciar Select Ciudad
  function emptyCiudad() {
    $('#ciudad').empty()
    $('#ciudad').append(`<option value='0' selected>  - Ciudad - </option>`)
  }

  // ------------ Mensaje Exitoso
  function successDialog() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      confirmButtonColor: '#3F84FC',
      title: 'Cliente Guardado Satisfactoriamente',
      showConfirmButton: true
    }).then((result) => {
      if (result.isConfirmed) {   
          // Cerrar y Limpiar Modal
          $("#id-cliente").val('')
          $("#npersona").val('')
          $("#apersona").val('')
          $("#sexomale").prop("checked", true);
          $("#cel").val('')
          $("#residencia").val('')
          $("#depto").val(0)
          emptyCiudad()
          
          msgCiudad.removeClass('valid-feedback')
          msgDepto.removeClass('valid-feedback')
          msg.removeClass('valid-feedback')
          idCliente.removeClass('is-valid')
          $('#ciudad').removeClass('is-valid')
          $('#depto').removeClass('is-valid')
          msg.text('')
          msgCiudad.text('')
          msgDepto.text('')
          msg.text('')
          
          
      }
    })
  }
})