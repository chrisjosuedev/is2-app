$(function() {

    const actionForm = $('#edit-catLaboral')


    const deleteCategoria = $('.delete-cat')
    
    // ----- Eliminar Usuario
    function confirmarDelete(id) {
        Swal.fire({
            title: '¿Confirma eliminar la Categoría Laboral?',
            icon: 'warning',
            confirmButtonColor: '#3F84FC',
            cancelButtonColor: '#FC413F',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {   
                window.location = '/config/categoria-laboral/delete/' + id                             
            }
        })
    }

    // -- Boton Eliminar Categoria
    deleteCategoria.on('click', function() {
        var id = $(this).attr("id")
        confirmarDelete(id)
    })

    $('.editCatLaboral').click(function(){
        const dataCatLaboral = $(this).data("catlaboral")

        var urlCatLaboralForm = '/config/categoria-laboral/edit/' + dataCatLaboral

        actionForm.prop('action', urlCatLaboralForm)
        
        $.ajax({
            url: '/config/categoria-laboral/' + dataCatLaboral,
            success: function(res) {
                $('#descripcion_categoria').val(res[0].DESCRIPCION_CATEGORIA);
                $('#salario').val(res[0].SALARIO);
            }
        })

    })
    
})