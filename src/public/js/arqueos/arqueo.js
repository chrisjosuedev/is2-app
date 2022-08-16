const arqueoForm = $("#arqueo_form");

$(".amount").keydown(function (event) {
    if (event.key === ".") {
        event.preventDefault();
    }
});

$("#calcular").click(function () {
    const total_efectivo = $("#total_efectivo");
    const l500 = parseInt($("#l500").val()) * 500;
    const l200 = parseInt($("#l200").val()) * 200;
    const l100 = parseInt($("#l100").val()) * 100;
    const l50 = parseInt($("#l50").val()) * 50;
    const l20 = parseInt($("#l20").val()) * 20;
    const l10 = parseInt($("#l10").val()) * 10;
    const l5 = parseInt($("#l5").val()) * 5;
    const l2 = parseInt($("#l2").val()) * 2;
    const l1 = parseInt($("#l1").val()) * 1;

    const c50 = parseInt($("#c_50").val()) * 0.5;
    const c20 = parseInt($("#c_20").val()) * 0.2;
    const c10 = parseInt($("#c_10").val()) * 0.1;
    const c_05 = parseInt($("#c_05").val()) * 0.05;
    const c_02 = parseInt($("#c_02").val()) * 0.02;
    const c_01 = parseInt($("#c_01").val()) * 0.01;

    const efectivo = [
        {
            number: "500",
            amount: l500,
        },
        {
            number: "200",
            amount: l200,
        },
        {
            number: "100",
            amount: l100,
        },
        {
            number: "50",
            amount: l50,
        },
        {
            number: "20",
            amount: l20,
        },
        {
            number: "10",
            amount: l10,
        },
        {
            number: "5",
            amount: l5,
        },
        {
            number: "2",
            amount: l2,
        },
        {
            number: "1",
            amount: l1,
        },
        {
            number: "0.50",
            amount: c50,
        },
        {
            number: "0.20",
            amount: c20,
        },
        {
            number: "0.10",
            amount: c10,
        },
        {
            number: "0.05",
            amount: c_05,
        },
        {
            number: "0.02",
            amount: c_02,
        },
        {
            number: "0.01",
            amount: c_01,
        },
    ];

    const total = efectivo.reduce((sum, value) => sum + value.amount, 0);

    total_efectivo.val(total.toFixed(2));
});

$("#reset").click(function () {
    $("#total_efectivo").val("");
    $("#l500").val("0");
    $("#l200").val("0");
    $("#l100").val("0");
    $("#l50").val("0");
    $("#l20").val("0");
    $("#l10").val("0");
    $("#l5").val("0");
    $("#l2").val("0");
    $("#l1").val("0");
    $("#c_50").val("0");
    $("#c_20").val("0");
    $("#c_10").val("0");
    $("#c_05").val("0");
    $("#c_02").val("0");
    $("#c_01").val("0");
});

arqueoForm.submit(function (event) {
    if ($("#total_efectivo").val() != "") {
        $(".loader-wrapper").fadeIn("slow");
        return;
    }

    $("#alert").text("Ingrese los datos de la cantidad de dinero en caja.");
    $("#alert").removeClass("d-none");

    setTimeout(function () {
        $("#alert").addClass("d-none");
    }, 5000);
    event.preventDefault();
});
