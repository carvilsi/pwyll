import express from 'express';
import config from 'config';
import { logger, info } from './util/index';
import commands from './routes/commands';
import infoapp from './routes/infoapp';
import users from './routes/users';
import cors from 'cors';
import bodyParser from 'body-parser';

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

const port = config.get('port');

async function main() {
  try {
    http.listen(port, () => {
      logger.info('( () |\\/| |\\/| /\\ |\\| |) [- /?');
      logger.info('by carvilsi with <3');
      logger.info(`${info.name}@${info.version} running at: ${port}!`);
    });
  } catch (error) {
    logger.error(error);
  }
}

main();
// TODO: create sdk
// TODO: export from pet
