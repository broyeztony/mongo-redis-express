const axios = require('axios')
const assert = require('assert')


describe('PATCH /user', async () => {

	it('should update the name of the specified user', async () => {

		// Get a JWT token
		const loginRes = await axios.post('http://localhost:3000/login', {"username": "jean0", "password": "jeanpassword"})
		const token = loginRes && loginRes.data && loginRes.data.access_token

		// Patch profile
		try {

			authorizedConfig = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				}
			}

			const newName = 'Nikos'
			const axiosWithToken = axios.create(authorizedConfig)
			const patchRes = await axiosWithToken.patch('http://localhost:3000/users/jean0', { name: newName })

			console.log('@@ patchRes.data', patchRes.data)
			assert.equal(patchRes.status, 200)
			assert.equal(patchRes.data, `The user's name was updated to ${newName}.`)

			// verify the profile 's been updated to the new name
			const profileRes = await axiosWithToken.get('http://localhost:3000/users/profile/jean0')
			const profile = profileRes.data

			console.log('@@ profileRes.data', profileRes.data)
			assert.equal(profileRes.status, 200)
			assert.equal(profileRes.data.name, newName)

		}
		catch (error) {
			console.log('@@ patch error', error)
		}

	})

})

