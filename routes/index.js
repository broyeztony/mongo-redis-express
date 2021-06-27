const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const md5 = require('md5')
const httpErrors = require('./../errors/BaseHttpError');


router.post('/login', async (req, res) => {

	const payload = req.body

	if(!payload.username || !payload.password) {
		(new httpErrors.Http400Error(res, 'username or password is missing')).emit()
		return;
	}

	const userPromise = await mongo.findUserByUsername(payload.username)
	userPromise.toArray((err, result) => {

		if(err) {
			(new httpErrors.Http500Error(res, err)).emit()
			return
		}

		if(result && result.length === 1) {

			const user = result[0]
			bcrypt.compare(payload.password, user.password, (err, match) => {

				if(err) {
					(new httpErrors.Http500Error(res, err)).emit()
					return
				}

				if (match) {

					const now = moment().valueOf()
					const jwtPayload = {
						username: user.username,
						createdAt: user.createdAt,
						jti: md5(`${req.ipInfo}:${now}`)
					}

					const token = jwt.sign(jwtPayload, SECRET_B64, { algorithm: "HS256", expiresIn: TOKEN_VALIDITY_PERIOD })
					jwtMap.set(token, { jti: jwtPayload.jti, forIp: req.ipInfo.ip, lastAccess: now, numAccess: 1 })

					console.log("@@ jwtMap", jwtMap)

					const response = JSON.stringify({
						access_token: token,
					})
					res.status(200).send(response)
				}
				else {
					(new httpErrors.Http401Error(res, 'wrong password.')).emit()
					return
				}
			})
		}
		else {
			(new httpErrors.Http403Error(res, 'the user does not exist.')).emit() // not sure if it should be a 403 or a 401. TODO: read about it and update accordingly
			return
		}
	})
})

module.exports = router;
