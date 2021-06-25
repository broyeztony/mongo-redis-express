const redis = require('redis')

class Redis {

	constructor() {

		const settings = { /** to be moved into application environmnent files */
			host: "104.155.159.100",
			port: 6379,
			password: "Yub0P4ssw0rd"
		}

		this.client = redis.createClient(settings)

		this.client.on("error", this.onError)
		this.client.on("end", this.onEnd);
		this.client.on("connect", this.onConnect)
	}

	setKV (key, value) {
		this.client.set(key, value, redis.print)
	}

	getV (key, errCallb, replyCallb) {
		return this.client.get(key, (err, value) => {
			if(err)
				errCallb(err)
			replyCallb(value)
		})
	}

	onConnect (event) {
		console.log('@@ Redis onConnect', event)
	}

	onEnd (event) {
		console.log('@@ Redis onEnd', event)
	}

	onError (error) {
		console.log('@@ Redis onError', error)
	}

	terminate () {
		this.client.end(true);
	}

}

module.exports = {
	Redis
}