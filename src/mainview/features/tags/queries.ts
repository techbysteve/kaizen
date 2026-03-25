import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { TagItem } from "./types";
import { tagsApi } from "./api";
import { toTagItem } from "./mappers";

export const tagKeys = {
	all: ["tags"] as const,
	list: () => [...tagKeys.all, "list"] as const,
	byArticle: (articleId: number) =>
		[...tagKeys.all, "article", articleId] as const,
};

export function useTagsList() {
	return useQuery({
		queryKey: tagKeys.list(),
		queryFn: async () => {
			const result = await tagsApi.list();
			if (!result) {
				throw new Error("Failed to fetch tags");
			}
			return result.map(toTagItem) as TagItem[];
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useTagsByArticle(articleId: number) {
	return useQuery({
		queryKey: tagKeys.byArticle(articleId),
		queryFn: async () => {
			const article = await apiClient.articles.get(articleId);
			if (!article?.tags) return [];
			return article.tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
				articleCount: 0,
			})) as TagItem[];
		},
		enabled: articleId !== undefined && !Number.isNaN(articleId),
		staleTime: 2 * 60 * 1000,
	});
}
