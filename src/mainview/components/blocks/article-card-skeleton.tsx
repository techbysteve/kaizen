import { Skeleton } from "@/components/ui/skeleton";

export function ArticleCardSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<div className="relative w-full aspect-video rounded-xl overflow-hidden">
				<Skeleton className="h-full w-full" />
			</div>
			<div className="flex flex-col gap-2">
				{/* Title placeholder */}
				<Skeleton className="h-6 w-3/4" />
				{/* Metadata placeholder (domain · read time) */}
				<Skeleton className="h-4 w-1/2" />
				{/* Tags placeholder */}
				<Skeleton className="h-5 w-16 rounded-full" />
			</div>
		</div>
	);
}
