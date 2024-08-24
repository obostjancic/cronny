"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyLogFile = notifyLogFile;
const schema_1 = require("../db/schema");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function notifyLogFile(filePath, results) {
    const lines = results.map((result) => JSON.stringify(result)).join("\n");
    return writeIntoLogFile(filePath, lines);
}
async function writeIntoLogFile(filePath, data) {
    const logFile = path_1.default.join(schema_1.dataDirPath, filePath);
    return fs_1.promises.appendFile(logFile, data, "utf-8");
}
