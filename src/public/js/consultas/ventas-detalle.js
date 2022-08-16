$(function () {
  var st = 0;
  var des = 0;
  var isv = 0;
  var total = 0;

  $("#detalle-venta tbody tr").each(function () {
    console.log($(this).find("td").eq(4).html())
    var descColumn = $(this).find("td").eq(5).html().trim();
    var stColumn = $(this).find("td").eq(4).html();
    var newStColumn = stColumn.substring(4, stColumn.length - 1);
    var newDescColumn = parseFloat(descColumn);
    st += parseFloat(newStColumn);
    des += parseFloat(newDescColumn);
  });

  isv = st * 0.15;
  total = st - des + isv;

  $("#st-venta").val("L. " + st.toFixed(2));
  $("#desc-st").val("L. " + des.toFixed(2));
  $("#isv").val("L. " + isv.toFixed(2));
  $("#total").val("L. " + total.toFixed(2));
});
