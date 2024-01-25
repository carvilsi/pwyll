"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const router = require('express').Router();
const util_2 = require("../util");
const commands_controller_1 = require("../controllers/commands_controller");
// adds a command
// If does not comes with user id will be not possible to do RUD
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, util_2.paramCheck)(req.body, ['command', 'description', 'userId']);
        const id = yield (0, commands_controller_1.createCommand)(req.body.command, req.body.description, req.body.userId);
        res.status(200).send(id);
    }
    catch (e) {
        util_1.logger.error(e);
        if (e instanceof Error) {
            next(e.message);
        }
        else {
            next(e);
        }
    }
}));
// finds a command by query on command or description
// if userId is provided, then it will restrict the search for this user
router.get('/find', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, util_2.paramCheck)(req.query, ['q']);
        let commands;
        if (req.query.userId != null) {
            commands = yield (0, commands_controller_1.findCommandByQuery)(String(req.query.q), String(req.query.userId));
        }
        else {
            commands = yield (0, commands_controller_1.findCommandByQuery)(String(req.query.q));
        }
        res.status(200).send(commands);
    }
    catch (e) {
        util_1.logger.error(e);
        if (e instanceof Error) {
            next(e.message);
        }
        else {
            next(e);
        }
    }
}));
router.put('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, util_2.paramCheck)(req.body, ['command', 'description', 'id', 'userId']);
        const commands = yield (0, commands_controller_1.updatesCommand)(req.body.command, req.body.description, req.body.id, req.body.userId);
        res.status(200).send(commands);
    }
    catch (e) {
        util_1.logger.error(e);
        if (e instanceof Error) {
            next(e.message);
        }
        else {
            next(e);
        }
    }
}));
router.delete('/:id/:userId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, util_2.paramCheck)(req.params, ['id', 'userId']);
        const result = yield (0, commands_controller_1.deleteCommandById)(req.params.id, req.params.userId);
        res.status(200).send(result);
    }
    catch (e) {
        util_1.logger.error(e);
        if (e instanceof Error) {
            next(e.message);
        }
        else {
            next(e);
        }
    }
}));
exports.default = router;
