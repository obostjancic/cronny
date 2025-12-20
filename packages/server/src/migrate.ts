import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new Database(
  process.env.DATABASE_PATH || ".data/db.sqlite"
);
const db = drizzle(sqlite);

// Run migrations
migrate(db, {
  migrationsFolder: path.join(__dirname, "../drizzle"),
});

console.log("Migrations completed successfully");
sqlite.close();
