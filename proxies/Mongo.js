const mongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

class Mongo {

	constructor() {

		// TODO: provide this url through dedicated environments-aware config files
		const mongoUrl = "mongodb://yubodev:Yub0D4t4b4s3@34.69.101.222:27017/appdb"
		mongoClient.connect(mongoUrl, (err, client) => {
			if (err) throw err;
			console.log("@@ mongo connected")

			this.client = client
		})
	}

	async findUserByUsername (username) {

		return this.client
			.db('appdb')
			.collection("users")
			.find({ username: username })
	}

	async patchUser (username, patch) {

		return this.client
			.db('appdb')
			.collection("users")
			.updateOne(
				{ username: username},
				{
					$set: patch
				}
			)
	}

	terminate () {
		this.client.close()
	}
}

module.exports = {
	Mongo
}