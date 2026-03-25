import { useState } from "react";

import { AddArticle } from "@/components/blocks/add-article";
import ArticleGrid from "@/components/blocks/article-grid";
import {
	EmptyLibrary,
	EmptyRead,
	EmptyUnread,
} from "@/components/blocks/empty-state";
import FilterButtons from "@/components/blocks/filter-buttons";
import { Header } from "@/components/blocks/header";
import { ArticlePagination } from "@/components/blocks/pagination";
import { useSearchParams } from "@/hooks/use-search-params";
import { useArticlesList } from "@/hooks";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "@/lib/constants";
import { routes } from "./routes";

export function LibraryPage() {
	const [isAddingArticle, setIsAddingArticle] = useState(false);
	const searchParams = useSearchParams();
	const currentFilter =
		(searchParams.get("filter") as "all" | "unread" | "read") || "all";
	const page = Number.parseInt(
		searchParams.get("page") || String(DEFAULT_PAGE),
		10,
	);
	const perPage = Number.parseInt(
		searchParams.get("per_page") || String(DEFAULT_PER_PAGE),
		10,
	);

	const { data } = useArticlesList({
		filter: currentFilter,
		page,
		perPage,
	});

	const articles = data?.articles ?? [];
	const pagination = data?.pagination ?? {
		page,
		perPage,
		total: 0,
		totalPages: 1,
	};

	const renderEmptyState = () => {
		if (currentFilter === "unread") return <EmptyUnread />;
		if (currentFilter === "read") return <EmptyRead />;
		return <EmptyLibrary />;
	};

	return (
		<div className="mx-auto max-w-400 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
			<Header title="My Library" />
			<AddArticle onAdding={setIsAddingArticle} />
			<FilterButtons currentFilter={currentFilter} />

			{articles.length > 0 || isAddingArticle ? (
				<>
					<ArticleGrid articles={articles} showLoadingCard={isAddingArticle} />
					<ArticlePagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						pathname={routes.library}
					/>
				</>
			) : (
				renderEmptyState()
			)}
		</div>
	);
}
