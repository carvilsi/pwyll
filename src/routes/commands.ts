import { logger } from '../util';
const router = require('express').Router();
import express from 'express';
import { paramCheck } from '../util';
import {
  createCommand,
  findCommandByQuery,
  deleteCommandById,
  updatesCommand,
} from '../controllers/commands_controller';

// adds a command
// If does not comes with user id will be not possible to do RUD
router.post(
  '/',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req.body, ['command', 'description', 'userId']);
      const id = await createCommand(
        req.body.command,
        req.body.description,
        req.body.userId
      );
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

// finds a command by query on command or description
// if userId is provided, then it will restrict the search for this user
router.get(
  '/find',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req.query, ['q']);
      let commands;
      if (req.query.userId != null) {
        commands = await findCommandByQuery(
          String(req.query.q),
          String(req.query.userId)
        );
      } else {
        commands = await findCommandByQuery(String(req.query.q));
      }
      res.status(200).send(commands);
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

router.put(
  '/',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req.body, ['command', 'description', 'id', 'userId']);
      const commands = await updatesCommand(
        req.body.command,
        req.body.description,
        req.body.id,
        req.body.userId
      );
      res.status(200).send(commands);
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

router.delete(
  '/:id/:userId',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req.params, ['id', 'userId']);
      const result = await deleteCommandById(req.params.id, req.params.userId);
      res.status(200).send(result);
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
