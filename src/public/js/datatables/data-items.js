$(function () {
  $('#dataItems').DataTable({
    language: {
        "paginate": {
            "first": "Primero",
            "last": "Último",
            "next": "Siguiente",
            "previous": "Anterior"
        },
        "search": "Buscar:",
        "lengthMenu": "Mostrar _MENU_ registros",
        "emptyTable": "No existen articulos registrados",
        "zeroRecords": "No se encontraron coincidencias",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        "infoEmpty": "Mostrando 0 a 0 de 0 entradas",
        "infoFiltered": "(Filtrado de _MAX_ total de entradas)",
        "lengthMenu": "Mostrar _MENU_ entradas"
    },
    responsive: "true",
        dom: "Bfrtilp",
        buttons:[
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i>',
                titleAttr: 'Exportar a Excel',
                title: 'IS2 Solutions',
                messageTop: 'ARTICULOS EN STOCK',
                filename: 'Artículos en Inventario',
                className: 'btn btn-success'
            }
        ]
    });
})


