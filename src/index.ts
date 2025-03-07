import express from 'express';
import helmet from 'helmet';
import config from 'config';
import cors from 'cors';
import bodyParser from 'body-parser';

import { logger, info } from './util/index';
import { errorRequestHandler } from './errorHandlers';
import snippets from './routes/snippets';
import infoapp from './routes/infoapp';
import users from './routes/users';
import { closeDB } from './db';
import * as db from './db/';
import { currentDB, pwyllMeta } from './db/queries';

// all CORS requests
export const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

const http = require('http').createServer(app);
app.use(express.json());

// endpoints
app.use('/snippet', snippets);
app.use('/user', users);
app.use(infoapp);

app.use(errorRequestHandler);

const port = config.get('port');
const postgresIP = config.get('postgresql.ip');
const postgresPort = config.get('postgresql.port');

async function main() {
  try {
    http.listen(port, async () => {
      logger.info('           ┓┓');
      logger.info('    ┏┓┓┏┏┓┏┃┃');
      logger.info('    ┣┛┗┻┛┗┫┗┗');
      logger.info('    ┛     ┛  ');
      logger.info('by carvilsi with <3');
      logger.info(`${info.name}@${info.version} running at: ${port}!`);
      const database = await db.query(currentDB, []);
      const databaseVers = await db.query(pwyllMeta, []);
      logger.info(
        `connected to PostgreSQL ${database.rows[0].currentDB}.${databaseVers.rows[0].id}@${postgresIP}:${postgresPort}`
      );
    });
  } catch (error) {
    logger.error(error);
  }
}

main();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export function close() {
  logger.info('Closing server...');
  http.close();
  logger.info('Server closed');
}

process.on('SIGINT', async () => {
  logger.info('Closing database connection...');
  await closeDB();
  logger.info('Database connection closed');
  await close();
});
