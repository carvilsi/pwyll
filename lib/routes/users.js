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
const users_controller_1 = require("../controllers/users_controller");
// adds a user
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, util_2.paramCheck)(req.body, ['username']);
        const username = req.body.username;
        (0, util_2.userLengthCheck)(username);
        yield (0, util_2.userExistenceCheck)(username);
        const id = yield (0, users_controller_1.createUser)(req.body.username);
        res.status(200).send(id);
    }
    catch (e) {
        util_1.logger.error(e);
        next(e);
    }
}));
exports.default = router;
