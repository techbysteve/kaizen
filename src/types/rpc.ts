/**
 * Shared RPC types for Kaizen
 * Used by both bun (main process) and mainview (webview)
 */
/** biome-ignore-all lint/complexity/noBannedTypes: ignored */
/** biome-ignore-all lint/suspicious/noConfusingVoidType: ignored*/

import type { Article, Settings, Tag, User } from "./types";

export type { Article, Settings, Tag, User } from "./types";

// RPC schema (webview format - no RPCSchema wrapper)
export type KaizenRPCSchema = {
	bun: {
		requests: {
			"articles:list": {
				params: {
					page?: number;
					perPage?: number;
					search?: string;
					filter?: "all" | "read" | "unread";
				};
				response: {
					articles: Article[];
					pagination: {
						total: number;
						page: number;
						perPage: number;
						totalPages: number;
					};
				};
			};
			"articles:get": {
				params: { id: number };
				response: Article;
			};
			"articles:create": {
				params: { url: string };
				response: Article;
			};
			"articles:delete": {
				params: { id: number };
				response: { success: boolean };
			};
			"articles:toggleRead": {
				params: { id: number };
				response: { success: boolean };
			};
			"articles:toggleFavorite": {
				params: { id: number };
				response: { success: boolean };
			};
			"articles:toggleArchived": {
				params: { id: number };
				response: { success: boolean };
			};
			"articles:favorites": {
				params: {
					page?: number;
					perPage?: number;
					search?: string;
				};
				response: {
					articles: Article[];
					pagination: {
						total: number;
						page: number;
						perPage: number;
						totalPages: number;
					};
				};
			};
			"articles:archived": {
				params: {
					page?: number;
					perPage?: number;
					search?: string;
				};
				response: {
					articles: Article[];
					pagination: {
						total: number;
						page: number;
						perPage: number;
						totalPages: number;
					};
				};
			};
			"articles:byTag": {
				params: {
					tagId: number;
					page?: number;
					perPage?: number;
				};
				response: {
					articles: Article[];
					pagination: {
						total: number;
						page: number;
						perPage: number;
						totalPages: number;
					};
				};
			};
			"tags:list": {
				params: {};
				response: Tag[];
			};
			"tags:create": {
				params: { name: string };
				response: Tag;
			};
			"tags:delete": {
				params: { id: number };
				response: { success: boolean };
			};
			"tags:linkArticle": {
				params: { articleId: number; tagId: number };
				response: { success: boolean };
			};
			"tags:unlinkArticle": {
				params: { articleId: number; tagId: number };
				response: { success: boolean };
			};
			"tags:unlinkAllFromArticle": {
				params: { articleId: number };
				response: { success: boolean };
			};
			"users:getCurrent": {
				params: {};
				response: User | null;
			};
			"users:list": {
				params: {};
				response: User[];
			};
			"users:create": {
				params: Partial<
					Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
				>;
				response: User;
			};
			"users:switch": {
				params: { userId: string };
				response: User;
			};
			"users:delete": {
				params: { userId: string };
				response: {
					success: boolean;
					currentUser: User | null;
				};
			};
			"users:updateCurrent": {
				params: Partial<
					Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
				>;
				response: User;
			};
			"settings:get": {
				params: {};
				response: Settings;
			};
			"settings:update": {
				params: Partial<Settings>;
				response: Settings;
			};
			"system:crawl4aiStatus": {
				params: {};
				response: {
					url: string;
					available: boolean;
				};
			};
			"system:health": {
				params: {};
				response: {
					status: string;
					timestamp: string;
				};
			};
			"system:openExternal": {
				params: {
					url: string;
				};
				response: {
					success: boolean;
				};
			};
		};
		messages: {
			logToBun: {
				params: { msg: string };

				response: void;
			};
		};
	};
	webview: {
		requests: {};
		messages: {};
	};
};
