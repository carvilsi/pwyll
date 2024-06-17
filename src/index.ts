import express from 'express';
import helmet from 'helmet';
import config from 'config';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { logger, info } from './util/index';
import { errorRequestHandler } from './errorHandlers';
import snippets from './routes/snippets';
import infoapp from './routes/infoapp';
import users from './routes/users';
import { getDb } from './db/mongo';
import webfinger from './federation/webfinger';
import activitypub from './federation/activitypub';

// all CORS requests
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan("tiny"));

const http = require('http').createServer(app);
// app.use(express.json({ 
//   type: [
//     "application/json",
//     "application/activity+json"
//   ]
// }));

app.use(
  express.text({ 
    type: [
      "application/json",
      "application/activity+json"
    ]
  })
);

// endpoints
app.use('/snippet', snippets);
app.use('/user', users);
app.use(infoapp);

// fediverse endpoints
app.use('/.well-known', webfinger);
app.use(activitypub);

app.use(errorRequestHandler);

const port = config.get('port');
const mongoIP = config.get('mongodb.ip');
const mongoPort = config.get('mongodb.port');

const DOMAIN = config.get('federation.domain');
const ACCOUNT = config.get('federation.account');

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
      logger.info(`find me at fediverse: \n@${ACCOUNT}@${DOMAIN}`);
    });
  } catch (error) {
    logger.error(error);
  }
}

main();
