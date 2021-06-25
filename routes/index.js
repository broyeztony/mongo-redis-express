const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const md5 = require('md5')
const createError = require('http-errors');


router.post('/login', async (req, res) => {

	const payload = req.body

	if(!payload.username || !payload.password) {
		res.status(400).send('Bad request: username or password is missing.')
	}

	const userPromise = await mongo.findUserByUsername(payload.username)
	userPromise.toArray((err, result) => {

		if(err) {
			res.status(500).send('There was an internal server error.')
		}

		if(result && result.length === 1) {

			const user = result[0]
			bcrypt.compare(payload.password, user.password, (err, match) => {

				if(err) {
					res.status(500).send('There was an internal server error.')
				}

				if (match) {

					const now = moment().valueOf()
					const jwtPayload = {
						username: user.username,
						createdAt: user.createdAt,
						jti: md5(`${req.ipInfo}:${now}`)
					}

					const token = jwt.sign(jwtPayload, secretBase64Buffer, { algorithm: "HS256", expiresIn: TOKEN_VALIDITY_PERIOD })
					jwtMap.set(token, { jti: jwtPayload.jti, forIp: req.ipInfo.ip, lastAccess: now, numAccess: 1 })

					console.log("@@ jwtMap", jwtMap)

					const response = JSON.stringify({
						access_token: token,
					})
					res.status(200).send(response)
				}
				else {
					res.send(createError(401, 'Authentication failed: wrong password.'))
				}
			})
		}
		else {
			res.send(createError(403, 'The resource was not found.'))
		}
	})
})

module.exports = router;
