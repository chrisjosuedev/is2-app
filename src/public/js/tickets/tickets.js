const href = $(".img-file").attr("href")
const estatusRes = $(".finalizar").attr("id")

const alertContainer = $("#alert")
const alertMsg = $("#alert-msg")


if (estatusRes === '0') {
    alertContainer.removeClass("alert-primary")
    alertContainer.addClass("alert-danger")
    $(".finalizar").prop("disabled", false)
    $("#comentario").prop("disabled", false)
    $(".close-ticket").prop("disabled", false)
    alertMsg.text("Este ticket no ha sido revisado.")
    // No revisado
} else {
    // Revisado
    alertContainer.addClass("alert-primary")
    alertContainer.removeClass("alert-danger")
    $(".finalizar").prop("disabled", true)
    $("#comentario").prop("disabled", true)
     $(".close-ticket").prop("disabled", true)
    alertMsg.text("Este ticket ya ha sido revisado y finalizado.")
}




if (!href) {
    $(".img-file").addClass('d-none')
} else {
    $(".img-file").removeClass('d-none')
}