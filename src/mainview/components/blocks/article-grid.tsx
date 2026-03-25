import ArticleCard from "./article-card";
import type { ArticleListItem } from "../../../types/types";
import { ArticleCardSkeleton } from "./article-card-skeleton";

interface ArticleGridProps {
	articles: ArticleListItem[];
	hideTagDropdown?: boolean;
	showLoadingCard?: boolean;
}

const MAX_GRID_ITEMS = 12;

export default function ArticleGrid({
	articles,
	hideTagDropdown,
	showLoadingCard,
}: ArticleGridProps) {
	const visibleArticles =
		showLoadingCard && articles.length >= MAX_GRID_ITEMS
			? articles.slice(0, MAX_GRID_ITEMS - 1)
			: articles;

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{showLoadingCard && <ArticleCardSkeleton />}
			{visibleArticles.map((article) => (
				<ArticleCard
					article={article}
					key={article.id}
					hideTagDropdown={hideTagDropdown}
				/>
			))}
		</div>
	);
}
