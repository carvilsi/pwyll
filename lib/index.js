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
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const index_1 = require("./util/index");
const commands_1 = __importDefault(require("./routes/commands"));
const infoapp_1 = __importDefault(require("./routes/infoapp"));
const users_1 = __importDefault(require("./routes/users"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
// all CORS requests
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const http = require('http').createServer(app);
app.use(express_1.default.json());
// endpoints
app.use('/command', commands_1.default);
app.use('/user', users_1.default);
app.use(infoapp_1.default);
const port = config_1.default.get('port');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            http.listen(port, () => {
                index_1.logger.info('( () |\\/| |\\/| /\\ |\\| |) [- /?');
                index_1.logger.info('by carvilsi with <3');
                index_1.logger.info(`${index_1.info.name}@${index_1.info.version} running at: ${port}!`);
            });
        }
        catch (error) {
            index_1.logger.error(error);
        }
    });
}
main();
// TODO: create sdk
// TODO: export from pet
