import fs from "fs";

// Ensure the .data directory exists before any tests run
const dataDirPath = "./.data";
if (!fs.existsSync(dataDirPath)) {
  fs.mkdirSync(dataDirPath, { recursive: true });
}
