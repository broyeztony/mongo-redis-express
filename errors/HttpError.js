const createError = require('http-errors');

class HttpError {

	constructor (res, httpCode, error) {
		this.res = res
		this.httpCode = httpCode
		this.error, error
	}

	emit () {
		this.res.send(createError(this.httpCode, this.error))
	}
}