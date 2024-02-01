module.exports = {
  port: 46520,
  logLevel: 'DEBUG',
  mongodb: {
    user: 'root',
    password: 'pwy11',
    ip: 'localhost',
    port: 27017,
    db: 'pwyll',
    collections: {
      commands: 'commands',
      users: 'users',
    },
    limit: 5,
  },
};
