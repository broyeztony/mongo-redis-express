const express = require('express');
const router = express.Router();


router.get('/profile/:username', authorizeMiddlewareFn, cacheMiddlewareFn, async (req, res) => {

	const searchingProfileOf = req.params.username
	if(!searchingProfileOf) {
		res.send(createError(400, 'Bad request: username is missing.'))
	}

	try {

		const promise = await mongo.findUserByUsername(searchingProfileOf)
		promise.toArray((err, result) => {

			if (err) {
				res.send(createError(500, err))
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
				res.send(createError(404, 'The resource was not found.'))
			}
		})
	}
	catch(error) {
		res.send(createError(500, error))
	}
})

router.patch('/:username', authorizeMiddlewareFn, async (req, res) => {

	const params = req.params
	const payload = req.body;

	if(!params.username) {
		res.send(createError(400, `Bad request: property 'username' is missing.`))
	}

	if(!payload.name) {
		res.send(createError(400, 'Bad request: incorrect payload.'))
	}

	if(res.locals.jwtDecoded.username !== params.username) {
		res.send(createError(400, `Bad request: the username ${params.username} can not be updated.`))
	}

	try {

		const patchPromise = mongo.patchUser(params.username, { name: payload.name } )

		patchPromise
			.then((result, err) => {

				if(err) {
					res.send(createError(500, 'There was an internal server error: ${err}'))
				}
				else {
					res.status(200).send(`The user's name was updated to ${ payload.name }.`)
				}
			})
	}
	catch(error) {
		res.send(createError(500, `There was an internal server error: ${error}`))
	}
})

module.exports = router;
