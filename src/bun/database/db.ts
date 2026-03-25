/**
 * SQLite database layer for Kaizen desktop app
 * Phase 2: PostgreSQL -> SQLite migration with user-scoped local data.
 */

import { count, eq, and, desc, sql, asc } from "drizzle-orm";
import { join } from "node:path";
import type { Article, Settings, Tag, User } from "../../types/types";
import { db as drizzleDb } from "./client";
import {
	articleTagsTable,
	extractedArticlesTable,
	settingsTable,
	tagsTable,
	usersTable,
} from "./schema";

const DB_PATH = join(import.meta.dir, "..", "..", "..", "kaizen.db");
const LOCAL_USER_ID = "local-user";

export const defaultSettings: Settings = {
	fontFamily: "sans",
	fontSize: 100,
	marginWidth: "medium",
	theme: "system",
	crawl4aiUrl: "http://localhost:11235",
};

function mapArticle(row: typeof extractedArticlesTable.$inferSelect): Article {
	return {
		id: row.id,
		userId: row.userId,
		url: row.url,
		title: row.title,
		author: row.author,
		description: row.description,
		publishedDate: row.publishedDate,
		content: row.content,
		imageUrl: row.imageUrl,
		readTimeMinutes: row.readTimeMinutes,
		readStatus: row.readStatus,
		isFavorite: row.isFavorite,
		isArchived: row.isArchived,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

function mapTag(row: {
	id: number;
	userId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	articleCount?: number;
}): Tag {
	return {
		id: row.id,
		userId: row.userId,
		name: row.name,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		articleCount: row.articleCount,
	};
}

function paginate(total: number, page: number, perPage: number) {
	return {
		total,
		page,
		perPage,
		totalPages: Math.max(1, Math.ceil(total / perPage)),
	};
}

function getCurrentUserId() {
	return findCurrentUser()?.id ?? LOCAL_USER_ID;
}

function buildArticleSearchCondition(search?: string) {
	if (!search?.trim()) {
		return undefined;
	}
	const term = `%${search.trim().toLowerCase()}%`;
	return sql`(
		lower(coalesce(${extractedArticlesTable.title}, '')) like ${term}
		or lower(coalesce(${extractedArticlesTable.author}, '')) like ${term}
		or lower(coalesce(${extractedArticlesTable.description}, '')) like ${term}
	)`;
}

function attachTagsToArticles(result: Article[]) {
	for (const article of result) {
		article.tags = tags.getByArticleId(article.id);
	}
	return result;
}

function findCurrentUser() {
	const currentUser =
		drizzleDb
			.select()
			.from(usersTable)
			.where(
				and(
					sql`${usersTable.deletedAt} is null`,
					eq(usersTable.isCurrent, true),
				),
			)
			.get() ?? null;

	if (currentUser) {
		return currentUser;
	}

	const fallbackUser =
		drizzleDb
			.select()
			.from(usersTable)
			.where(sql`${usersTable.deletedAt} is null`)
			.orderBy(asc(usersTable.createdAt))
			.get() ?? null;

	if (fallbackUser) {
		drizzleDb
			.update(usersTable)
			.set({ isCurrent: true, updatedAt: sql`datetime('now')` })
			.where(eq(usersTable.id, fallbackUser.id))
			.run();
	}

	return fallbackUser;
}

function mapUser(row: typeof usersTable.$inferSelect): User {
	return {
		id: String(row.id),
		username: String(row.username),
		profilePhotoDataUrl:
			row.profilePhotoDataUrl == null ? null : String(row.profilePhotoDataUrl),
		isCurrent: row.isCurrent,
		onboardingCompleted: row.onboardingCompleted,
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
		deletedAt: row.deletedAt == null ? null : String(row.deletedAt),
	};
}

function setCurrentUser(userId: string) {
	drizzleDb
		.update(usersTable)
		.set({ isCurrent: false, updatedAt: sql`datetime('now')` })
		.where(sql`${usersTable.deletedAt} is null`)
		.run();

	drizzleDb
		.update(usersTable)
		.set({ isCurrent: true, updatedAt: sql`datetime('now')` })
		.where(
			and(eq(usersTable.id, userId), sql`${usersTable.deletedAt} is null`),
		)
		.run();
}

function findNextAvailableUser(excludeUserId?: string) {
	const conditions = [sql`${usersTable.deletedAt} is null`];
	if (excludeUserId) {
		conditions.push(sql`${usersTable.id} != ${excludeUserId}`);
	}

	return (
		drizzleDb
			.select()
			.from(usersTable)
			.where(and(...conditions))
			.orderBy(asc(usersTable.createdAt))
			.get() ?? null
	);
}

export const users = {
	list: (): User[] => {
		const rows = drizzleDb
			.select()
			.from(usersTable)
			.where(sql`${usersTable.deletedAt} is null`)
			.orderBy(desc(usersTable.isCurrent), asc(usersTable.createdAt))
			.all();
		return rows.map(mapUser);
	},

	getCurrent: (): User | null => {
		const user = findCurrentUser();
		return user ? mapUser(user) : null;
	},

	create: (
		updates: Partial<
			Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
		> = {},
	): User => {
		const userId = crypto.randomUUID();

		drizzleDb
			.insert(usersTable)
			.values({
				id: userId,
				username: updates.username ?? "",
				profilePhotoDataUrl: updates.profilePhotoDataUrl ?? null,
				isCurrent: false,
				onboardingCompleted: updates.onboardingCompleted ?? false,
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.run();

		setCurrentUser(userId);

		const user = users.getCurrent();
		if (!user) throw new Error("Failed to load created user");
		return user;
	},

	switch: (userId: string): User => {
		const targetUser = drizzleDb
			.select({ id: usersTable.id })
			.from(usersTable)
			.where(
				and(eq(usersTable.id, userId), sql`${usersTable.deletedAt} is null`),
			)
			.get();

		if (!targetUser) {
			throw new Error("User not found");
		}

		setCurrentUser(userId);

		const user = users.getCurrent();
		if (!user) throw new Error("Failed to load switched user");
		return user;
	},

	delete: (userId: string): { success: boolean; currentUser: User | null } => {
		const targetUser = drizzleDb
			.select({ id: usersTable.id, isCurrent: usersTable.isCurrent })
			.from(usersTable)
			.where(
				and(eq(usersTable.id, userId), sql`${usersTable.deletedAt} is null`),
			)
			.get();

		if (!targetUser) {
			throw new Error("User not found");
		}

		drizzleDb.delete(usersTable).where(eq(usersTable.id, userId)).run();

		if (targetUser.isCurrent) {
			const nextUser = findNextAvailableUser(userId);
			if (nextUser) {
				setCurrentUser(nextUser.id);
			}
		}

		return {
			success: true,
			currentUser: users.getCurrent(),
		};
	},

	updateCurrent: (
		updates: Partial<
			Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
		>,
	): User => {
		const currentUser = findCurrentUser();

		if (currentUser) {
			const userUpdates: Partial<typeof usersTable.$inferInsert> = {};
			if (updates.username !== undefined)
				userUpdates.username = updates.username;
			if (updates.profilePhotoDataUrl !== undefined) {
				userUpdates.profilePhotoDataUrl = updates.profilePhotoDataUrl;
			}
			if (updates.onboardingCompleted !== undefined) {
				userUpdates.onboardingCompleted = updates.onboardingCompleted;
			}

			drizzleDb
				.update(usersTable)
				.set({ ...userUpdates, updatedAt: sql`datetime('now')` })
				.where(eq(usersTable.id, currentUser.id))
				.run();
		} else {
			return users.create(updates);
		}

		const user = users.getCurrent();
		if (!user) throw new Error("Failed to load user after update");
		return user;
	},
};

export const articles = {
	list: (options?: {
		page?: number;
		perPage?: number;
		search?: string;
		filter?: "all" | "read" | "unread";
	}) => {
		const userId = getCurrentUserId();
		const page = options?.page ?? 1;
		const perPage = options?.perPage ?? 20;
		const offset = (page - 1) * perPage;
		const conditions = [
			eq(extractedArticlesTable.userId, userId),
			eq(extractedArticlesTable.isArchived, false),
		];

		if (options?.filter === "read") {
			conditions.push(eq(extractedArticlesTable.readStatus, true));
		} else if (options?.filter === "unread") {
			conditions.push(eq(extractedArticlesTable.readStatus, false));
		}

		const searchCondition = buildArticleSearchCondition(options?.search);
		if (searchCondition) {
			conditions.push(searchCondition);
		}

		const where = and(...conditions);
		const total =
			drizzleDb
				.select({ total: count() })
				.from(extractedArticlesTable)
				.where(where)
				.get()?.total ?? 0;

		const rows = drizzleDb
			.select()
			.from(extractedArticlesTable)
			.where(where)
			.orderBy(desc(extractedArticlesTable.createdAt))
			.limit(perPage)
			.offset(offset)
			.all();

		return {
			articles: attachTagsToArticles(rows.map(mapArticle)),
			pagination: paginate(total, page, perPage),
		};
	},

	getById: (id: number): Article | null => {
		const row = drizzleDb
			.select()
			.from(extractedArticlesTable)
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.get();
		if (!row) return null;
		const article = mapArticle(row);
		article.tags = tags.getByArticleId(article.id);
		return article;
	},

	getByUrl: (url: string): Article | null => {
		const row = drizzleDb
			.select()
			.from(extractedArticlesTable)
			.where(
				and(
					eq(extractedArticlesTable.url, url),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.get();
		return row ? mapArticle(row) : null;
	},

	create: (
		article: Omit<Article, "id" | "createdAt" | "updatedAt" | "userId">,
	): Article => {
		const userId = getCurrentUserId();
		const result = drizzleDb
			.insert(extractedArticlesTable)
			.values({
				userId,
				url: article.url,
				title: article.title,
				author: article.author,
				description: article.description,
				publishedDate: article.publishedDate,
				content: article.content ?? "",
				imageUrl: article.imageUrl,
				readTimeMinutes: article.readTimeMinutes,
				readStatus: article.readStatus,
				isFavorite: article.isFavorite,
				isArchived: article.isArchived,
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.returning({ id: extractedArticlesTable.id })
			.get();
		const createdArticle = articles.getById(Number(result?.id));
		if (!createdArticle) {
			throw new Error("Failed to load created article");
		}
		return createdArticle;
	},

	update: (id: number, updates: Partial<Article>): Article | null => {
		const updateData: Partial<typeof extractedArticlesTable.$inferInsert> = {};

		if (updates.url !== undefined) updateData.url = updates.url;
		if (updates.title !== undefined) updateData.title = updates.title;
		if (updates.author !== undefined) updateData.author = updates.author;
		if (updates.description !== undefined)
			updateData.description = updates.description;
		if (updates.publishedDate !== undefined)
			updateData.publishedDate = updates.publishedDate;
		if (updates.content !== undefined)
			updateData.content = updates.content ?? "";
		if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
		if (updates.readTimeMinutes !== undefined)
			updateData.readTimeMinutes = updates.readTimeMinutes;
		if (updates.readStatus !== undefined)
			updateData.readStatus = updates.readStatus;
		if (updates.isFavorite !== undefined)
			updateData.isFavorite = updates.isFavorite;
		if (updates.isArchived !== undefined)
			updateData.isArchived = updates.isArchived;

		if (Object.keys(updateData).length === 0) return articles.getById(id);

		drizzleDb
			.update(extractedArticlesTable)
			.set({ ...updateData, updatedAt: sql`datetime('now')` })
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return articles.getById(id);
	},

	delete: (id: number): boolean => {
		const existingArticle = articles.getById(id);
		if (!existingArticle) return false;
		drizzleDb
			.delete(extractedArticlesTable)
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},

	toggleRead: (id: number): boolean => {
		const article = articles.getById(id);
		if (!article) return false;
		drizzleDb
			.update(extractedArticlesTable)
			.set({
				readStatus: !article.readStatus,
				updatedAt: sql`datetime('now')`,
			})
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},

	toggleFavorite: (id: number): boolean => {
		const article = articles.getById(id);
		if (!article) return false;
		drizzleDb
			.update(extractedArticlesTable)
			.set({
				isFavorite: !article.isFavorite,
				updatedAt: sql`datetime('now')`,
			})
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},

	toggleArchived: (id: number): boolean => {
		const article = articles.getById(id);
		if (!article) return false;
		drizzleDb
			.update(extractedArticlesTable)
			.set({
				isArchived: !article.isArchived,
				updatedAt: sql`datetime('now')`,
			})
			.where(
				and(
					eq(extractedArticlesTable.id, id),
					eq(extractedArticlesTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},

	getFavorites: (options?: {
		page?: number;
		perPage?: number;
		search?: string;
	}) => {
		const userId = getCurrentUserId();
		const page = options?.page ?? 1;
		const perPage = options?.perPage ?? 20;
		const offset = (page - 1) * perPage;
		const conditions = [
			eq(extractedArticlesTable.userId, userId),
			eq(extractedArticlesTable.isFavorite, true),
			eq(extractedArticlesTable.isArchived, false),
		];
		const searchCondition = buildArticleSearchCondition(options?.search);
		if (searchCondition) conditions.push(searchCondition);
		const where = and(...conditions);

		const total =
			drizzleDb
				.select({ total: count() })
				.from(extractedArticlesTable)
				.where(where)
				.get()?.total ?? 0;

		const rows = drizzleDb
			.select()
			.from(extractedArticlesTable)
			.where(where)
			.orderBy(desc(extractedArticlesTable.createdAt))
			.limit(perPage)
			.offset(offset)
			.all();

		return {
			articles: attachTagsToArticles(rows.map(mapArticle)),
			pagination: paginate(total, page, perPage),
		};
	},

	getArchived: (options?: {
		page?: number;
		perPage?: number;
		search?: string;
	}) => {
		const userId = getCurrentUserId();
		const page = options?.page ?? 1;
		const perPage = options?.perPage ?? 20;
		const offset = (page - 1) * perPage;
		const conditions = [
			eq(extractedArticlesTable.userId, userId),
			eq(extractedArticlesTable.isArchived, true),
		];
		const searchCondition = buildArticleSearchCondition(options?.search);
		if (searchCondition) conditions.push(searchCondition);
		const where = and(...conditions);

		const total =
			drizzleDb
				.select({ total: count() })
				.from(extractedArticlesTable)
				.where(where)
				.get()?.total ?? 0;

		const rows = drizzleDb
			.select()
			.from(extractedArticlesTable)
			.where(where)
			.orderBy(desc(extractedArticlesTable.createdAt))
			.limit(perPage)
			.offset(offset)
			.all();

		return {
			articles: attachTagsToArticles(rows.map(mapArticle)),
			pagination: paginate(total, page, perPage),
		};
	},

	getByTag: (
		tagId: number,
		options?: { page?: number; perPage?: number; search?: string },
	) => {
		const userId = getCurrentUserId();
		const page = options?.page ?? 1;
		const perPage = options?.perPage ?? 20;
		const offset = (page - 1) * perPage;
		const conditions = [
			eq(articleTagsTable.tagId, tagId),
			eq(extractedArticlesTable.userId, userId),
			eq(extractedArticlesTable.isArchived, false),
		];
		const searchCondition = buildArticleSearchCondition(options?.search);
		if (searchCondition) conditions.push(searchCondition);
		const where = and(...conditions);

		const total =
			drizzleDb
				.select({ total: count() })
				.from(extractedArticlesTable)
				.innerJoin(
					articleTagsTable,
					and(
						eq(extractedArticlesTable.id, articleTagsTable.articleId),
						eq(extractedArticlesTable.userId, articleTagsTable.userId),
					),
				)
				.where(where)
				.get()?.total ?? 0;

		const rows = drizzleDb
			.select({ article: extractedArticlesTable })
			.from(extractedArticlesTable)
			.innerJoin(
				articleTagsTable,
				and(
					eq(extractedArticlesTable.id, articleTagsTable.articleId),
					eq(extractedArticlesTable.userId, articleTagsTable.userId),
				),
			)
			.where(where)
			.orderBy(desc(extractedArticlesTable.createdAt))
			.limit(perPage)
			.offset(offset)
			.all();

		return {
			articles: attachTagsToArticles(
				rows.map((row) => mapArticle(row.article)),
			),
			pagination: paginate(total, page, perPage),
		};
	},
};

export const tags = {
	list: (): Tag[] => {
		const rows = drizzleDb
			.select({
				id: tagsTable.id,
				userId: tagsTable.userId,
				name: tagsTable.name,
				createdAt: tagsTable.createdAt,
				updatedAt: tagsTable.updatedAt,
				articleCount: sql<number>`count(case when ${extractedArticlesTable.isArchived} = 0 then ${articleTagsTable.articleId} end)`,
			})
			.from(tagsTable)
			.leftJoin(
				articleTagsTable,
				and(
					eq(tagsTable.id, articleTagsTable.tagId),
					eq(tagsTable.userId, articleTagsTable.userId),
				),
			)
			.leftJoin(
				extractedArticlesTable,
				and(
					eq(extractedArticlesTable.id, articleTagsTable.articleId),
					eq(extractedArticlesTable.userId, articleTagsTable.userId),
				),
			)
			.where(eq(tagsTable.userId, getCurrentUserId()))
			.groupBy(
				tagsTable.id,
				tagsTable.userId,
				tagsTable.name,
				tagsTable.createdAt,
				tagsTable.updatedAt,
			)
			.orderBy(asc(tagsTable.name))
			.all();
		return rows.map(mapTag);
	},

	getById: (id: number): Tag | null => {
		const row = drizzleDb
			.select({
				id: tagsTable.id,
				userId: tagsTable.userId,
				name: tagsTable.name,
				createdAt: tagsTable.createdAt,
				updatedAt: tagsTable.updatedAt,
			})
			.from(tagsTable)
			.where(
				and(eq(tagsTable.id, id), eq(tagsTable.userId, getCurrentUserId())),
			)
			.get();
		return row ? mapTag(row) : null;
	},

	getByName: (name: string): Tag | null => {
		const row = drizzleDb
			.select({
				id: tagsTable.id,
				userId: tagsTable.userId,
				name: tagsTable.name,
				createdAt: tagsTable.createdAt,
				updatedAt: tagsTable.updatedAt,
			})
			.from(tagsTable)
			.where(
				and(
					eq(tagsTable.userId, getCurrentUserId()),
					eq(tagsTable.nameNormalized, name.trim().toLowerCase()),
				),
			)
			.get();
		return row ? mapTag(row) : null;
	},

	getByArticleId: (articleId: number): Tag[] => {
		const rows = drizzleDb
			.select({
				id: tagsTable.id,
				userId: tagsTable.userId,
				name: tagsTable.name,
				createdAt: tagsTable.createdAt,
				updatedAt: tagsTable.updatedAt,
			})
			.from(tagsTable)
			.innerJoin(
				articleTagsTable,
				and(
					eq(tagsTable.id, articleTagsTable.tagId),
					eq(tagsTable.userId, articleTagsTable.userId),
				),
			)
			.where(
				and(
					eq(articleTagsTable.articleId, articleId),
					eq(articleTagsTable.userId, getCurrentUserId()),
				),
			)
			.orderBy(asc(tagsTable.name))
			.all();
		return rows.map(mapTag);
	},

	create: (name: string): Tag => {
		const trimmed = name.trim();
		const result = drizzleDb
			.insert(tagsTable)
			.values({
				userId: getCurrentUserId(),
				name: trimmed,
				nameNormalized: trimmed.toLowerCase(),
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.returning({ id: tagsTable.id })
			.get();
		const createdTag = tags.getById(Number(result?.id));
		if (!createdTag) {
			throw new Error("Failed to load created tag");
		}
		return createdTag;
	},

	delete: (id: number): boolean => {
		const existingTag = tags.getById(id);
		if (!existingTag) return false;
		drizzleDb
			.delete(tagsTable)
			.where(
				and(eq(tagsTable.id, id), eq(tagsTable.userId, getCurrentUserId())),
			)
			.run();
		return true;
	},

	linkArticle: (articleId: number, tagId: number): boolean => {
		try {
			drizzleDb
				.insert(articleTagsTable)
				.values({
					articleId,
					tagId,
					userId: getCurrentUserId(),
					createdAt: sql`datetime('now')`,
				})
				.onConflictDoNothing()
				.run();
			return true;
		} catch {
			return false;
		}
	},

	unlinkArticle: (articleId: number, tagId: number): boolean => {
		const existingLink = drizzleDb
			.select({ articleId: articleTagsTable.articleId })
			.from(articleTagsTable)
			.where(
				and(
					eq(articleTagsTable.articleId, articleId),
					eq(articleTagsTable.tagId, tagId),
					eq(articleTagsTable.userId, getCurrentUserId()),
				),
			)
			.get();
		if (!existingLink) return false;
		drizzleDb
			.delete(articleTagsTable)
			.where(
				and(
					eq(articleTagsTable.articleId, articleId),
					eq(articleTagsTable.tagId, tagId),
					eq(articleTagsTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},

	unlinkAllFromArticle: (articleId: number): boolean => {
		drizzleDb
			.delete(articleTagsTable)
			.where(
				and(
					eq(articleTagsTable.articleId, articleId),
					eq(articleTagsTable.userId, getCurrentUserId()),
				),
			)
			.run();
		return true;
	},
};

export const settings = {
	get: (): Settings => {
		const currentUser = findCurrentUser();
		if (!currentUser) {
			return defaultSettings;
		}

		const rows = drizzleDb
			.select({ key: settingsTable.key, value: settingsTable.value })
			.from(settingsTable)
			.where(eq(settingsTable.userId, currentUser.id))
			.all();

		const settingsValues = Object.fromEntries(
			rows.map((row) => [row.key, row.value]),
		) as Record<string, string | null>;

		const parsedFontSize = parseInt(
			settingsValues.fontSize ?? String(defaultSettings.fontSize),
			10,
		);

		const fontSize =
			Number.isFinite(parsedFontSize) &&
			parsedFontSize >= 50 &&
			parsedFontSize <= 200
				? parsedFontSize
				: defaultSettings.fontSize;

		return {
			fontFamily:
				(settingsValues.fontFamily as Settings["fontFamily"]) ??
				defaultSettings.fontFamily,
			fontSize,
			marginWidth:
				(settingsValues.marginWidth as Settings["marginWidth"]) ??
				defaultSettings.marginWidth,
			theme:
				(settingsValues.theme as Settings["theme"]) ?? defaultSettings.theme,
			crawl4aiUrl: settingsValues.crawl4aiUrl ?? defaultSettings.crawl4aiUrl,
		};
	},

	update: (updates: Partial<Settings>): Settings => {
		const currentUser = findCurrentUser();
		if (!currentUser) return defaultSettings;
		const userId = currentUser.id;

		for (const [key, value] of Object.entries(updates)) {
			if (value === undefined) continue;
			drizzleDb
				.insert(settingsTable)
				.values({ userId, key, value: String(value) })
				.onConflictDoUpdate({
					target: [settingsTable.userId, settingsTable.key],
					set: { value: String(value) },
				})
				.run();
		}
		return settings.get();
	},
};

export const metadata = {
	databasePath: DB_PATH,
	currentUserId: getCurrentUserId,
};

export { drizzleDb as db, LOCAL_USER_ID };
export type { Article, Settings, Tag, User };
