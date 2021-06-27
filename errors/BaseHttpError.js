// const createError = require('http-errors');

class BaseHttpError {

	constructor (res, httpCode, error) {
		this.res = res
		this.httpCode = httpCode
		this.error = error
	}

	emit () {
		console.log('@@ BaseHttpError', this.httpCode, this.error)
		this.res.status(this.httpCode).send(this.error)
	}
}

class Http400Error extends BaseHttpError {

	constructor (res, error) {
		super(res, 400, error)
	}
}

class Http401Error extends BaseHttpError {

	constructor (res, error) {
		super(res, 401, error)
	}
}

class Http403Error extends BaseHttpError {

	constructor (res, error) {
		super(res, 403, error)
	}
}

class Http404Error extends BaseHttpError {

	constructor (res, error) {
		super(res, 404, error)
	}
}

class Http500Error extends BaseHttpError {

	constructor (res, error) {
		super(res, 500, error)
	}
}

module.exports = {
	BaseHttpError,
	Http400Error,
	Http401Error,
	Http403Error,
	Http404Error,
	Http500Error,
}