const saldoRegistrado = $(".saldo_nivel")

saldoRegistrado.each(function(index) {
    const saldo = parseFloat($(this).text().trim())
    const sign = Math.sign(saldo)

    if (sign === -1) {
        $(this).addClass("text-danger")
        $(this).removeClass("text-success")
    } else {
        $(this).addClass("text-success")
        $(this).removeClass("text-danger")
    }

})

