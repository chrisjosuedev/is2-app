$(function () {
  var st = 0;
  var isv = 0;
  var total = 0;

  $("#detalle-compra tbody tr").each(function () {
    console.log($(this).find("td").eq(4).html())
    var stColumn = $(this).find("td").eq(4).html();
    var newStColumn = stColumn.substring(4, stColumn.length - 1);
    st += parseFloat(newStColumn);
  });

  isv = st * 0.15;
  total = st + isv;

  $("#st-venta").val("L. " + st.toFixed(2));
  $("#isv").val("L. " + isv.toFixed(2));
  $("#total").val("L. " + total.toFixed(2));
});
