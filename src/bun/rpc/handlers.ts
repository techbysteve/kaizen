/**
 * RPC handlers for communication between main process and webview
 */

import { articles, tags, settings, users, type Settings } from "../database/db";
import { extractArticle } from "../extraction/extractor";
import { checkCrawl4AIHealth, getCrawl4AIStatus } from "../extraction/crawl4ai";
import { Utils } from "electrobun/bun";

// Define all RPC handlers
export const rpcHandlers = {
	// ===== Articles =====
	"articles:list": async (params: {
		page?: number;
		perPage?: number;
		search?: string;
		filter?: "all" | "read" | "unread";
	}) => {
		return articles.list(params);
	},

	"articles:get": async (params: { id: number }) => {
		const article = articles.getById(params.id);
		if (!article) throw new Error("Article not found");
		return article;
	},

	"articles:create": async (params: { url: string }) => {
		// Check if article already exists
		const existing = articles.getByUrl(params.url);
		if (existing) {
			throw new Error("Article already exists in your library");
		}

		// Extract article content
		const extracted = await extractArticle(params.url);

		// Save to database
		return articles.create({
			url: extracted.url,
			title: extracted.title,
			author: extracted.author,
			description: extracted.description,
			publishedDate: extracted.publishedDate,
			content: extracted.content,
			imageUrl: extracted.imageUrl,
			readTimeMinutes: extracted.readTimeMinutes,
			readStatus: false,
			isFavorite: false,
			isArchived: false,
		});
	},

	"articles:delete": async (params: { id: number }) => {
		const success = articles.delete(params.id);
		if (!success) throw new Error("Failed to delete article");
		return { success: true };
	},

	"articles:toggleRead": async (params: { id: number }) => {
		const success = articles.toggleRead(params.id);
		if (!success) throw new Error("Failed to toggle read status");
		return { success: true };
	},

	"articles:toggleFavorite": async (params: { id: number }) => {
		const success = articles.toggleFavorite(params.id);
		if (!success) throw new Error("Failed to toggle favorite status");
		return { success: true };
	},

	"articles:toggleArchived": async (params: { id: number }) => {
		const success = articles.toggleArchived(params.id);
		if (!success) throw new Error("Failed to toggle archived status");
		return { success: true };
	},

	"articles:favorites": async (params: {
		page?: number;
		perPage?: number;
		search?: string;
	}) => {
		return articles.getFavorites(params);
	},

	"articles:archived": async (params: {
		page?: number;
		perPage?: number;
		search?: string;
	}) => {
		return articles.getArchived(params);
	},

	"articles:byTag": async (params: {
		tagId: number;
		page?: number;
		perPage?: number;
	}) => {
		return articles.getByTag(params.tagId, params);
	},

	// ===== Tags =====
	"tags:list": async () => {
		return tags.list();
	},

	"tags:create": async (params: { name: string }) => {
		// Check if tag already exists
		const existing = tags.getByName(params.name);
		if (existing) return existing;
		return tags.create(params.name);
	},

	"tags:delete": async (params: { id: number }) => {
		const success = tags.delete(params.id);
		if (!success) throw new Error("Failed to delete tag");
		return { success: true };
	},

	"tags:linkArticle": async (params: { articleId: number; tagId: number }) => {
		const success = tags.linkArticle(params.articleId, params.tagId);
		if (!success) throw new Error("Failed to link tag to article");
		return { success: true };
	},

	"tags:unlinkArticle": async (params: {
		articleId: number;
		tagId: number;
	}) => {
		const success = tags.unlinkArticle(params.articleId, params.tagId);
		if (!success) throw new Error("Failed to unlink tag from article");
		return { success: true };
	},

	"tags:unlinkAllFromArticle": async (params: { articleId: number }) => {
		tags.unlinkAllFromArticle(params.articleId);
		return { success: true };
	},

	// ===== Users =====
	"users:getCurrent": async () => {
		return users.getCurrent();
	},

	"users:list": async () => {
		return users.list();
	},

	"users:create": async (params: {
		username?: string;
		profilePhotoDataUrl?: string | null;
		onboardingCompleted?: boolean;
	}) => {
		return users.create(params);
	},

	"users:switch": async (params: { userId: string }) => {
		return users.switch(params.userId);
	},

	"users:delete": async (params: { userId: string }) => {
		return users.delete(params.userId);
	},

	"users:updateCurrent": async (params: {
		username?: string;
		profilePhotoDataUrl?: string | null;
		onboardingCompleted?: boolean;
	}) => {
		return users.updateCurrent(params);
	},

	// ===== Settings =====
	"settings:get": async () => {
		return settings.get();
	},

	"settings:update": async (params: Partial<Settings>) => {
		return settings.update(params);
	},

	// ===== System =====
	"system:crawl4aiStatus": async () => {
		const appSettings = settings.get();
		const status = getCrawl4AIStatus(appSettings.crawl4aiUrl);
		const available = await checkCrawl4AIHealth(status.url);
		return {
			...status,
			available,
		};
	},

	"system:health": async () => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	},

	"system:openExternal": async (params: { url: string }) => {
		let parsedUrl: URL;

		try {
			parsedUrl = new URL(params.url);
		} catch {
			throw new Error("Invalid URL");
		}

		const allowedProtocols = new Set(["http:", "https:", "mailto:"]);
		if (!allowedProtocols.has(parsedUrl.protocol)) {
			throw new Error("Unsupported external URL protocol");
		}

		const success = Utils.openExternal(parsedUrl.toString());
		if (!success) {
			throw new Error("Failed to open external URL");
		}

		return { success: true };
	},
} as const;
