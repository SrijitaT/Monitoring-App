const environments = {};
environments.development = {
	httpPort: 3002,
	httpsPort: 3003,
	envName: 'development',
	hashSecret: 'a secret'
};

environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: 'production',
	hashSecret: 'also a secret'
};

const currEnv =
	typeof process.env.NODE_ENV == 'string'
		? process.env.NODE_ENV.toLowerCase()
		: 'development';
const envToExport =
	environments[currEnv] == undefined
		? environments.development
		: environments[currEnv];

module.exports = envToExport;
