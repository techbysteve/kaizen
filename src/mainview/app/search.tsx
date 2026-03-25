import ArticleGrid from "@/components/blocks/article-grid";
import { EmptySearch } from "@/components/blocks/empty-state";
import { Header } from "@/components/blocks/header";
import { ArticlePagination } from "@/components/blocks/pagination";
import { SearchBar } from "@/components/blocks/search-bar";
import { useSearchParams } from "@/hooks/use-search-params";
import { useArticlesList } from "@/hooks";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "@/lib/constants";

export function SearchPage() {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("query") || "";
	const page = Number.parseInt(
		searchParams.get("page") || String(DEFAULT_PAGE),
		10,
	);
	const perPage = Number.parseInt(
		searchParams.get("per_page") || String(DEFAULT_PER_PAGE),
		10,
	);

	// Only fetch when there's a search query
	const { data } = useArticlesList({
		filter: "all",
		page,
		perPage,
		search: searchQuery || undefined,
	});

	const articles = data?.articles ?? [];
	const pagination = data?.pagination ?? {
		page,
		perPage,
		total: 0,
		totalPages: 1,
	};

	return (
		<div className="mx-auto max-w-400 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
			<Header title="Search" />
			<div className="mb-6 flex justify-center">
				<SearchBar placeholder="Search your library..." />
			</div>
			{searchQuery ? (
				articles.length > 0 ? (
					<>
						<ArticleGrid articles={articles} />
						<ArticlePagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							pathname="/search"
						/>
					</>
				) : (
					<EmptySearch />
				)
			) : (
				<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
					Start typing to search your library.
				</div>
			)}
		</div>
	);
}
