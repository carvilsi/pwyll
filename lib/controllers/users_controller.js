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
exports.findUserByName = exports.findUserById = exports.createUser = void 0;
const util_1 = require("./../util");
const mongo_1 = require("./../db/mongo");
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("config"));
const collectionName = String(config_1.default.get('mongodb.collections.users'));
function createUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            const user = {
                username: username,
            };
            const insertResult = yield collection.insertOne(user);
            util_1.logger.debug('Inserted user =>', insertResult);
            const id = insertResult.insertedId;
            return id;
        }
        catch (error) {
            util_1.logger.error(error);
            if (error instanceof mongodb_1.MongoError) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.createUser = createUser;
function findUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            util_1.logger.debug(`try to find user with id: ${id}`);
            const objectId = new mongodb_1.ObjectId(id);
            const result = yield collection.findOne({ _id: objectId });
            if (result != null) {
                const user = {
                    username: result.username,
                    _id: result._id,
                };
                return Promise.resolve(user);
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        catch (error) {
            util_1.logger.error(error);
            if (error instanceof mongodb_1.MongoError) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.findUserById = findUserById;
function findUserByName(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            util_1.logger.debug(`try to find username: ${username}`);
            const result = yield collection.findOne({ username: username });
            if (result != null) {
                const user = {
                    username: result.username,
                };
                return Promise.resolve(user);
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        catch (error) {
            util_1.logger.error(error);
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.findUserByName = findUserByName;
