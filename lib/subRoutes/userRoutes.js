const filedb = require('../data');
const helpers = require('../helpers');
const tokenRoutes = require('./tokenRoutes');
exports._users = {
	post: (data, callback) => {
		const { payload } = data;
		const firstName =
			typeof payload.firstName == 'string' &&
			payload.firstName.trim().length > 0
				? payload.firstName
				: false;
		const lastName =
			typeof payload.lastName == 'string' && payload.lastName.trim().length > 0
				? payload.lastName
				: false;
		const phone =
			typeof payload.phone == 'number' && payload.phone.toString().length == 10
				? payload.phone
				: false;
		const password =
			typeof payload.password == 'string' && payload.password.trim().length > 0
				? payload.password
				: false;
		const tosAgreement =
			typeof payload.tosAgreement == 'boolean' && payload.tosAgreement == true
				? true
				: false;
		if (firstName && lastName && phone && password && tosAgreement) {
			//Make sure that user doesnot already exists
			filedb.read('users', phone, (err, data) => {
				if (err) {
					const hashedPassword = helpers.hash(password);
					const userObj = {
						firstName,
						lastName,
						phone,
						password: hashedPassword,
						tosAgreement
					};
					filedb.create('users', phone, userObj, err => {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, { Error: 'Could not create user' });
						}
					});
				} else {
					callback(400, {
						Error: 'A user with that phone number already exists'
					});
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	//Users-get
	//Required data-phone
	get: (data, callback) => {
		//Get the token from the header
		if (data.params.phone) {
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			tokenRoutes._tokens.verifyToken(
				token,
				data.params.phone,
				tokenIsValid => {
					if (tokenIsValid) {
						filedb.read('users', data.params.phone, (err, data) => {
							if (err) {
								callback(404, { Error: 'User not found' });
							} else {
								delete data.password;
								callback(200, data);
							}
						});
					} else {
						callback(403, { Error: 'Invalid Token' });
					}
				}
			);
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	delete: (data, callback) => {},
	put: (data, callback) => {
		const phone = data.params.phone;
		let payload = data.payload;
		let existingData = {};
		if (phone) {
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			tokenRoutes._tokens.verifyToken(token, phone, tokenIsValid => {
				if (tokenIsValid) {
					filedb.read('users', phone, (err, data) => {
						if (err) {
							callback(404, { Error: 'User not found' });
						} else {
							payload = Object.assign(data, payload);
							if (payload.password != undefined) {
								payload.password = helpers.hash(payload.password);
							}

							filedb.update('users', phone, payload, (err, data) => {
								callback(200, { message: 'Updated ' + phone });
							});
						}
					});
				} else {
					callback(403, { Error: 'Invalid Token' });
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	}
};
