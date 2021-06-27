

class Http401Error extends HttpError {

	constructor (res, httpCode, error) {
		super(res, 401, error)
	}

}