const router = require('express').Router();
import express from 'express';
import { logger, paramCheck } from '../util';
import { errorRouteHandler } from '../errorHandlers';
import {
  createSnippet,
  findSnippetByQuery,
  findSnippetByID,
  deleteSnippetByID,
  updateSnippet,
  exportSnippets,
} from '../controllers/snippets_controller';
import { getCollection } from '../db/mongo';
import config from 'config';
import { findUserByID } from '../controllers/users_controller';

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
      // const collectionName = String(config.get('mongodb.collections.snippets'));
      paramCheck(req, ['userID'], { check: 'query' });
      const cursor = await exportSnippets(String(req.query.userID));
      // cursor.stream({transform: JSON.stringify}).pipe(res);
      const strm = cursor.stream({transform: JSON.stringify});
      strm.on('data', (data: any) => {
        console.log(data);
        res.write(data);
      });
      strm.on('end', ()=>{res.end()});
    //   const collection = await getCollection(collectionName);
    //   const userID = req.query.userID;
    // // logger.debug(
    // //   `try to export snippets for user: ${userID!}`
    // // );
    // let user;
    // if (userID != null) {
    //   user = await findUserByID(<string>userID);
    // }
    // const cursor = collection?.find({ user: user });
    // while (await cursor.hasNext()) {
    //   const doc = await cursor.next();
    //   const snippet: Snippet = {
    //     snippet: doc?.snippet,
    //     description: doc?.description,
    //   }
    //   res.write(JSON.stringify(cursor.next()));
    // }
      // console.log('-----');
      // console.dir(snippet);
      // console.log('-----');
      // console.log('lolololololololololololol');
      
      // while (snippet) {
      //   // console.dir(snippet);
      //   res.write(JSON.stringify(snippet));
      // }
      // res.write(snippet.stream().on('data', (<any>doc) => JSON.stringify(doc)));
      // res.end();
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
