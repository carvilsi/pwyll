import { logger, info } from '../util/index';
import express from 'express';
const router = require('express').Router();

// Index page displaying info about the service. The optional req query param is just for example purposes
router.get('/', (_req: express.Request, res: express.Response) => {
  logger.debug('retrieved call to / endpoit');
  res.status(200).send(`${info.name}@${info.version} by carvilsi with <3`);
});

router.get('/info', (_req: express.Request, res: express.Response) => {
  logger.debug('retrieved call to /info endpoit');
  const pwyllInfo: Info = {
    version: info.version,
    name: info.name,
  };
  res.status(200).json(pwyllInfo);
});

export default router;
