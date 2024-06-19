import { logger } from '../util/index';
import config from 'config';
import express from 'express';
import { APP_ACTV_JSON } from './utils/fedi.constants';
import { getUsers } from '../controllers/users_controller';
const router = require('express').Router();

// const ACCOUNT = String(config.get('federation.account'));
const DOMAIN = String(config.get('federation.domain'));

type WebfingerResource = {
  username: string,
  resource: string,
  actor: string,
}

async function checkWebfingerUserResources(
  resource: string,
): Promise<boolean | WebfingerResource> {
  const pwyllUsers = await getUsers();
  if (typeof pwyllUsers !== 'undefined') {
    const webfingerUsers: WebfingerResource[] = pwyllUsers.map(user => 
      ({
        resource: `acct:${user.username}@${DOMAIN}`,
        username: user.username,
        actor: `https://${DOMAIN}/${user.username}`,
      }));
    for (const webfingerUser of webfingerUsers) {
      if (webfingerUser.resource === resource) {
        return webfingerUser;
      }
    }
  }
  return false;
}

router.get(
  '/webfinger',
  async (req: express.Request, res: express.Response) => {
    const resource = req.query.resource;
    logger.debug(`webfinger resource requested: ${resource}`);
    const resourceExists = 
      await checkWebfingerUserResources(String(resource));
    if (typeof resourceExists === 'boolean' || !resourceExists) {
      logger.debug('requested resource does not exists');
      return res.sendStatus(404);
    } else {
      console.dir(resourceExists);
      return res.contentType(APP_ACTV_JSON).json({
        subject: resourceExists.resource,
        links: [
          {
            rel: 'self',
            type: APP_ACTV_JSON,
            href: resourceExists.actor,
          },
        ],
      });
    }
  }
);

export default router;
