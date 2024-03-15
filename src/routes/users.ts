const router = require('express').Router();
import express from 'express';

import {
  paramCheck,
  userLengthCheck,
  secretLengthCheck,
  userExistenceCheck,
  forbiddenNameCheck,
} from '../util';
import { errorRouteHandler } from '../errorHandlers';
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
      paramCheck(req, ['username', 'secret']);
      const username = req.body.username;
      const secret = req.body.secret;
      userLengthCheck(username);
      secretLengthCheck(secret);
      forbiddenNameCheck(username);
      await userExistenceCheck(username);
      const id = await createUser(username, secret);
      res.status(200).send(id);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

export default router;
