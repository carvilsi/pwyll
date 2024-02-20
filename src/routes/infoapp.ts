import { logger, info } from '../util/index';
import express from 'express';
const router = require('express').Router();

// Index page displaying info about the service. The optional req query param is just for example purposes
router.get('/', (req: express.Request, res: express.Response) => {
  logger.debug('retrieved call to / endpoit');
  res.status(200).send(`${info.name}@${info.version} by carvilsi with <3`);
});

router.get('/info', (req: express.Request, res: express.Response) => {
  logger.debug('retrieved call to /version endpoit');
  const pwyllInfo: Info = {
    version: info.version,
    name: info.name,
  };
  res.status(200).send(pwyllInfo);
});

export default router;
