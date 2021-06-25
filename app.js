var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const expressip = require('express-ip')
const {Mongo} = require('./proxies/Mongo');
const {Redis} = require('./proxies/Redis');

// init DB connections and other globals
mongo 	= new Mongo()
redis 	= new Redis()

jwtMap = new Map()

TOKEN_VALIDITY_PERIOD = 3600 // in seconds
NB_ACCESS_THRESHOLD = 720 // max number of times the token can be used within the token validity period (TOKEN_VALIDITY_PERIOD)
ACCESS_FREQ_THRESHOLD = 1000 // min number of seconds between 2 usages of the token, in seconds
secret = "YUBO ROCKS !"
secretBase64Buffer = Buffer.from(secret, 'base64')

authorizeMiddlewareFn = (req, res, next) => {
	console.log('[middleware authorizeMiddlewareFn enter]');

	if(!req.headers.authorization) {
		next(createError(401, "Authorization error"))
	}

	const bearerToken =  req.headers.authorization.slice(7, req.headers.authorization.length)
	try {

		const jwtDecoded = jwt.verify(bearerToken, secretBase64Buffer);
		res.locals.jwtDecoded = jwtDecoded // <-- do it once in above line and pass it along the middleware pipeline
		console.log('@@ jwtDecoded', jwtDecoded, jwtDecoded.jti)

		// validate against replay attack
		const jwtHistoricToken = jwtMap.get(bearerToken)

		console.log('@@ jwtHistoricToken', jwtHistoricToken)

		if(!jwtHistoricToken) {
			next(createError(401, "Invalid token"))
		}

		if(jwtHistoricToken.forIp !== req.ipInfo.ip) {
			next(createError(401, "Authorization error"))
		}

		if(jwtHistoricToken.numAccess > NB_ACCESS_THRESHOLD) {
			jwtMap.delete(bearerToken)
			next(createError(401, "Authorization error"))
		}
		jwtHistoricToken.numAccess += 1
		jwtMap.set(bearerToken, jwtHistoricToken)

		const timeSinceLastAccess = moment().valueOf() - jwtHistoricToken.lastAccess
		if(timeSinceLastAccess < ACCESS_FREQ_THRESHOLD) {
			jwtMap.delete(bearerToken)
			next(createError(401, `The token's last access timestamp ${jwtHistoricToken.lastAccess} is too recent. timeSinceLastAccess is ${timeSinceLastAccess}`))
		}

		jwtHistoricToken.lastAccess = moment().valueOf()
		jwtMap.set(bearerToken, jwtHistoricToken)
	}
	catch(error) {
		jwtMap.delete(bearerToken) // <-- this will clean up the map from expired token since a failing jwt.verify() will lead here
		next(createError(401, "Authorization error"))
	}

	console.log('[middleware authorizeMiddlewareFn exit]');
	next();
}

cacheMiddlewareFn = (req, res, next) => {

	console.log('[middleware cacheMiddlewareFn enter]')
	const key = [req.route.path, req.params.username].join('~')
	console.log('@@ key', key)

	const errCallb = (err) => {
		res.send(createError(400, err));
	}

	const replyCallb = (value) => {
		if (!!value) {
			console.log('@@ cacheMiddlewareFn retrieved data from cache', value)
			res.status(200).send(value);
		}
		else {
			console.log('[middleware cacheMiddlewareFn exit]')
			next();
		}
	}

	redis.getV(key, errCallb, replyCallb)
}


// -------------------------------------------------------
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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
app.use('/user', usersRouter);

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
