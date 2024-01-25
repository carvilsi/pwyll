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
exports.getCollection = exports.close = exports.get = exports.connect = void 0;
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("config"));
let mongodb;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        const userDb = config_1.default.get('mongodb.user');
        const passDb = config_1.default.get('mongodb.password');
        const ipDb = config_1.default.get('mongodb.ip');
        const portDb = config_1.default.get('mongodb.port');
        const url = `mongodb://${userDb}:${passDb}@${ipDb}:${portDb}`;
        const client = new mongodb_1.MongoClient(url);
        mongodb = yield client.connect();
    });
}
exports.connect = connect;
function get() {
    const dbName = String(config_1.default.get('mongodb.db'));
    return mongodb.db(dbName);
}
exports.get = get;
function close() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongodb.close();
    });
}
exports.close = close;
function getCollection(collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connect();
        const db = get();
        const collection = db.collection(collectionName);
        return collection;
    });
}
exports.getCollection = getCollection;
