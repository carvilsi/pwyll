import config from "config";
import { getUsers } from "../../controllers/users_controller";
import express from 'express';
import { logger } from "../../util";

const DOMAIN = String(config.get('federation.domain'));

async function getUsersResource(): Promise<UserResource[] | undefined> {
    const pwyllUsers = await getUsers();
    if (typeof pwyllUsers !== 'undefined') {
        const usersResources: UserResource[] = 
            pwyllUsers.map(user => ({
                resource: `acct:${user.username}@${DOMAIN}`,
                username: user.username,
                actor: `https://${DOMAIN}/${user.username}`,
            }));
        return usersResources;
    }
}

export async function getUserResource(
    user: User
): Promise<UserResource | undefined> {
    console.dir(user);
    
    const usersResources = await getUsersResource();
    console.dir(usersResources);
    
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
  res: express.Response,
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
    res: express.Response,
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
