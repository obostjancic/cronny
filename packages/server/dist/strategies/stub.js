"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const logger_1 = __importDefault(require("../utils/logger"));
async function run(params) {
    logger_1.default.log("Running stub job", params);
    return [];
}
