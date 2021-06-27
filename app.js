const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const expressip = require('express-ip')
const {Mongo} = require('./proxies/Mongo');
const {Redis} = require('./proxies/Redis');

// few globals and constants below
// TODO: move this into common files that can be required
mongo 	= new Mongo()
redis 	= new Redis()
jwtMap = new Map() // <- this could be exposed via into a dedicated JwtHistory class that keeps track of the JWT generated

TOKEN_VALIDITY_PERIOD = 3600 // in seconds
NB_ACCESS_THRESHOLD = 720 // max number of times the token can be used within the token validity period (TOKEN_VALIDITY_PERIOD)
SECRET_B64 = Buffer.from("YUBO ROCKS !", 'base64')

// ------------------------------------------------------- Express boilerplate generated code
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressip().getIpInfoMiddleware)

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
