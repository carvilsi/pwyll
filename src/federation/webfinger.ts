import { logger } from '../util/index';
import config from 'config';
import express from 'express';
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
        if (resource !== `acct:${ACCOUNT}@${DOMAIN}`) return res.sendStatus(404);

        return res.contentType("application/activity+json").json({
            subject: `acct:${ACCOUNT}@${DOMAIN}`,
            links: [
            {
                rel: "self",
                type: "application/activity+json",
                href: actor,
            },
            ],
        });
});

export default router;