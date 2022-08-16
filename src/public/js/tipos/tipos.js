$(function () {
  const actionForm = $('#edit-tipos')


  const deleteTipos = $('.delete-tipos')
  
  function confirmarDelete(id) {
      Swal.fire({
          title: '¿Confirma eliminar el Tipo de Articulo?',
          icon: 'warning',
          confirmButtonColor: '#3F84FC',
          cancelButtonColor: '#FC413F',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {   
              window.location = '/articulos/tipos/delete/' + id                             
          }
      })
  }   
  deleteTipos.on('click', function() {
      var id = $(this).attr("id")
      confirmarDelete(id)
  })

  $('.editTipos').click(function(){
      const dataTipos = $(this).data("tipos")

      var urlTiposForm = '/articulos/tipos/edit/' + dataTipos

      actionForm.prop('action', urlTiposForm)
      
      $.ajax({
          url: '/articulos/tipos/' + dataTipos,
          success: function(res) {
              $('#nombre_tipoarticulo').val(res[0].NOMBRE_TIPOARTICULO);
          }
      })

  })
    
})
