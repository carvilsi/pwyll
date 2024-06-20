import express from 'express';
import { APP_ACTV_JSON } from './utils/fedi.constants';
import { checkWebfingerUserResources } from './utils';
const router = require('express').Router();

router.get(
  '/webfinger',
  async (req: express.Request, res: express.Response) => {
    const resourceExists = await checkWebfingerUserResources(req, res);
    if (typeof resourceExists !== 'undefined') {
      const re = resourceExists as UserResource;
      return res.contentType(APP_ACTV_JSON).json({
        subject: re.resource,
        links: [
          {
            rel: 'self',
            type: APP_ACTV_JSON,
            href: re.actor,
          },
        ],
      });
    }
  }
);

export default router;
