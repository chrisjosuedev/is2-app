$(function() {
  ultimasVentas()
  cantidadStock()

  // Ultimas 5 ventas diarias
  function ultimasVentas() {
    $.ajax({
      url: "/dashboard/ventas/diarias",
      success: function (res) {
        var labelsDiario = res.map(function (e) {
          var fecha = new Date(e.FECHA);
          var dd = String(fecha.getDate()).padStart(2, "0");
          var mm = String(fecha.getMonth() + 1).padStart(2, "0");
          var yyyy = fecha.getFullYear();

          fecha = dd + "/" + mm + "/" + yyyy;
          return fecha;
        });

        var dataVentasDiarias = res.map(function (e) {
          return e.Total;
        });

        const ctxVentasDiarias = document
          .getElementById("myChartVentasDiarias")
          .getContext("2d");

        const myChartDiario = new Chart(ctxVentasDiarias, {
          type: "line",
          data: {
            labels: labelsDiario,
            datasets: [
              {
                label: "Lempiras.",
                data: dataVentasDiarias,
                backgroundColor: [
                  "rgba(255, 99, 132)",
                  "rgba(54, 162, 235)",
                  "rgba(255, 206, 86)",
                  "rgba(75, 192, 192)",
                  "rgba(153, 102, 255)",
                  "rgba(255, 159, 64)",
                ],
                borderWidth: 2,
              },
            ],
          },
          options: {
            indexAxis: "x",
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
    });
  }

  // Stock
  function cantidadStock() {
    $.ajax({
      url: "/dashboard/stock",
      success: function (res) {
        var labelsDescripcion = res.map(function (e) {
          return e.DESCRIPCION;
        });

        var dataStock = res.map(function (e) {
          return e.STOCK;
        });

        const ctxStock = document
          .getElementById("myChartStock")
          .getContext("2d");

        const myChartStock = new Chart(ctxStock, {
          type: "doughnut",
          data: {
            labels: labelsDescripcion,
            datasets: [
              {
                label: "Stock: ",
                data: dataStock,
                backgroundColor: [
                  "rgba(255, 99, 132)",
                  "rgba(54, 162, 235)",
                  "rgba(255, 206, 86)",
                  "rgba(75, 192, 192)",
                  "rgba(153, 102, 255)",
                  "rgba(255, 159, 64)",
                ],
                borderWidth: 2,
              },
            ],
          }
        });
      },
    });
  }


})