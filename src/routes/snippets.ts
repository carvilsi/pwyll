const router = require('express').Router();
import express from 'express';
import { paramCheck } from '../util/routes';
import { errorRouteHandler } from '../errorHandlers';
import {
  createSnippet,
  findSnippetByQuery,
  findSnippetByID,
  deleteSnippetByID,
  updateSnippet,
} from '../controllers/snippets_controller';
import { findUserByID } from '../controllers/users_controller';
import QueryStream from 'pg-query-stream';
import JSONStream from 'JSONStream';
import { pool } from '../db';
import { allSnippetsForUser } from '../db/queries';

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
      res.statusCode = 200;
      res.send(String(id));
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
      res.statusCode = 200;
      res.send(snippets);
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

      const userID = String(req.query.userID);
      let user: User | undefined;
      if (userID != null) {
        user = await findUserByID(userID);
      }

      pool.connect((err, client, done) => {
        if (err) throw err;
        const query = new QueryStream(allSnippetsForUser, [user?._id]);
        const stream = client?.query(query);
        let counter = 0;
        stream?.on('end', () => {
          done();
          res.write(']');
          res.end();
        });
        stream?.on('data', (data: any) =>{
          console.dir(data);
          if (counter === 0) res.write('[');
          res.write(JSON.stringify(data));
          if (counter < data.total - 1) res.write(',');
          counter++;
        });
      });
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
      res.statusCode = 200;
      res.send(snippetToSend);
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
      res.statusCode = 200;
      res.send(snippet);
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
      res.statusCode = 200;
      res.send(result);
    } catch (e) {
      errorRouteHandler(e, next);
    }
  }
);

export default router;
