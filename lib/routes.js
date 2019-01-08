const handlers = require('./handlers');
const router = {
	sample: handlers.sample,
	notFound: handlers.notFound,
	ping: handlers.ping,
	users: handlers.users,
	token: handlers.token,
	checks: handlers.checks
};

module.exports = router;
