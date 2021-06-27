const axios = require('axios')
const assert = require('assert')


describe('Authorization Flow', async () =>  {
	describe('POST /login', async () => {

		it('should return a JWT access_token', async () => { // positive flow

			const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0","password": "jeanpassword"})
			assert.equal(loginRes.status, 200)
			assert.equal(loginRes && loginRes.data && loginRes.data.hasOwnProperty('access_token'), true)
		})

		it('should return a HTTP 401 error', async () => { // testing negative flow

			try {
				const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0","password": "unknown"})
			}
			catch(err) {
				assert.equal(err.response.status, 401)
			}
		})

		it('should return a HTTP 400 error', async () => { // testing negative flow

			try {
				const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0"})
			}
			catch(err) {
				assert.equal(err.response.status, 400)
			}
		})

		it('should return a HTTP 403 error', async () => { // testing negative flow

			try {
				const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean__", "password": "unknown"})
			}
			catch(err) {
				assert.equal(err.response.status, 403)
			}
		})

	})
})

