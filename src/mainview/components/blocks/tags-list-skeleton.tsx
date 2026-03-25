import { Skeleton } from "@/components/ui/skeleton";

export function TagsListSkeleton({ count = 8 }: { count?: number }) {
	const rows = Array.from({ length: count }).map((_, index) => ({
		id: `row-${index}`,
	}));

	return (
		<div className="flex flex-col rounded-xl border divide-y overflow-hidden">
			{rows.map((row) => (
				<div key={row.id} className="flex items-center justify-between p-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-5 w-5 rounded-md" />
						<Skeleton className="h-5 w-40" />
					</div>
					<div className="flex items-center gap-4">
						<Skeleton className="h-6 w-10 rounded-md" />
						<Skeleton className="h-5 w-5 rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}
