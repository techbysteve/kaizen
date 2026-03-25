import { ArticleCardSkeleton } from "@/components/blocks/article-card-skeleton";

export function ArticleGridSkeleton({ count = 12 }: { count?: number }) {
	const cards = Array.from({ length: count }).map((_, index) => ({
		id: `card-${index}`,
	}));

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{cards.map((card) => (
				<ArticleCardSkeleton key={card.id} />
			))}
		</div>
	);
}
