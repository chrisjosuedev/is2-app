$(function () {
    const actionForm = $('#edit-marca')


    const deleteMarca = $('.delete-marca')
    
    function confirmarDelete(id) {
        Swal.fire({
            title: '¿Confirma eliminar la marca?',
            icon: 'warning',
            confirmButtonColor: '#3F84FC',
            cancelButtonColor: '#FC413F',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {   
                window.location = '/articulos/marcas/delete/' + id                             
            }
        })
    }   
    deleteMarca.on('click', function() {
        var id = $(this).attr("id")
        confirmarDelete(id)
    })

    $('.editMarca').click(function(){
        const dataMarca = $(this).data("marca")

        var urlMarcaForm = '/articulos/marcas/edit/' + dataMarca

        actionForm.prop('action', urlMarcaForm)
        
        $.ajax({
            url: '/articulos/marcas/' + dataMarca,
            success: function(res) {
                $('#nombre_marca').val(res[0].NOMBRE_MARCA);
            }
        })

    })
      
})
  