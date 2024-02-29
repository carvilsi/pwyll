const router = require('express').Router();
import express from 'express';
import { paramCheck } from '../util';
import { errorRouteHandler } from '../errorHandlers';
import {
  createSnippet,
  findSnippetByQuery,
  findSnippetByID,
  deleteSnippetByID,
  updateSnippet,
  exportSnippets,
} from '../controllers/snippets_controller';

// adds a snippet
// If does not comes with user id will be not possible to do RUD
router.post(
  '/',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['snippet', 'description', 'userID', 'secret']);
      const id = await createSnippet(
        req.body.snippet,
        req.body.description,
        req.body.userID,
        req.body.secret
      );
      res.status(200).send(id);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

// finds a snippet by query on command or description
// if userID is provided, then it will restrict the search for this user
router.get(
  '/find',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['q'], { check: 'query' });
      let snippets;
      if (req.query.userID != null) {
        snippets = await findSnippetByQuery(
          String(req.query.q),
          String(req.query.userID)
        );
      } else {
        snippets = await findSnippetByQuery(String(req.query.q));
      }
      res.status(200).send(snippets);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

// streams all the snippet for the userID
router.get(
  '/export',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['userID'], { check: 'query' });
      const exportSnippetsResposne = await exportSnippets(
        String(req.query.userID)
      );
      if (exportSnippetsResposne != null) {
        let counter = 0;
        exportSnippetsResposne.streamContent.on('data', (data: unknown) => {
          if (counter === 0) res.write('[');
          res.write(JSON.stringify(data));
          if (counter < exportSnippetsResposne.count - 1) res.write(',');
          counter++;
        });
        exportSnippetsResposne.streamContent.on('end', () => {
          res.write(']');
          res.end();
        });
      }
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
      const foundSnippet = <Snippet>(
        await findSnippetByID(String(req.params.id))
      );
      const snippetToSend: Snippet = {
        snippet: foundSnippet.snippet,
        description: foundSnippet.description,
        username: foundSnippet.user?.username,
      };
      res.status(200).send(snippetToSend);
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
      paramCheck(req, ['snippet', 'description', 'id', 'userID', 'secret']);
      const snippet = await updateSnippet(
        req.body.snippet,
        req.body.description,
        req.body.id,
        req.body.userID,
        req.body.secret
      );
      res.status(200).send(snippet);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

// deletes a snippet from a user
router.delete(
  '/:id/:userID/:secret',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      paramCheck(req, ['id', 'userID', 'secret'], { check: 'params' });
      const result = await deleteSnippetByID(
        req.params.id,
        req.params.userID,
        req.params.secret
      );
      res.status(200).send(result);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

export default router;
