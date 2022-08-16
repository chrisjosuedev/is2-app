$(function () {
  ventasDiarias();
  ventasMensuales();
  articulosMasVendidos();
  clientesMasVendidos();

  // ---- Clientes con mayores compras
  function clientesMasVendidos() {
    $.ajax({
      url: "/analiticas/ventas/clientes/masvendidos",
      success: function (res) {
        // Lista de Clientes con mayores compras
        var labelsClientes = res.map(function (e) {
          return e.Cliente;
        });

        var dataClientes = res.map(function (e) {
          return e.TOTAL;
        });

        const ctxMasVendidos = document
          .getElementById("myChartVentasClientes")
          .getContext("2d");

        const myChartClients = new Chart(ctxMasVendidos, {
          type: "pie",
          data: {
            labels: labelsClientes,
            datasets: [
              {
                label: "Lempiras.",
                data: dataClientes,
                backgroundColor: [
                  "rgba(255, 99, 132)",
                  "rgba(54, 162, 235)",
                  "rgba(255, 206, 86)",
                  "rgba(75, 192, 192)",
                  "rgba(153, 102, 255)",
                  "rgba(255, 159, 64)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    userCallback: function (label, index, labels) {
                      if (Math.floor(label) === label) {
                        return label;
                      }
                    },
                  },
                },
              ],
            },
          },
        });
      },
    });
  }

  //---- Articulos mas vendidos
  function articulosMasVendidos() {
    $.ajax({
      url: "/analiticas/ventas/articulos/masvendidos",
      success: function (res) {
        // Lista de productos mas vendidos
        var labelsArticulos = res.map(function (e) {
          return e.DESCRIPCION;
        });

        var dataArticulos = res.map(function (e) {
          return e.Cantidad;
        });

        const ctxMasVendidos = document
          .getElementById("myChartArticulos")
          .getContext("2d");

        const myChartVendidos = new Chart(ctxMasVendidos, {
          type: "bar",
          data: {
            labels: labelsArticulos,
            datasets: [
              {
                label: "Cantidad de Compras",
                data: dataArticulos,
                backgroundColor: [
                  "rgba(255, 99, 132)",
                  "rgba(54, 162, 235)",
                  "rgba(255, 206, 86)",
                  "rgba(75, 192, 192)",
                  "rgba(153, 102, 255)",
                  "rgba(255, 159, 64)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    userCallback: function (label, index, labels) {
                      if (Math.floor(label) === label) {
                        return label;
                      }
                    },
                  },
                },
              ],
            },
          },
        });
      },
    });
  }

  //---- Ventas Diarias
  function ventasDiarias() {
    $.ajax({
      url: "/analiticas/ventas/diarias",
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

  //---- Ventas Mensuales
  function ventasMensuales() {
    $.ajax({
      url: "/analiticas/ventas/mensuales",
      success: function (res) {
        // Nivel Venta por Mes
        var labelsMensual = res.map(function (e) {
          return e.Mes;
        });

        var dataMensual = res.map(function (e) {
          return e.Total;
        });

        const ctxVentasMensual = document.getElementById('myChartVentasMensuales').getContext('2d');


        const myChartMensual = new Chart(ctxVentasMensual, {
          type: "line",
          data: {
            labels: labelsMensual,
            datasets: [
              {
                label: "Lempiras.",
                data: dataMensual,
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
  
});
