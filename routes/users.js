const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const moment = require('moment')
const expressip = require('express-ip')
const httpErrors = require('./../errors/BaseHttpError');

/**
 * Middleware functions
 */
authorizeMiddlewareFn = (req, res, next) => {
	console.log('[middleware authorizeMiddlewareFn enter]');

	if(!req.headers.authorization) {
		next(new httpErrors.Http401Error(res, 'missing Authorization header.'))
	}

	const bearerToken =  req.headers.authorization.slice(7, req.headers.authorization.length)
	try {

		const jwtDecoded = jwt.verify(bearerToken, SECRET_B64);
		res.locals.jwtDecoded = jwtDecoded // <-- do it once in above line and pass it along the middleware pipeline
		// console.log('@@ jwtDecoded', jwtDecoded, jwtDecoded.jti)

		const jwtHistoricToken = jwtMap.get(bearerToken)

		if(!jwtHistoricToken) { // token was not created from this server or no longer in list of valid tokens
			next(new httpErrors.Http401Error(res, 'Invalid token.'))
		}

		/**
		 * Below seems a minimal safeguard against replay attack ?
		 * e.g. a valid JWT can not be sent from a different IP than the one that originally requested /login
		 */
		if(jwtHistoricToken.forIp !== req.ipInfo.ip) {
			next(new httpErrors.Http401Error(res, 'Authorization error.'))
		}

		jwtHistoricToken.numAccess += 1
		jwtMap.set(bearerToken, jwtHistoricToken)

		const timeSinceLastAccess = moment().valueOf() - jwtHistoricToken.lastAccess
		jwtHistoricToken.lastAccess = moment().valueOf()
		jwtMap.set(bearerToken, jwtHistoricToken)
	}
	catch(error) {
		jwtMap.delete(bearerToken) // <-- this will clean up the map from expired tokens since a failing jwt.verify() will lead here
		// TODO: we also need a scheduled logic to automatically refresh the jwtMap periodically and clear the expired tokens.
		next(new httpErrors.Http401Error(res, 'Authorization error.'))
	}

	console.log('[middleware authorizeMiddlewareFn exit]');
	next();
}

cacheMiddlewareFn = (req, res, next) => {

	console.log('[middleware cacheMiddlewareFn enter]')

	// TODO: make better keys
	const key = [req.route.path, req.params.username].join('~')
	console.log('@@ key', key)

	const errCallb = (err) => {
		(new httpErrors.Http400Error(res, err)).emit()
		return
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

/**
 * Users route
 * GET Profile
 */
router.get('/profile/:username', authorizeMiddlewareFn, cacheMiddlewareFn,  async (req, res) => {

	const searchingProfileOf = req.params.username
	if(!searchingProfileOf) {

		(new httpErrors.Http400Error(res, 'username is missing.')).emit()
		return
	}

	try {

		const promise = await mongo.findUserByUsername(searchingProfileOf)
		promise.toArray((err, result) => {

			if (err) {
				(new httpErrors.Http500Error(res, err)).emit()
				return
			}

			const profile = result && result.length === 1 && result[0]
			if (profile) {

				const response = JSON.stringify({
					name: profile.name,
					username: profile.username,
					createdAt: profile.createdAt
				})

				const key = [req.route.path, searchingProfileOf].join('~')
				redis.setKV(key, response)
				res.status(200).send(response)
			}
			else {
				(new httpErrors.Http404Error(res, 'The resource was not found.')).emit()
				return
			}
		})
	}
	catch(err) {
		(new httpErrors.Http500Error(res, err)).emit()
		return
	}
})

/**
 * Users route
 * PATCH user
 */
router.patch('/:username', authorizeMiddlewareFn, async (req, res) => {

	const params = req.params
	const payload = req.body;

	if(!params.username) {
		(new httpErrors.Http400Error(res, `property 'username' is missing.`)).emit()
		return
	}

	if(!payload.name) {
		(new httpErrors.Http400Error(res, `Incorrect payload.`)).emit()
		return
	}

	if(res.locals.jwtDecoded.username !== params.username) {
		(new httpErrors.Http400Error(res, `the username ${params.username} can not be updated.`)).emit()
		return
	}

	try {

		const patchPromise = mongo.patchUser(params.username, { name: payload.name } )
		patchPromise
			.then((result, err) => {

				if(err) {
					(new httpErrors.Http500Error(res, err)).emit()
					return
				}
				else {

					// we need to delete the cached profile for this user as it's been updated
					// the way it is done here is not ideal and adds coupling between this route and the cache middleware
					// TODO: refactor and decouple
					const deleteKey = ['/profile/:username', params.username].join('~')
					redis.delK(deleteKey)

					// send confirmation
					res.status(200).send(`The user's name was updated to ${ payload.name }.`)
				}
			})
	}
	catch(err) {
		(new httpErrors.Http500Error(res, err)).emit()
		return
	}
})

module.exports = router;