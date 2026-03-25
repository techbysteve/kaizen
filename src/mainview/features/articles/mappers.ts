import type { Article as RPCArticle } from "@/lib/rpc-client";
import type { ArticleListItem, ViewArticle } from "../../../types/types";

export function toArticleListItem(article: RPCArticle): ArticleListItem {
	return {
		id: article.id,
		userId: article.userId,
		url: article.url,
		title: article.title ?? "Untitled Article",
		author: article.author,
		description: article.description,
		publishedDate: article.publishedDate,
		imageUrl: article.imageUrl,
		readTimeMinutes: article.readTimeMinutes,
		readStatus: article.readStatus,
		isFavorite: article.isFavorite,
		isArchived: article.isArchived,
		createdAt: article.createdAt,
		tags: article.tags,
	};
}

export function toViewArticle(article: RPCArticle): ViewArticle {
	return {
		...toArticleListItem(article),
		content: article.content ?? "",
	};
}
