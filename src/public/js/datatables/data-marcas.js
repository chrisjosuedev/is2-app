$(function () {
  $("#dataMarcas").DataTable({
    language: {
        "paginate": {
            "first": "Primero",
            "last": "Último",
            "next": "Siguiente",
            "previous": "Anterior"
        },
        "search": "Buscar:",
        "lengthMenu": "Mostrar _MENU_ registros",
        "emptyTable": "No existen marcas registrados",
        "zeroRecords": "No se encontraron coincidencias",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        "infoEmpty": "Mostrando 0 a 0 de 0 entradas",
        "infoFiltered": "(Filtrado de _MAX_ total de entradas)",
        "lengthMenu": "Mostrar _MENU_ entradas"
    }
});
});
