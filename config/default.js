module.exports = {
  port: 46520,
  logLevel: 'DEBUG',
  security: {
    // positivelly you want to change this, here or override on production.js
    // also you can change this value at the docker-compose file
    pepper: 'M+Sleqzn9Fd/vDtgi/dY4aOAPTCdrf778UdH+BBWQYgVbKVNvk7nJQ==',
    // heads up with these 2 values of argon2 implementation
    // be sure you know what are you doing
    argon2TimeCost: 4,
    argon2Parallelism: 5,
    enableSecretPolicies: true,
    secretPolicies: {
      commonPassword: false,
      passwordLength: 20,
      shannonEntropyBits: 80,
      strengthCode: ['STRONG', 'VERY_STRONG'] ,
      number: true,
      lower: true,
      upper: true,
      punctuation: true,
      symbol: true,
    }
  },
  forbiddenUserNames: [
    'anyone',
    'pwyll'
  ],
  mongodb: {
    user: 'root',
    // positivelly you want to change this, here or override on production.js
    password: 'pwy11',
    ip: 'localhost',
    port: 27017,
    db: 'pwyll',
    collections: {
      snippets: 'snippets',
      users: 'users',
    },
    limit: 5,
  },
};
