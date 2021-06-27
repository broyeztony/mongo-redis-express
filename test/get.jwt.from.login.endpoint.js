const axios = require('axios')
const assert = require('assert')


describe('Authorization Flow', async () =>  {
	describe('POST /login', async () => {
		it('should return a JWT access_token', async () => {

			const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0","password": "jeanpassword"})

			console.log('@@ data', loginRes.data)

			assert.equal(loginRes.status, 200)
			assert.equal(loginRes && loginRes.data && loginRes.data.hasOwnProperty('access_token'), true)

		});
	});
});

