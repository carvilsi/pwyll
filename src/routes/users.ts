import { logger } from '../util';
const router = require('express').Router();
import express from 'express';

import { paramCheck, userLengthCheck, userExistenceCheck } from '../util';
import { createUser } from '../controllers/users_controller';

// adds a user
router.post(
  '/',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req.body, ['username']);
      const username = req.body.username;
      userLengthCheck(username);
      await userExistenceCheck(username);
      const id = await createUser(req.body.username);
      res.status(200).send(id);
    } catch (e) {
      logger.error(e);
      if (e instanceof Error) {
        next(e.message);
      } else {
        next(e);
      }
    }
  }
);

export default router;
