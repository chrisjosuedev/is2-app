const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const myConn = require('../db')
const helpers = require('../lib/helpers')
const { saveLog } = require('../lib/logs')

// Inicio de Sesion
passport.use('local.signin', new localStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const queryUser = `
  select * from usuario where USERNAME = ?;
  `
  const rows = await myConn.query(queryUser, [username]);
  
  // Validacion de Contraseña
  if (rows.length > 0) {
      const user = rows[0];
      if (user.ESTATUS) {
        const validPassword = await helpers.matchPassword(password, user.PASSWORD);
        if (validPassword) {
            saveLog(user.USERNAME, `Login en el Sistema`, 'LOGIN')
            done(null, user, req.flash('success', 'Bienvenid@ ' + user.USERNAME));
        }
        else {
            done(null, false, req.flash('error', 'Contraseña Incorrecta'));
        }
      } else {
        done(null, false, req.flash("error", "El usuario se encuentra deshabilitado."))
      }

  }
  else {
      return done(null, false, req.flash('error', 'Usuario no existe'));
  }
}))

passport.serializeUser((user, done) => {
  done(null, user.ID_EMPLEADO);
});

passport.deserializeUser(async (id, done) => {
  const serQuery = `
  SELECT persona.NOMBRE_PERSONA as NOMBRE, persona.APELLIDO_PERSONA as APELLIDO, 
  persona.SEXO, usuario.*, rol_users.DESC_ROL as ROL,
  categoria_laboral.*, empleado.FECHA_CONTRATACION, expiracion_password.UPDATED 
  FROM persona
  left join empleado on persona.ID_PERSONA = empleado.ID_PERSONA
  inner join usuario on usuario.ID_EMPLEADO = empleado.ID_EMPLEADO
  inner join categoria_laboral on empleado.ID_CATEGORIA = categoria_laboral.ID_CATEGORIA
  inner join rol_users on usuario.ID_ROL = rol_users.ID_ROL
  inner join expiracion_password on expiracion_password.USERNAME = usuario.USERNAME
  WHERE (persona.ID_PERSONA IN (SELECT empleado.ID_PERSONA FROM empleado)) AND usuario.ID_EMPLEADO =  ? 
  `
  const rows = await myConn.query(serQuery, [id]);
  done(null, rows[0]);
});
