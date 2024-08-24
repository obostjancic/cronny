import { dataDirPath } from "../db/schema.js";
import { promises as fs } from "fs";
import path from "path";
export async function notifyLogFile(filePath, results) {
    const lines = results.map((result) => JSON.stringify(result)).join("\n");
    return writeIntoLogFile(filePath, lines);
}
async function writeIntoLogFile(filePath, data) {
    const logFile = path.join(dataDirPath, filePath);
    return fs.appendFile(logFile, data, "utf-8");
}
