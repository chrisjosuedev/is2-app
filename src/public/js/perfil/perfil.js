$(function () {
  const pass_n1 = $("#primer-pass");
  const pass_n2 = $("#segundo-pass");

  const msg = $("#msg-valid");
  const msg2 = $("#msg2-valid");

  pass_n1.on("keyup", function () {
    if (pass_n1.val().length > 8) {
      pass_n1.removeClass("is-invalid");
      msg2.addClass("valid-feedback");
      msg2.text("Contraseña Segura");
      pass_n1.addClass("is-valid");
      msg2.removeClass("invalid-feedback");
    } else {
      pass_n1.addClass("is-invalid");
      pass_n1.removeClass("is-valid");
      msg2.addClass("invalid-feedback");
      msg2.text("La contraseña debe contener un minimo de 8 caracteres.");
      msg2.removeClass("valid-feedback");
    }
  });

  pass_n2.on("keyup", function () {
    if (pass_n1.val() === pass_n2.val()) {
      pass_n2.removeClass("is-invalid");
      msg.addClass("valid-feedback");
      msg.text("Contraseñas coinciden");
      pass_n2.addClass("is-valid");
      msg.removeClass("invalid-feedback");
    } else {
      pass_n2.addClass("is-invalid");
      pass_n2.removeClass("is-valid");
      msg.addClass("invalid-feedback");
      msg.text("Contraseñas no coinciden");
      msg.removeClass("valid-feedback");
    }
  });
});
