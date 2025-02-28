const router = require('express').Router();
import express from 'express';

import {
  userLengthCheck,
  userExistenceCheck,
  forbiddenNameCheck,
} from '../util';
import { errorRouteHandler } from '../errorHandlers';
import config from 'config';
import { secretExistenceCheck, secretPoliciesCheck } from '../util/security';
import { paramCheck } from '../util/routes';
import { createUser } from '../controllers/users_controller';

const ENABLE_SECRET_POLICIES = Boolean(
  process.env.ENABLE_SECRET_POLICIES ||
    config.get('security.enableSecretPolicies')
);

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
      forbiddenNameCheck(username);
      await userExistenceCheck(username);
      secretExistenceCheck(secret);
      if (ENABLE_SECRET_POLICIES) secretPoliciesCheck(secret);
      const id = await createUser(username, secret);
      res.statusCode = 200;
      res.send(String(id));
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

export default router;
