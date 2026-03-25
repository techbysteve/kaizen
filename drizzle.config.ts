import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/bun/database/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "./kaizen.db",
	},
});
