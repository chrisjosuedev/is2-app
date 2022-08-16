$(function() {
    // Sign In
    $('#loading').addClass('d-none')
    $('#login-button').prop('disabled', false);

    $('#login-form').submit(function(event) {
        $('#loading').removeClass('d-none')
        $('#login-text').text('Iniciando Sesión...');
        $('#login-button').prop('disabled', true);
    })

    // Email
    $('#loading-email').addClass('d-none')
    $('#email-button').prop('disabled', false)

    $('#email-form').submit(function(event) {
        $('#loading-email').removeClass('d-none')
        $('#email-text').text('Enviando Email...');
        $('#email-button').prop('disabled', true);
    })

    // Forgot Password
    $('#loading-password').addClass('d-none')
    $('#password-button').prop('disabled', false)

    $('#password-form').submit(function(event) {
        $('#loading-password').removeClass('d-none')
        $('#password-text').text('Editar...');
        $('#password-button').prop('disabled', true);
    })
})
