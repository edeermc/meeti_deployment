const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const router = require('./routes/index');
const db = require('./config/db');

require('./models/Usuarios');
require('./models/Categorias');
require('./models/Comentarios');
require('./models/Grupos');
require('./models/Meeti');
db.sync().then(() => console.log('BD conectada correctamente')).catch((error) => console.log(error));
require('dotenv').config({ path: 'variables.env' });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const curdate = new Date();
    res.locals.anio = curdate.getFullYear();
    next();
});
app.use('/', router());
app.listen(process.env.PORT || 5000, process.env.HOST || '0.0.0.0', () => {
    console.log('El servidor esta arriba tio!');
});