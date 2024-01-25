module.exports = {
  port: 46520,
  logLevel: 'DEBUG',
  mongodb: {
    user: 'root',
    password: 'c0mm4nd3r',
    // ip: 'localhost',
    // ip: 'mongo',
    ip: 'mongo-test',
    port: 27017,
    db: 'commander',
    collections: {
      commands: 'commands',
      users: 'users',
    },
  },
};
