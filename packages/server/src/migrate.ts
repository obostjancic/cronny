import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || ".data/db.sqlite";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Run migrations
migrate(db, {
  migrationsFolder: path.join(__dirname, "../drizzle"),
});

console.log("Migrations completed successfully");
sqlite.close();
