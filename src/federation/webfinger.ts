import { logger } from '../util/index';
import config from 'config';
import express from 'express';
import { APP_ACTV_JSON } from './utils/fedi.constants';
const router = require('express').Router();
  
const ACCOUNT = String(config.get('federation.account'));
const DOMAIN = String(config.get('federation.domain'));

router.get(
    "/webfinger", 
    async (
        req: express.Request,
        res: express.Response
    ) => {
        const actor: string = `https://${DOMAIN}/${ACCOUNT}`;

        const resource = req.query.resource;
        logger.debug(`webfinger resource requested: ${resource}`);
        if (resource !== `acct:${ACCOUNT}@${DOMAIN}`) {
            return res.sendStatus(404)
        };

        return res.contentType(APP_ACTV_JSON)
            .json({
                subject: `acct:${ACCOUNT}@${DOMAIN}`,
                links: [{
                    rel: "self",
                    type: APP_ACTV_JSON,
                    href: actor,
                }],
            });
});

export default router;