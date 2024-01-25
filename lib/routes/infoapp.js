"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../util/index");
const router = require('express').Router();
// Index page displaying info about the service. The optional req query param is just for example purposes
router.get('/', (req, res) => {
    index_1.logger.debug('retrieved call to / endpoit');
    res
        .status(200)
        .send(`${index_1.info.name}@${index_1.info.version} ( () |\\/| |\\/| /\\ |\\| |) [- /? by carvilsi with <3`);
});
exports.default = router;
