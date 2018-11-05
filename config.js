let environments = {};

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};

environments.prduction = {
    'port': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};

// Determine which environment was passed as a commandline arg
let currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//
let environmentToExport = typeof(environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = environmentToExport;