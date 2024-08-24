import { dataDirPath } from "../db/schema";
import { promises as fs } from "fs";
import path from "path";

export async function notifyLogFile(
  filePath: string,
  results: unknown[]
): Promise<void> {
  const lines = results.map((result) => JSON.stringify(result)).join("\n");

  return writeIntoLogFile(filePath, lines);
}

async function writeIntoLogFile(filePath: string, data: string): Promise<void> {
  const logFile = path.join(dataDirPath, filePath);

  return fs.appendFile(logFile, data, "utf-8");
}
