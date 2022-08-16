$(function() {

    const actionForm = $('#edit-proveedor')

    const deleteProveedor = $('.delete-proveedor')

    const proveedoresForm = $('#proveedores_form')

    const msg = $('#msg-valid')
    const rtnProveedor = $('#rtn')
    
    // ----- Eliminar Proveedor
    function confirmarDelete(id) {
        Swal.fire({
            title: '¿Confirma eliminar el Proveedor?',
            icon: 'warning',
            confirmButtonColor: '#3F84FC',
            cancelButtonColor: '#FC413F',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {   
                window.location = '/proveedores/delete/' + id                             
            }
        })
    }

    // -- Boton Eliminar Proveedor
    deleteProveedor.on('click', function() {
        var id = $(this).attr("id")
        confirmarDelete(id)
    })


    $('.editProveedor').click(function(){
        const dataProveedor = $(this).data("proveedor")

        var urlProveedorForm = '/proveedores/edit/' + dataProveedor

        actionForm.prop('action', urlProveedorForm)
        
        $.ajax({
            url: '/proveedores/' + dataProveedor,
            success: function(res) {
                $('#id_proveedor').val(res[0].RTN_PROVEEDOR);
                $('#nombre_proveedor').val(res[0].NOMBRE_PROVEEDOR);
                $('#email_proveedor').val(res[0].EMAIL_PROVEEDOR);
                $('#cel_proveedor').val(res[0].CEL_PROVEEDOR);
            }
        })

    })

    // --------------------------- Validacion de Envio de Proveedores
    // Funcion que verifica si el proveedor ya fue registrado
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

    // ----------- Validacion Formulario Agregar Proveedor
    proveedoresForm.submit(function(event) {
        var id = $('#rtn').val()

        if (verificarProveedor(id)) {
            return
        }
        
        event.preventDefault() 
        
    })
    
})