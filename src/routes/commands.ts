const router = require('express').Router();
import express from 'express';
import { paramCheck, errorRouteHandler } from '../util';
import {
  createCommand,
  findCommandByQuery,
  findCommandById,
  deleteCommandById,
  updateCommand,
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
      paramCheck(req, ['command', 'description', 'userId', 'secret']);
      const id = await createCommand(
        req.body.command,
        req.body.description,
        req.body.userId,
        req.body.secret
      );
      res.status(200).send(id);
    } catch (e) {
      errorRouteHandler(e, next);
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
      paramCheck(req, ['q'], { check: 'query' });
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
      errorRouteHandler(e, next);
    }
  }
);

// retrieves a snippet by ID
router.get(
  '/:id',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['id'], { check: 'params' });
      const command = <Command>await findCommandById(String(req.params.id));
      const commandToSend: Command = {
        command: command.command,
        description: command.description,
        username: command.user?.username,
      };
      res.status(200).send(commandToSend);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

// updates a snippet from a user
router.put(
  '/',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['command', 'description', 'id', 'userId', 'secret']);
      const commands = await updateCommand(
        req.body.command,
        req.body.description,
        req.body.id,
        req.body.userId,
        req.body.secret
      );
      res.status(200).send(commands);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

// deletes a snippet from a user
router.delete(
  '/:id/:userId',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['id', 'userId', 'secret'], { check: 'params' });
      const result = await deleteCommandById(
        req.params.id,
        req.params.userId,
        req.params.secret
      );
      res.status(200).send(result);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

export default router;
