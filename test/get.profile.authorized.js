const axios = require('axios')
const assert = require('assert')


describe('Read profile, positive flow', async () =>  {
	describe('GET /profile', async () => {
		it('should return the profile of the specified username, given a valid JWT is provided', async () => {

			// Get a JWT token
			const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0","password": "jeanpassword"})
			const token = loginRes && loginRes.data && loginRes.data.access_token

			// Read profile
			try {

				authorizedConfig = {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					}
				}

				const axiosWithToken = axios.create(authorizedConfig)
				const profileRes = await axiosWithToken.get('http://localhost:3000/users/profile/jean0')
				const profile = profileRes.data

				console.log('@@ profileRes.data', profile)
				assert.equal(profileRes.status, 200)
				assert.equal(profile && profile.username, 'jean0')

			}
			catch(error) {
				console.log('@@ profileRes error', error)
			}

		});
	});
});

