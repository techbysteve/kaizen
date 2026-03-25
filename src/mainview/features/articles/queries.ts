import { useQuery } from "@tanstack/react-query";
import { decodeId } from "@/lib/utils";
import { articlesApi } from "./api";
import { toArticleListItem, toViewArticle } from "./mappers";
import type { ArticleListItem, PaginationMeta } from "./types";

export const articleKeys = {
	all: ["articles"] as const,
	lists: () => [...articleKeys.all, "list"] as const,
	list: (params: {
		filter?: "all" | "read" | "unread" | "favorites" | "archived";
		tagId?: number;
		page?: number;
		perPage?: number;
		search?: string;
	}) => [...articleKeys.lists(), params] as const,
	details: () => [...articleKeys.all, "detail"] as const,
	detail: (id: number) => [...articleKeys.details(), id] as const,
};

export function useArticlesList(params?: {
	filter?: "all" | "read" | "unread" | "favorites" | "archived";
	tagId?: number;
	page?: number;
	perPage?: number;
	search?: string;
}) {
	const {
		filter = "all",
		page = 1,
		perPage = 20,
		search,
		tagId,
	} = params ?? {};

	return useQuery({
		queryKey: articleKeys.list({ filter, page, perPage, search, tagId }),
		queryFn: async () => {
			let result: Awaited<ReturnType<typeof articlesApi.list>>;

			if (tagId !== undefined) {
				result = await articlesApi.byTag(tagId, { page, perPage });
			} else if (filter === "favorites") {
				result = await articlesApi.favorites({ page, perPage, search });
			} else if (filter === "archived") {
				result = await articlesApi.archived({ page, perPage, search });
			} else {
				result = await articlesApi.list({ page, perPage, filter, search });
			}

			if (!result) {
				throw new Error("Failed to fetch articles");
			}

			return {
				articles: result.articles.map(toArticleListItem),
				pagination: result.pagination,
			} as { articles: ArticleListItem[]; pagination: PaginationMeta };
		},
		staleTime: 2 * 60 * 1000,
	});
}

export function useArticle(id: string) {
	const numericId = Number(decodeId(id)) 
	return useQuery({
		queryKey: articleKeys.detail(numericId ?? 0),
		queryFn: async () => {
			const result = await articlesApi.get(numericId);
			if (!result) {
				throw new Error("Article not found");
			}
			return toViewArticle(result);
		},
		enabled: numericId !== undefined && !Number.isNaN(numericId),
		staleTime: 5 * 60 * 1000,
	});
}
