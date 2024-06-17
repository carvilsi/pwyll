import crypto from "node:crypto";
// import { Router } from "express";
import express from 'express';
const router = require('express').Router();
import config from 'config';

import { logger } from '../util';
import { getCollection } from '../db/mongo';
import { PUBLIC_KEY } from "./handlers";

const DOMAIN = config.get('federation.domain');
const ACCOUNT = config.get('federation.account');
const actor: string = `https://${DOMAIN}/${ACCOUNT}`;

import { send, verify } from "./handlers";

// export const activitypub = Router();

// activitypub.get("/:actor/outbox", async (req, res) => {
//   const actor: string = req.app.get("actor");
//   if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

//   const posts = listPosts().filter(
//     (post) => "type" in post.contents && post.contents.type === "Create"
//   );

//   return res.contentType("application/activity+json").json({
//     "@context": "https://www.w3.org/ns/activitystreams",
//     id: `${actor}/outbox`,
//     type: "OrderedCollection",
//     totalItems: posts.length,
//     orderedItems: posts.map((post) => ({
//       ...post.contents,
//       id: `${actor}/posts/${post.id}`,
//       actor,
//       published: post.createdAt.toISOString(),
//       to: ["https://www.w3.org/ns/activitystreams#Public"],
//       cc: [],
//     })),
//   });
// });

router.post("/:actor/inbox", async (req: express.Request, res: express.Response) => {
  // const actor: string = req.app.get("actor");
  
  if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

  // console.dir(req);
  /** If the request successfully verifies against the public key, `from` is the actor who sent it. */
  let from = "";
  try {
    // verify the signed HTTP request
    from = await verify(req);
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }

  const body = JSON.parse(req.body);

  // ensure that the verified actor matches the actor in the request body
  if (from !== body.actor) return res.sendStatus(401);

  switch (body.type) {
    case "Follow": {
      await send(actor, body.actor, {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://${DOMAIN}/${crypto.randomUUID()}`,
        type: "Accept",
        actor,
        object: body,
      });
      console.log('The follow');
      // createFollower({ actor: body.actor, uri: body.id });
      break;
    }

    case "Undo": {
      if (body.object.type === "Follow") {
        // deleteFollower({ actor: body.actor, uri: body.object.id });
      }

      break;
    }

    // case "Accept": {
    //   if (body.object.type === "Follow") {
    //     updateFollowing({
    //       actor: body.actor,
    //       uri: body.object.id,
    //       confirmed: true,
    //     });
    //   }

    //   break;
    // }
  }

  return res.sendStatus(204);
});

// activitypub.get("/:actor/followers", async (req, res) => {
//   const actor: string = req.app.get("actor");

//   if (req.params.actor !== ACCOUNT) return res.sendStatus(404);
//   const page = req.query.page;

//   const followers = listFollowers();

//   res.contentType("application/activity+json");

//   if (!page) {
//     return res.json({
//       "@context": "https://www.w3.org/ns/activitystreams",
//       id: `${actor}/followers`,
//       type: "OrderedCollection",
//       totalItems: followers.length,
//       first: `${actor}/followers?page=1`,
//     });
//   }

//   return res.json({
//     "@context": "https://www.w3.org/ns/activitystreams",
//     id: `${actor}/followers?page=${page}`,
//     type: "OrderedCollectionPage",
//     partOf: `${actor}/followers`,
//     totalItems: followers.length,
//     orderedItems: followers.map((follower) => follower.actor),
//   });
// });

// activitypub.get("/:actor/following", async (req, res) => {
//   const actor: string = req.app.get("actor");

//   if (req.params.actor !== ACCOUNT) return res.sendStatus(404);
//   const page = req.query.page;

//   const following = listFollowing();

//   res.contentType("application/activity+json");

//   if (!page) {
//     return res.json({
//       "@context": "https://www.w3.org/ns/activitystreams",
//       id: `${actor}/following`,
//       type: "OrderedCollection",
//       totalItems: following.length,
//       first: `${actor}/following?page=1`,
//     });
//   }

//   return res.json({
//     "@context": "https://www.w3.org/ns/activitystreams",
//     id: `${actor}/following?page=${page}`,
//     type: "OrderedCollectionPage",
//     partOf: `${actor}/following`,
//     totalItems: following.length,
//     orderedItems: following.map((follow) => follow.actor),
//   });
// });

router.get("/:actor", async (req: express.Request, res: express.Response) => {
  console.log('WTH!!!!!!')
  if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

  return res.contentType("application/activity+json").json({
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    id: actor,
    type: "Person",
    preferredUsername: ACCOUNT,
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
});

// activitypub.get("/:actor/posts/:id", async (req, res) => {
//   const actor: string = req.app.get("actor");
//   if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

//   const post = findPost(req.params.id);
//   if (!post) return res.sendStatus(404);

//   return res.contentType("application/activity+json").json({
//     ...post,
//     id: `${actor}/posts/${req.params.id}`,
//   });
// });

export default router;