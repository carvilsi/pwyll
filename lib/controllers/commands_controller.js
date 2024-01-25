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
exports.updatesCommand = exports.deleteCommandById = exports.findCommandByQuery = exports.createCommand = void 0;
const util_1 = require("./../util");
const mongo_1 = require("./../db/mongo");
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("config"));
const users_controller_1 = require("./users_controller");
const lodash_1 = __importDefault(require("lodash"));
const collectionName = String(config_1.default.get('mongodb.collections.commands'));
function createCommand(comm, description, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            if (userId != null) {
                const user = yield (0, users_controller_1.findUserById)(userId);
                if (user != null) {
                    const command = {
                        command: comm,
                        description: description,
                        user: user,
                    };
                    const insertResult = yield collection.insertOne(command);
                    util_1.logger.debug('Inserted documents =>', insertResult);
                    const id = insertResult.insertedId;
                    return Promise.resolve(id);
                }
                else {
                    throw new Error('Not possible to store a command for a non exiting user');
                }
            }
            else {
                throw new Error('userId must be provided');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.createCommand = createCommand;
function findCommandByQuery(search, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            util_1.logger.debug(`try to find commands for: ${search} and for user: ${userId}`);
            let user;
            if (userId != null) {
                user = yield (0, users_controller_1.findUserById)(userId);
                if (user == null)
                    throw new Error('Any commands for provided user');
            }
            const regExp = new RegExp(`${search}`, 'im');
            let mongoQuery;
            if (user != null) {
                mongoQuery = {
                    $or: [
                        { command: { $regex: regExp } },
                        { description: { $regex: regExp } },
                    ],
                    $and: [{ user: user }],
                };
            }
            else {
                mongoQuery = {
                    $or: [
                        { command: { $regex: regExp } },
                        { description: { $regex: regExp } },
                    ],
                };
            }
            const results = yield collection.find(mongoQuery).toArray();
            const commands = [];
            for (const result of results) {
                const command = {
                    command: result.command,
                    description: result.description,
                    _id: result._id,
                    username: result.user.username,
                };
                commands.push(command);
            }
            return commands;
        }
        catch (error) {
            if (error instanceof mongodb_1.MongoError || error instanceof Error) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.findCommandByQuery = findCommandByQuery;
function _findCommandById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            util_1.logger.debug(`try to find commands with id: ${id}`);
            const objectId = new mongodb_1.ObjectId(id);
            const result = yield collection.findOne({ _id: objectId });
            if (result != null) {
                const command = {
                    command: result.command,
                    description: result.description,
                    _id: result._id,
                    user: result.user,
                };
                return Promise.resolve(command);
            }
            else {
                return Promise.resolve(`command not found for ${id}`);
            }
        }
        catch (error) {
            util_1.logger.error(error);
            if (error instanceof Error) {
                if (/Argument passed in must be a string of 12 bytes or a string of 24 hex characters/.test(error.message)) {
                    throw new Error('Command not found for deleting command');
                }
                else {
                    throw new Error(error.message);
                }
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
function deleteCommandById(id, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            if (id != null && userId != null) {
                const user = yield (0, users_controller_1.findUserById)(userId);
                if (user == null)
                    throw new Error('User does not exist for deleting command');
                const command = yield _findCommandById(id);
                if (command != null) {
                    if (typeof command === 'string')
                        throw new Error('Command not found for deleting command');
                    if (!lodash_1.default.isEqual(command.user._id, user._id) ||
                        command.user.username !== user.username) {
                        throw new Error('Wrong user provided for deleting command');
                    }
                }
                const objectId = new mongodb_1.ObjectId(id);
                const result = yield collection.deleteOne({ _id: objectId });
                if (result != null) {
                    if (result.acknowledged && result.deletedCount === 1)
                        return Promise.resolve(true);
                }
                else {
                    return Promise.resolve(false);
                }
            }
            else {
                throw new Error('bad request');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.deleteCommandById = deleteCommandById;
function updatesCommand(commandUpdate, descriptionUpdate, id, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, mongo_1.getCollection)(collectionName);
            if (id != null &&
                userId != null &&
                commandUpdate != null &&
                descriptionUpdate != null) {
                const user = yield (0, users_controller_1.findUserById)(userId);
                if (user == null)
                    throw new Error('User does not exist for updating command');
                const commandFound = yield _findCommandById(id);
                if (commandFound != null) {
                    if (typeof commandFound === 'string')
                        throw new Error('Command not found for updating command');
                    if (!lodash_1.default.isEqual(commandFound.user._id, user._id) ||
                        commandFound.user.username !== user.username) {
                        throw new Error('Wrong user provided for deleting command');
                    }
                }
                const objectId = new mongodb_1.ObjectId(id);
                const command = {
                    command: commandUpdate,
                    description: descriptionUpdate,
                };
                const result = yield collection.updateOne({ _id: objectId }, [
                    { $set: command },
                ]);
                if (result != null) {
                    if (result.acknowledged && result.matchedCount === 1)
                        return Promise.resolve(true);
                }
                else {
                    return Promise.resolve(false);
                }
            }
            else {
                throw new Error('bad request');
            }
        }
        catch (error) {
            if (error instanceof mongodb_1.MongoError || error instanceof Error) {
                throw new Error(error.message);
            }
        }
        finally {
            yield (0, mongo_1.close)();
        }
    });
}
exports.updatesCommand = updatesCommand;
