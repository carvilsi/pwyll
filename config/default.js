module.exports = {
  port: 46520,
  logLevel: 'DEBUG',
  // positivelly you want to change this, here or override on production.js
  pepper: 'M+Sleqzn9Fd/vDtgi/dY4aOAPTCdrf778UdH+BBWQYgVbKVNvk7nJQ==',
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
      security: 'sec',
    },
    limit: 5,
  },
};
