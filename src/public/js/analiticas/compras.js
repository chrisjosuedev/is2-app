$(function() {
  comprasDiarias()
  comprasMensuales()
  articulosMasComprados()
  proveedoresMasCompras()

  // --- Proveedores a que mas se le compra
  function proveedoresMasCompras() {
    $.ajax({
      url: "/analiticas/compras/proveedores/mascomprados",
      success: function (res) {
        // Lista de Proveedores a con mayores compras
        var labelsProveedores = res.map(function (e) {
          return e.NOMBRE_PROVEEDOR;
        });

        var dataProveedores = res.map(function (e) {
          return e.TOTAL;
        });

        const ctxMasCopradosProveedor = document
          .getElementById("myChartComprasProveedores")
          .getContext("2d");

        const myChartProveedores = new Chart(ctxMasCopradosProveedor, {
          type: "pie",
          data: {
            labels: labelsProveedores,
            datasets: [
              {
                label: "Lempiras.",
                data: dataProveedores,
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

  // --- Mas Comprados
  function articulosMasComprados() {
    $.ajax({
      url: "/analiticas/compras/articulos/mascomprados",
      success: function (res) {
        // Lista de productos mas comprados
        var labelsArticulos = res.map(function (e) {
          return e.DESCRIPCION;
        });

        var dataArticulos = res.map(function (e) {
          return e.Cantidad;
        });

        const ctxMasComprados = document
          .getElementById("myChartMasComprados")
          .getContext("2d");

        const myChartComprados = new Chart(ctxMasComprados, {
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

  // --- Compras Diarias
  function comprasDiarias() {
    $.ajax({
      url: "/analiticas/compras/diarias",
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
          .getElementById("myChartComprasDiarias")
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

  // --- Compras Mensuales
  function comprasMensuales() {
    $.ajax({
      url: "/analiticas/compras/mensuales",
      success: function (res) {
        // Nivel Venta por Mes
        var labelsMensual = res.map(function (e) {
          return e.Mes;
        });

        var dataMensual = res.map(function (e) {
          return e.Total;
        });

        const ctxVentasMensual = document.getElementById('myChartComprasMensuales').getContext('2d');


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


})