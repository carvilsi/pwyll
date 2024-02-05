import express from 'express';
import config from 'config';
import cors from 'cors';
import bodyParser from 'body-parser';

import { logger, info, errorRequestHandler } from './util/index';
import commands from './routes/commands';
import infoapp from './routes/infoapp';
import users from './routes/users';
import { connect, getDb, close } from './db/mongo';

// all CORS requests
const app = express();
app.use(cors());
app.use(bodyParser.json());

const http = require('http').createServer(app);
app.use(express.json());

// endpoints
app.use('/command', commands);
app.use('/user', users);
app.use(infoapp);

app.use(errorRequestHandler);

const port = config.get('port');
const mongoIP = config.get('mongodb.ip');
const mongoPort = config.get('mongodb.port');

async function main() {
  try {
    http.listen(port, async () => {
      logger.info('           ┓┓');
      logger.info('    ┏┓┓┏┏┓┏┃┃');
      logger.info('    ┣┛┗┻┛┗┫┗┗');
      logger.info('    ┛     ┛  ');
      logger.info('by carvilsi with <3');
      logger.info(`${info.name}@${info.version} running at: ${port}!`);
      await connect();
      const db = getDb();
      logger.info(
        `connected to MongoDB ${db.databaseName}@${mongoIP}:${mongoPort}`
      );
    });
  } catch (error) {
    logger.error(error);
  }
}

main();
// TODO: export from pet
