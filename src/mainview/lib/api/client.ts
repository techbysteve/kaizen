/**
 * RPC client for webview-to-main process communication.
 */

import Electrobun, { Electroview } from "electrobun/view";
import type {
	KaizenRPCSchema,
	Article,
	Tag,
	User,
	Settings,
} from "../../../types/rpc";

export type { Article, Tag, User, Settings };

const RPC_MAX_REQUEST_TIME_MS = 120_000;

const rpc = Electroview.defineRPC<KaizenRPCSchema>({
	maxRequestTime: RPC_MAX_REQUEST_TIME_MS,
	handlers: {
		requests: {},
		messages: {},
	},
});

const electrobun = new Electrobun.Electroview({ rpc });

export const apiClient = {
	articles: {
		list: (params?: {
			page?: number;
			perPage?: number;
			search?: string;
			filter?: "all" | "read" | "unread";
		}) => electrobun.rpc?.request["articles:list"](params ?? {}),
		get: (id: number) => electrobun.rpc?.request["articles:get"]({ id }),
		create: (url: string) =>
			electrobun.rpc?.request["articles:create"]({ url }),
		delete: (id: number) => electrobun.rpc?.request["articles:delete"]({ id }),
		toggleRead: (id: number) =>
			electrobun.rpc?.request["articles:toggleRead"]({ id }),
		toggleFavorite: (id: number) =>
			electrobun.rpc?.request["articles:toggleFavorite"]({ id }),
		toggleArchived: (id: number) =>
			electrobun.rpc?.request["articles:toggleArchived"]({ id }),
		favorites: (params?: {
			page?: number;
			perPage?: number;
			search?: string;
		}) => electrobun.rpc?.request["articles:favorites"](params ?? {}),
		archived: (params?: { page?: number; perPage?: number; search?: string }) =>
			electrobun.rpc?.request["articles:archived"](params ?? {}),
		byTag: (tagId: number, params?: { page?: number; perPage?: number }) =>
			electrobun.rpc?.request["articles:byTag"]({ tagId, ...params }),
	},
	tags: {
		list: () =>
			electrobun.rpc?.request["tags:list"]({} as Record<string, never>),
		create: (name: string) => electrobun.rpc?.request["tags:create"]({ name }),
		delete: (id: number) => electrobun.rpc?.request["tags:delete"]({ id }),
		linkArticle: (articleId: number, tagId: number) =>
			electrobun.rpc?.request["tags:linkArticle"]({ articleId, tagId }),
		unlinkArticle: (articleId: number, tagId: number) =>
			electrobun.rpc?.request["tags:unlinkArticle"]({ articleId, tagId }),
		unlinkAllFromArticle: (articleId: number) =>
			electrobun.rpc?.request["tags:unlinkAllFromArticle"]({ articleId }),
	},
	users: {
		getCurrent: () =>
			electrobun.rpc?.request["users:getCurrent"]({} as Record<string, never>),
		list: () =>
			electrobun.rpc?.request["users:list"]({} as Record<string, never>),
		create: (
			params: Partial<
				Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
			>,
		) => electrobun.rpc?.request["users:create"](params),
		switch: (userId: string) => electrobun.rpc?.request["users:switch"]({ userId }),
		delete: (userId: string) => electrobun.rpc?.request["users:delete"]({ userId }),
		updateCurrent: (
			params: Partial<
				Pick<User, "username" | "profilePhotoDataUrl" | "onboardingCompleted">
			>,
		) => electrobun.rpc?.request["users:updateCurrent"](params),
	},
	settings: {
		get: () =>
			electrobun.rpc?.request["settings:get"]({} as Record<string, never>),
		update: (params: Partial<Settings>) =>
			electrobun.rpc?.request["settings:update"](params),
	},
	system: {
		crawl4aiStatus: () =>
			electrobun.rpc?.request["system:crawl4aiStatus"](
				{} as Record<string, never>,
			),
		health: () =>
			electrobun.rpc?.request["system:health"]({} as Record<string, never>),
		openExternal: (url: string) =>
			electrobun.rpc?.request["system:openExternal"]({ url }),
	},
};
