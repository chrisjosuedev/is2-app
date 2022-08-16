/* Script de Select de Ciudad Dinamico */
$(function() {
    
    const depto = $('.depto')
    const ciudad = $('.ciudad')

    function emptyCiudad() {
        ciudad.empty()
        ciudad.append(`<option value='0' selected>  - Ciudad - </option>`)
    }

    function getByCiudad(id) {
        $.ajax({
            url: '/persona/ciudad/' + id,
            success: function(res) {
                ciudad.empty()
                res.forEach(res => {
                    ciudad.append(`
                      <option value='${res.ID_CIUDAD}'> ${res.NOMBRE_CIUDAD} </option>
                    `)
                })
            }
        })
    }

    depto.on('change', function () {
        var id = this.value
        if (this.value === '0') {
            emptyCiudad()
        }
        else {
            getByCiudad(id)
        }     
        
    })

})

