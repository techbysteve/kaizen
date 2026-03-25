import {
	EmptyFavorites,
	EmptyFavoritesRead,
	EmptyFavoritesUnread,
} from "@/components/blocks/empty-favorites";
import ArticleGrid from "@/components/blocks/article-grid";
import FilterButtons from "@/components/blocks/filter-buttons";
import { Header } from "@/components/blocks/header";
import { ArticlePagination } from "@/components/blocks/pagination";
import { useSearchParams } from "@/hooks/use-search-params";
import { useArticlesList } from "@/hooks";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "@/lib/constants";

export function FavoritesPage() {
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

	// Load all favorites for client-side filtering
	const { data: allFavoritesData } = useArticlesList({
		filter: "favorites",
		page: 1,
		perPage: 1000,
	});

	// Client-side filtering and pagination
	let articles = allFavoritesData?.articles ?? [];

	if (currentFilter === "read") {
		articles = articles.filter((article) => article.readStatus);
	} else if (currentFilter === "unread") {
		articles = articles.filter((article) => !article.readStatus);
	}

	const start = (page - 1) * perPage;
	const pagedArticles = articles.slice(start, start + perPage);

	const pagination = {
		page,
		perPage,
		total: articles.length,
		totalPages: Math.max(1, Math.ceil(articles.length / perPage)),
	};

	const renderEmptyState = () => {
		if (currentFilter === "read") return <EmptyFavoritesRead />;
		if (currentFilter === "unread") return <EmptyFavoritesUnread />;
		return <EmptyFavorites />;
	};

	return (
		<div className="mx-auto max-w-400 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
			<Header title="Favorites" />
			{pagination.total > 0 && <FilterButtons currentFilter={currentFilter} />}
			{pagedArticles.length > 0 ? (
				<>
					<ArticleGrid articles={pagedArticles} />
					<ArticlePagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						pathname="/favorites"
					/>
				</>
			) : (
				renderEmptyState()
			)}
		</div>
	);
}
