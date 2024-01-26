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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExistenceCheck = exports.userLengthCheck = exports.paramCheck = exports.logger = exports.info = void 0;
const Logger = require('logplease');
exports.info = require('./../../package.json');
const config_1 = __importDefault(require("config"));
const users_controller_1 = require("../controllers/users_controller");
const logLevel = config_1.default.get('logLevel');
Logger.setLogLevel(logLevel);
exports.logger = Logger.create(`${exports.info.name}`);
function paramCheck(param, mandatoryParams) {
    for (const mandatoryParam of mandatoryParams) {
        if (param[mandatoryParam] == null) {
            throw `bad request for endpoint, mandatory: ${mandatoryParam}`;
        }
    }
    return true;
}
exports.paramCheck = paramCheck;
function userLengthCheck(username) {
    if (!username.trim().length)
        throw 'Provide a user name';
    if (username.length > 20)
        throw 'Username must be not longer than 20 characters';
    return true;
}
exports.userLengthCheck = userLengthCheck;
function userExistenceCheck(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, users_controller_1.findUserByName)(username);
        if (user != null)
            throw `User ${username} already exists, please choose a different`;
        return true;
    });
}
exports.userExistenceCheck = userExistenceCheck;
