import ArticleContent from "@/components/blocks/article-content";
import ArticleHeader from "@/components/blocks/article-header";
import MarkAsRead from "@/components/blocks/mark-as-read";
import StickyHeader from "@/components/blocks/sticky-header";
import { useArticle } from "@/hooks";

export function ReadPage({ id }: { id: string }) {
	const { data: article, isLoading, error } = useArticle(id);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center text-muted-foreground">
				Loading article...
			</div>
		);
	}

	if (error || !article) {
		return (
			<div className="flex min-h-screen items-center justify-center text-red-500">
				{error?.message || "Article not found"}
			</div>
		);
	}

	return (
		<div className="flex flex-col min-w-0 bg-background min-h-screen">
			<StickyHeader
				articleId={article.id}
				url={article.url}
				title={article.title}
				content={article.content}
				tags={article.tags}
				isFavorite={article.isFavorite}
				isArchived={article.isArchived}
			/>
			<div className="flex-1 p-6 md:p-8 lg:p-12 pb-24">
				<div
					className="mx-auto"
					style={{ maxWidth: "var(--article-max-width, 48rem)" }}
				>
					<ArticleHeader
						title={article.title}
						url={article.url}
						readTimeMinutes={article.readTimeMinutes}
						createdAt={article.createdAt}
						tags={article.tags}
					/>

					<ArticleContent content={article.content} />

					<MarkAsRead articleId={article.id} readStatus={article.readStatus} />
				</div>
			</div>
		</div>
	);
}
