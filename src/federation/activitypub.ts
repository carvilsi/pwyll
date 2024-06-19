import crypto from 'node:crypto';
import express from 'express';
const router = require('express').Router();
import config from 'config';

import { logger } from '../util';
import { PUBLIC_KEY } from './handlers';

const DOMAIN = config.get('federation.domain');

import { 
  send, 
  verify 
} from './handlers';
import {
  APP_ACTV_JSON,
  CONTEXT,
  CONTEXT_SEC,
  TO_PUBLIC,
} from './utils/fedi.constants';
import { 
  getActivities, 
  getActivity 
} from './db/activity_controller';
import {
  createFollower,
  getFollowers,
  unFollower,
} from './db/followers_controller';
import { userExists } from './utils';

router.get(
  '/:actor/outbox',
  async (req: express.Request, res: express.Response) => {
    const userResource = await userExists(req.params.actor, req, res);

    if (typeof userResource !== 'undefined') {
      const ur = userResource as UserResource;
      const actor = ur.actor;

      const activities = await getActivities();

      if (activities?.length) {
        const activityToSend = {
          ...CONTEXT,
          id: `${actor}/outbox`,
          type: 'OrderedCollection',
          totalItems: activities.length,
          orderedItems: activities.map(activity => ({
            ...activity.content,
            id: `${actor}/posts/${activity.id}`,
            actor,
            published: activity.createdAt,
            to: [TO_PUBLIC],
            cc: [],
          })),
        };
  
        logger.debug(activityToSend);
  
        return res.contentType(APP_ACTV_JSON).json(activityToSend);
      }
    }
  }
);

router.post(
  '/:actor/inbox',
  async (req: express.Request, res: express.Response) => {
    const userResource = await userExists(req.params.actor, req, res);

    if (typeof userResource !== 'undefined') {
      const ur = userResource as UserResource;
      const actor = ur.actor;
      /** If the request successfully verifies against the public key, `from` is the actor who sent it. */
      let from = '';
      try {
        // verify the signed HTTP request
        from = await verify(req);
      } catch (err) {
        logger.error(err);
        return res.sendStatus(401);
      }

      const body = JSON.parse(req.body);

      // ensure that the verified actor matches the actor in the request body
      if (from !== body.actor) return res.sendStatus(401);

      try {
        switch (body.type.toLowerCase()) {
          // someone following us
          case 'follow': {
            await send(actor, body.actor, {
              ...CONTEXT,
              id: `https://${DOMAIN}/${crypto.randomUUID()}`,
              type: 'Accept',
              actor,
              object: body,
            });
            createFollower(body.actor, body.id);
            break;
          }

          // implement unfollow
          case 'undo': {
            if (body.object.type === 'Follow') {
              unFollower(body.actor);
            }

            break;
          }
        }
      } catch (error) {
        logger.error(error);
      }

      return res.sendStatus(204);
    }
});

router.get(
  '/:actor/followers',
  async (req: express.Request, res: express.Response) => {
    const userResource = await userExists(req.params.actor, req, res);

    if (typeof userResource !== 'undefined') {
      const ur = userResource as UserResource;
      const actor = ur.actor;
      // TODO: Implement the pagination!
      const page = req.query.page;

      const followers = await getFollowers();

      if (typeof followers === 'undefined') {
        res.json();
      } else {
        res.contentType(APP_ACTV_JSON);

        if (!page) {
          return res.json({
            ...CONTEXT,
            id: `${actor}/followers`,
            type: 'OrderedCollection',
            totalItems: followers.length,
            first: `${actor}/followers?page=1`,
          });
        }

        return res.json({
          ...CONTEXT,
          id: `${actor}/followers?page=${page}`,
          type: 'OrderedCollectionPage',
          partOf: `${actor}/followers`,
          totalItems: followers.length,
          orderedItems: followers.map(follower => follower.actor),
        });
      }
    }
});

// TODO: Remove this since Pwyll will not follow anyone
// activitypub.get('/:actor/following', async (req, res) => {
//   const actor: string = req.app.get('actor');

//   if (req.params.actor !== ACCOUNT) return res.sendStatus(404);
//   const page = req.query.page;

//   const following = listFollowing();

//   res.contentType(APP_ACTV_JSON);

//   if (!page) {
//     return res.json({
//       '@context': 'https://www.w3.org/ns/activitystreams',
//       id: `${actor}/following`,
//       type: 'OrderedCollection',
//       totalItems: following.length,
//       first: `${actor}/following?page=1`,
//     });
//   }

//   return res.json({
//     '@context': 'https://www.w3.org/ns/activitystreams',
//     id: `${actor}/following?page=${page}`,
//     type: 'OrderedCollectionPage',
//     partOf: `${actor}/following`,
//     totalItems: following.length,
//     orderedItems: following.map((follow) => follow.actor),
//   });
// });

router.get(
  '/:actor', 
  async (
    req: express.Request, 
    res: express.Response
) => {
  const userResource = await userExists(req.params.actor, req, res);

  if (typeof userResource !== 'undefined') {
    const ur = userResource as UserResource;
    const actor = ur.actor;
    
    return res.contentType(APP_ACTV_JSON).json({
      ...CONTEXT_SEC,
      id: actor,
      type: 'Person',
      preferredUsername: ur.username,
      inbox: `${actor}/inbox`,
      outbox: `${actor}/outbox`,
      followers: `${actor}/followers`,
      following: `${actor}/following`,
      publicKey: {
        id: `${actor}#main-key`,
        owner: actor,
        publicKeyPem: PUBLIC_KEY,
      },
    });
  }
});

router.get(
  '/:actor/posts/:id',
  async (req: express.Request, res: express.Response) => {
    const userResource = await userExists(req.params.actor, req, res);

    if (typeof userResource !== 'undefined') {
      const ur = userResource as UserResource;
      const actor = ur.actor;
      const activity = await getActivity(req.params.id);
      if (!activity) return res.sendStatus(404);
  
      return res.contentType(APP_ACTV_JSON).json({
        ...activity.content,
        id: `${actor}/posts/${req.params.id}`,
      });
    }
});

export default router;
