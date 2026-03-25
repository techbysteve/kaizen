import { sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
	id: text("id").primaryKey(),
	username: text("username").notNull().default(""),
	profilePhotoDataUrl: text("profile_photo_data_url"),
	isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
	onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	deletedAt: text("deleted_at"),
});

export const extractedArticlesTable = sqliteTable(
	"extracted_articles",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		url: text("url").notNull(),
		title: text("title"),
		author: text("author"),
		description: text("description"),
		publishedDate: text("published_date"),
		content: text("content").notNull(),
		imageUrl: text("image_url"),
		readTimeMinutes: integer("read_time_minutes").notNull().default(0),
		readStatus: integer("read_status", { mode: "boolean" })
			.notNull()
			.default(false),
		isFavorite: integer("is_favorite", { mode: "boolean" })
			.notNull()
			.default(false),
		isArchived: integer("is_archived", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		uniqueIndex("extracted_articles_user_url_uidx").on(table.userId, table.url),
		index("extracted_articles_user_created_at_desc_idx").on(
			table.userId,
			sql`${table.createdAt} DESC`,
		),
		index("extracted_articles_user_read_status_created_at_idx").on(
			table.userId,
			table.readStatus,
			sql`${table.createdAt} DESC`,
		),
		index("extracted_articles_user_favorite_created_at_idx")
			.on(table.userId, sql`${table.createdAt} DESC`)
			.where(sql`${table.isFavorite} = 1`),
		index("extracted_articles_user_archived_created_at_idx")
			.on(table.userId, sql`${table.createdAt} DESC`)
			.where(sql`${table.isArchived} = 1`),
	],
);

export const tagsTable = sqliteTable(
	"tags",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		nameNormalized: text("name_normalized").notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		uniqueIndex("tags_user_name_normalized_uidx").on(
			table.userId,
			table.nameNormalized,
		),
		index("tags_user_id_idx").on(table.userId),
	],
);

export const articleTagsTable = sqliteTable(
	"article_tags",
	{
		articleId: integer("article_id")
			.notNull()
			.references(() => extractedArticlesTable.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tagsTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		primaryKey({
			columns: [table.articleId, table.tagId, table.userId],
		}),
		index("article_tags_article_id_user_id_idx").on(table.articleId, table.userId),
		index("article_tags_tag_id_user_id_idx").on(table.tagId, table.userId),
	],
);

export const settingsTable = sqliteTable(
	"settings",
	{
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		key: text("key").notNull(),
		value: text("value"),
	},
	(table) => [
		primaryKey({
			columns: [table.userId, table.key],
		}),
	],
);

export const schema = {
	usersTable,
	extractedArticlesTable,
	tagsTable,
	articleTagsTable,
	settingsTable,
};
