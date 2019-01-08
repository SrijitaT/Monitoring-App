//Helpers for various tasks
const crypto = require('crypto');
const config = require('../config');
//Containers for all the Helpers

const helpers = {};
helpers.hash = str => {
	if (typeof str == 'string' && str.length > 0) {
		const hashStr = crypto
			.createHmac('sha256', config.hashSecret)
			.update(str)
			.digest('hex');
		return hashStr;
	} else {
		return false;
	}
};
helpers.parseJsonToObj = json => {
	try {
		return JSON.parse(json);
	} catch (e) {
		return {};
	}
};

helpers.createRandomString = len => {
	const strlen = len > 0 && typeof len == 'number' ? len : 10;
	return crypto.randomBytes(strlen).toString('hex');
};
module.exports = helpers;
