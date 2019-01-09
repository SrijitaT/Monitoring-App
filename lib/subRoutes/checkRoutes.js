const filedb = require('../data');
const helpers = require('../helpers');
const config = require('../../config');
const tokenRoutes = require('./tokenRoutes');
//post
//Required Data:  protocol,url,method,successCodes,timeoutSeconds
exports._checks = {
	/*
sample payload
{
"protocol":"http","url":"yahoo.com","method":"get","successCodes":[200,201],"timeoutSeconds":3
}
  */
	post: (data, callback) => {
		let { protocol, url, method, successCodes, timeoutSeconds } = data.payload;
		protocol =
			['http', 'https'].indexOf(protocol) >= 0 && typeof protocol == 'string'
				? protocol
				: false;
		method =
			['get', 'put', 'post', 'delete'].indexOf(method) >= 0 &&
			typeof method == 'string'
				? method
				: false;
		url = typeof url == 'string' ? url : false;
		successCodes =
			successCodes instanceof Array && successCodes.length > 0
				? successCodes
				: false;
		timeoutSeconds =
			typeof timeoutSeconds == 'number' &&
			timeoutSeconds % 1 === 0 &&
			timeoutSeconds >= 1 &&
			timeoutSeconds <= 5
				? timeoutSeconds
				: false;
		if ((protocol, url, method, successCodes, timeoutSeconds)) {
			//Get the token from the headers
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			filedb.read('tokens', token, (err, tokenData) => {
				if (err) {
					callback(403);
				} else {
					const userPhone = tokenData.phone;
					filedb.read('users', userPhone, (err, userData) => {
						const userChecks =
							typeof userData.checks == 'object' &&
							userData.checks instanceof Array
								? userData.checks
								: [];
						//verify the user has less than max _checks
						if (userChecks.length <= config.maxChecks) {
							const checkId = helpers.createRandomString(10);
							const checkObj = {
								id: checkId,
								userPhone,
								protocol,
								url,
								method,
								successCodes,
								timeoutSeconds
							};
							filedb.create('checks', checkId, checkObj, err => {
								if (err) {
									callback(500);
								} else {
									//Add check id to user Object
									userData.checks = userChecks;
									userData.checks.push(checkId);
									//save the new user Data
									filedb.update('users', userPhone, userData, err => {
										if (err) {
											callback(400, {
												Error: 'Couldnot update the user with the check'
											});
										} else {
											callback(200, checkObj);
										}
									});
								}
							});
						} else {
							callback(400, {
								Error: 'Cannot exceed ' + config.maxChecks + ' checks'
							});
						}
					});
				}
			});
		} else {
			callback(400, { Error: 'Missing required fields' });
		}
	},
	//params->>id and phone
	get: (data, callback) => {
		if (data.params.id) {
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			tokenRoutes._tokens.verifyToken(
				token,
				data.params.phone,
				tokenIsValid => {
					if (tokenIsValid) {
						filedb.read('checks', data.params.id, (err, data) => {
							if (err) {
								callback(404, { Error: 'Check ID does not exists!' });
							} else {
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
	//Required data:id
	/*
sample payload
{
"id":"6d641c1b5de500d91188","protocol":"http","url":"yahoo.com","method":"get","successCodes":[200,201],"timeoutSeconds":3
}
  */
	put: (data, callback) => {
		const phone = data.params.phone;
		const { payload } = data;
		let {
			id,
			protocol,
			url,
			method,
			successCodes,
			timeoutSeconds
		} = data.payload;
		protocol =
			['http', 'https'].indexOf(protocol) >= 0 && typeof protocol == 'string'
				? protocol
				: false;
		method =
			['get', 'put', 'post', 'delete'].indexOf(method) >= 0 &&
			typeof method == 'string'
				? method
				: false;
		url = typeof url == 'string' ? url : false;
		successCodes =
			successCodes instanceof Array && successCodes.length > 0
				? successCodes
				: false;
		timeoutSeconds =
			typeof timeoutSeconds == 'number' &&
			timeoutSeconds % 1 === 0 &&
			timeoutSeconds >= 1 &&
			timeoutSeconds <= 5
				? timeoutSeconds
				: false;

		if (id) {
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			tokenRoutes._tokens.verifyToken(token, phone, tokenIsValid => {
				if (tokenIsValid) {
					filedb.read('checks', id, (err, checkData) => {
						if (err) {
							callback(404, { Error: 'Check ID does not exists!' });
						} else {
							checkData = Object.assign(checkData, payload);
							filedb.update('checks', id, checkData, (err, data) => {
								callback(200, { message: 'Updated ' + id });
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
	},

	//Required data-ID
	delete: (data, callback) => {
		const phone = data.params.phone;
		let { id } = data.payload;
		if (id && phone) {
			const token =
				typeof data.headers.token == 'string' ? data.headers.token : false;
			tokenRoutes._tokens.verifyToken(token, phone, tokenIsValid => {
				if (tokenIsValid) {
					filedb.read('checks', id, (err, data) => {
						if (err) {
							callback(404, { Error: 'Check ID not found' });
						} else {
							filedb.delete('checks', id, (err, data) => {
								/**** also remove check id from the users json ***/
								if (err) {
									callback(404, { Error: 'Could not delete Check ID' });
								} else {
									filedb.read('users', phone, (err, userData) => {
										if (err) {
											callback(404, { Error: 'User not found' });
										} else {
											const index = userData.checks.indexOf(id);
											if (index >= 0) userData.checks.splice(index, 1);
											console.log();
											filedb.update('users', phone, userData, (err, data) => {
												callback(200);
											});
										}
									});
								}
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
