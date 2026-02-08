import { promises as fs } from "fs";
import path from "path";
import { dataDirPath } from "../db/schema.js";

export async function notifyLogFile(
  filePath: string,
  results: unknown[]
): Promise<void> {
  const lines = results.map((result) => JSON.stringify(result)).join("\n");

  return writeIntoLogFile(filePath, lines);
}

async function writeIntoLogFile(filePath: string, data: string): Promise<void> {
  const logFile = path.resolve(dataDirPath, filePath);
  const resolvedDataDir = path.resolve(dataDirPath);

  if (!logFile.startsWith(resolvedDataDir + path.sep)) {
    throw new Error(`Invalid file path: ${filePath} escapes data directory`);
  }

  return fs.appendFile(logFile, data, "utf-8");
}
