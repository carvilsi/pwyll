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
import { close } from './db/postgresql';

// all CORS requests
const app = express();
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
const postgresDB = config.get('postgresql.db');

async function main() {
  try {
    http.listen(port, async () => {
      logger.info('           ┓┓');
      logger.info('    ┏┓┓┏┏┓┏┃┃');
      logger.info('    ┣┛┗┻┛┗┫┗┗');
      logger.info('    ┛     ┛  ');
      logger.info('by carvilsi with <3');
      logger.info(`${info.name}@${info.version} running at: ${port}!`);
      logger.info(
        `connected to PostgreSQL ${postgresDB}@${postgresIP}:${postgresPort}`
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

process.on('SIGINT', async () => {
  logger.info('Closing database connection...');
  await close();
  logger.info('Database connection closed');
  logger.info('Closing server...');
  http.close();
  logger.info('Server closed');
  process.exit(0);
});