// TODO: remove this
/* eslint no-console:off */
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
import { APP_ACTV_JSON } from './federation/utils/fedi.constants';
import { getUsersResource } from './federation/utils';

// all CORS requests
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('tiny'));

const http = require('http').createServer(app);

app.use(
  express.text({
    type: ['application/json', APP_ACTV_JSON],
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
      const usersResources = await getUsersResource();
      if (usersResources?.length) {
        logger.info('find one of these Pwyll users at fediverse:');
        for (const userResource of usersResources) {
          const fediUser = userResource.fediUser;
          logger.info(fediUser);
          console.log(fediUser);
        }
      }
    });
  } catch (error) {
    logger.error(error);
  }
}

main();
