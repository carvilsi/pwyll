import config from 'config';
import { getUsers } from '../../controllers/users_controller';
import express from 'express';
import { logger } from '../../util';
import { unFollower } from '../db/followers_controller';
import { getPwyllSnippetByActivityId } from '../db/activity_controller';
import { subtractLike } from '../../controllers/snippets_controller';

const DOMAIN = String(config.get('federation.domain'));

export async function getUsersResource(): Promise<UserResource[] | undefined> {
  const pwyllUsers = await getUsers();
  if (typeof pwyllUsers !== 'undefined') {
    const usersResources: UserResource[] = pwyllUsers.map(user => ({
      resource: `acct:${user.username}@${DOMAIN}`,
      username: user.username,
      actor: `https://${DOMAIN}/${user.username}`,
      pwyllUserId: user._id,
      fediUser: `@${user.username}@${DOMAIN}`,
    }));
    return usersResources;
  }
}

export async function getUserResource(
  user: User
): Promise<UserResource | undefined> {
  const usersResources = await getUsersResource();

  if (usersResources?.length) {
    for (const userResource of usersResources) {
      if (userResource.username === user.username) {
        return userResource;
      }
    }
  }
}

export async function checkWebfingerUserResources(
  req: express.Request,
  res: express.Response
): Promise<UserResource | undefined> {
  const resource = req.query.resource;
  logger.debug(`webfinger resource requested: ${resource}`);
  const usersResources = await getUsersResource();
  if (usersResources?.length) {
    for (const userResource of usersResources) {
      if (userResource.resource === resource) {
        return userResource;
      }
    }
  }
  logger.debug('requested resource does not exists');
  res.sendStatus(404);
}

export async function userExists(
  actor: string,
  req: express.Request,
  res: express.Response
): Promise<UserResource | undefined> {
  logger.debug(`actor ${actor} request`);
  const usersResources = await getUsersResource();
  if (usersResources?.length) {
    for (const userResource of usersResources) {
      if (userResource.username === actor) {
        return userResource;
      }
    }
  }
  logger.debug('requested actor doees not exists');
  res.sendStatus(404);
}

export async function undoActionHandler(
  undoAction: UndoAction,
  ur: UserResource
): Promise<void> {
  switch (undoAction.type.toLocaleLowerCase()) {
    // implement unfollow
    case 'follow': {
      logger.debug(`A undo ${undoAction.type} action`);
      await unFollower(undoAction.actor, ur);
      break;
    }
    // implement unlike
    case 'like': {
      logger.debug(`A undo ${undoAction.type} action`);
      const pwyllSnippetId = await getPwyllSnippetByActivityId(
        undoAction.postId
      );
      if (typeof pwyllSnippetId !== 'undefined') {
        await subtractLike(pwyllSnippetId);
      }
      break;
    }
    default:
      break;
  }
}
