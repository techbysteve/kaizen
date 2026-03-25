import { ArrowLeft, Hash } from "lucide-react";
import { Link } from "wouter";

import { ArticlePagination } from "@/components/blocks/pagination";
import { TagArticleGridClient } from "@/components/blocks/tag-article-grid";
import { TagDeleteButton } from "@/components/blocks/tag-delete-button";
import { useSearchParams } from "@/hooks/use-search-params";
import { useArticlesList, useTagsList } from "@/hooks";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "@/lib/constants";
import { routes } from "@/app/routes";
import { decodeId } from "@/lib/utils";

export function TagDetailsPage({ id }: { id: string }) {

	const searchParams = useSearchParams();

	const page = Number.parseInt(
		searchParams.get("page") || String(DEFAULT_PAGE),
		10,
	);

	const perPage = Number.parseInt(
		searchParams.get("per_page") || String(DEFAULT_PER_PAGE),
		10,
	);

	const tagId = Number(decodeId(id))

	// Fetch all tags to find the current tag
	const { data: tags = [] } = useTagsList();
	
	const tag = tags.find((item) => item.id === tagId) ?? null;

	// Fetch articles for this tag
	const { data } = useArticlesList({
		tagId,
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

	if (!tagId) {
		return (
			<div className="mx-auto max-w-400 px-4 py-8 sm:px-6 lg:px-8">
				<div className="py-8 text-center text-red-500">Invalid tag ID</div>
			</div>
		);
	}

	if (!tag) {
		return (
			<div className="mx-auto max-w-400 px-4 py-8 sm:px-6 lg:px-8">
				<div className="py-8 text-center text-red-500">Tag not found</div>
			</div>
		);
	}

	const tagName = tag?.name ?? "";

	return (
		<div className="mx-auto max-w-400 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
			<header className="mb-8 flex flex-col gap-6">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Link
						className="flex items-center gap-1 transition-colors hover:text-foreground"
						href={routes.tagging.tags}
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Tags
					</Link>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-3">
							<Hash className="h-8 w-8 text-primary" />
							<h1 className="text-foreground text-4xl font-black leading-tight tracking-[-0.033em]">
								{tagName || "Loading..."}
							</h1>
						</div>
						<p className="pl-11 text-base font-normal text-muted-foreground">
							{pagination.total} article{pagination.total !== 1 ? "s" : ""}{" "}
							tagged
						</p>
					</div>
					{tag && <TagDeleteButton tagId={tag.id} tagName={tag.name} />}
				</div>
			</header>

			{articles.length > 0 ? (
				<>
					<TagArticleGridClient tagName={tagName} articles={articles} />
					<ArticlePagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						pathname={routes.tagging.tagDetail(id)}
					/>
				</>
			) : (
				<div className="py-12 text-center text-muted-foreground">
					No articles tagged with {tagName} yet
				</div>
			)}
		</div>
	);
}
