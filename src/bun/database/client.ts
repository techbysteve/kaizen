import { existsSync } from "node:fs";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { join } from "node:path";
import { schema } from "./schema";

export const DB_PATH = join(import.meta.dir, "..", "..", "..", "kaizen.db");

function resolveDrizzleMigrationsPath() {
	const candidatePaths = [
		join(import.meta.dir, "..", "drizzle"),
		join(import.meta.dir, "..", "..", "drizzle"),
		join(import.meta.dir, "..", "..", "..", "drizzle"),
	];

	for (const candidatePath of candidatePaths) {
		if (existsSync(candidatePath)) {
			return candidatePath;
		}
	}

	return candidatePaths[0];
}

export const DRIZZLE_MIGRATIONS_PATH = resolveDrizzleMigrationsPath();

export const sqlite = new Database(DB_PATH, { create: true });

sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA foreign_keys = ON");
sqlite.run("PRAGMA synchronous = NORMAL");

export const db = drizzle({ client: sqlite, schema });

export function runDrizzleMigrations() {
	migrate(db, { migrationsFolder: DRIZZLE_MIGRATIONS_PATH });
}
