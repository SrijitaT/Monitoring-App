const userRoutes = require('./subRoutes/userRoutes');
const tokenRoutes = require('./subRoutes/tokenRoutes');
const handlers = {
	sample: function(data, callback) {
		callback(406, { name: 'srijita' });
	},
	notFound: function(data, callback) {
		callback(404);
	},
	ping: function(data, callback) {
		callback(200);
	},
	users: function(data, callback) {
		const acceptableMethods = ['post', 'get', 'delete', 'put'];
		if (acceptableMethods.indexOf(data.method) >= 0) {
			userRoutes._users[data.method](data, callback);
		} else {
			callback(405);
		}
	},
	token: function(data, callback) {
		const acceptableMethods = ['post', 'get', 'delete', 'put'];
		if (acceptableMethods.indexOf(data.method) >= 0) {
			tokenRoutes._tokens[data.method](data, callback);
		} else {
			callback(405);
		}
	}
};

module.exports = handlers;
