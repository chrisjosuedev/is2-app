// Server, View Engine, Middleware Variables
const express = require('express')
//const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')

// Session Variables
const flash = require('connect-flash')
const sessions = require('express-session')
const MySqlStore = require('express-mysql-session')

const passport = require('passport')

// Create Carpets
require('./config/directories')

// DB Conection Variables
const { database } = require('./keys')
const { isLoggedIn } = require('./lib/auth')

// DB Backup
require('./config/db_backup')

// Init
require('./lib/passport')

// Config Port
const app = express()

app.set('port', 81)

app.set('port', process.env.PORT || 81)


// View Engine Handlebars
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}))

app.set('view engine', '.hbs')

// Middlewares
//app.use(morgan('dev'))

app.use(sessions({
    secret: 'test',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(database)
}))

app.use(flash())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.warning = req.flash('warning')
    app.locals.error = req.flash('error')
    app.locals.user = req.user
    next()
})

// Routes
app.use(require('./routes'))
app.use('/dashboard', require('./routes/dashboard'))
app.use('/articulos', require('./routes/articulos'))
app.use('/proveedores', require('./routes/proveedores'))
app.use('/config', require('./routes/config'))
app.use('/transacciones', require('./routes/transacciones'))
app.use('/persona', require('./routes/persona'))
app.use('/consultas', require('./routes/consultas'))
app.use('/analiticas', require('./routes/analiticas'))
app.use('/sys', require('./routes/sys'))
app.use('/ajustes', require('./routes/ajustes'))

// Public
app.use(express.static(path.join(__dirname, 'public')))

/* 404 Error - Page not found */
app.get('*', isLoggedIn, (req, res) => {
    res.render('error/404')
})


app.listen(app.get('port'), () => {
    console.log('Server on Port', app.get('port'))
})