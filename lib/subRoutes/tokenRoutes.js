const filedb = require('../data');
const helpers = require('../helpers');

exports._tokens = {
	//creating tokens
	post: (data, callback) => {
		const { payload } = data;
		const phone =
			typeof payload.phone == 'number' && payload.phone.toString().length == 10
				? payload.phone
				: false;
		const password =
			typeof payload.password == 'string' && payload.password.trim().length > 0
				? payload.password
				: false;

		if (phone && password) {
			filedb.read('users', phone, (err, userData) => {
				if (err) {
					callback(404, { Error: 'User not found' });
				} else {
					//hash the send password and compare it with the password
					const hashedPassword = helpers.hash(password);
					if (hashedPassword == userData.password) {
						const tokenObj = {
							id: helpers.createRandomString(10),
							phone,
							expires: Date.now() + 1000 * 60 * 60
						};
						filedb.create('tokens', tokenObj.id, tokenObj, err => {
							if (!err) {
								callback(200);
							} else {
								callback(500, { Error: 'Could not create token' });
							}
						});
					} else {
						callback(400, { Error: 'Password did not match' });
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	//Required data:ID
	get: (data, callback) => {
		if (data.params.id) {
			filedb.read('tokens', data.params.id, (err, data) => {
				if (err) {
					callback(404, { Error: 'Token not found' });
				} else {
					callback(200, data);
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	//Required-id,extend
	put: (data, callback) => {
		const { id, extend } = data.payload;

		if (id && extend) {
			filedb.read('tokens', id, (err, tokenData) => {
				if (err) {
					callback(404, { Error: 'Token not found' });
				} else {
					if (Date.now() > tokenData.expires) {
						callback(405, { Error: 'Token expired!' });
					} else {
						tokenData.expires = Date.now() + 1000 * 60 * 60; //if extend is true then extend the expires by 1hr
						filedb.update('tokens', id, tokenData, err => {
							if (err) {
								callback(400, { Error: 'Could not extend token!' });
							} else {
								callback(200);
							}
						});
					}
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},

	//Required data-ID
	delete: (data, callback) => {
		const { id } = data.payload;
		if (id) {
			filedb.read('tokens', id, (err, tokenData) => {
				if (err) {
					callback(404, { Error: 'Token not found' });
				} else {
					filedb.delete('tokens', id, err => {
						callback(200);
					});
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	verifyToken: (id, phone, callback) => {
		filedb.read('tokens', id, (err, tokenData) => {
			if (err) {
				callback(false);
			} else {
				if (tokenData.phone == phone && tokenData.expires > Date.now()) {
					callback(true);
				} else {
					callback(false);
				}
			}
		});
	}
};
