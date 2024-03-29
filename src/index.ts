import express from 'express';
import config from 'config';
import cors from 'cors';
import bodyParser from 'body-parser';

import { logger, info } from './util/index';
import { errorRequestHandler } from './errorHandlers';
import snippets from './routes/snippets';
import infoapp from './routes/infoapp';
import users from './routes/users';
import { getDb } from './db/mongo';

//TODO: what if config user exists but not at db.

// all CORS requests
const app = express();
app.use(cors());
app.use(bodyParser.json());

const http = require('http').createServer(app);
app.use(express.json());

// endpoints
app.use('/snippet', snippets);
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
