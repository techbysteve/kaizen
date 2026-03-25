import { useMemo } from "react";
import { useLocation } from "wouter";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParamsString } from "@/hooks/use-search-params";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	pathname?: string;
}

export function ArticlePagination({
	currentPage,
	totalPages,
	pathname,
}: PaginationProps) {
	const [currentPathname] = useLocation();
	const resolvedPathname = pathname ?? currentPathname;
	const searchParamsString = useSearchParamsString();

	const params = useMemo(
		() => new URLSearchParams(searchParamsString),
		[searchParamsString],
	);

	const buildUrl = (page: number) => {
		const queryParams = new URLSearchParams(params);

		if (page <= 1) {
			queryParams.delete("page");
		} else {
			queryParams.set("page", String(page));
		}

		const query = queryParams.toString();

		return query ? `${resolvedPathname}?${query}` : resolvedPathname;
	};

	const pageNumbers = useMemo(() => {
		const pages: Array<
			{ type: "page"; value: number } | { type: "ellipsis"; key: string }
		> = [];
		const maxVisible = 7;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push({ type: "page", value: i });
			}
			return pages;
		}

		pages.push({ type: "page", value: 1 });

		if (currentPage <= 3) {
			for (let i = 2; i <= 5; i++) {
				pages.push({ type: "page", value: i });
			}
			pages.push({ type: "ellipsis", key: `end-${totalPages}` });
			pages.push({ type: "page", value: totalPages });
			return pages;
		}

		if (currentPage >= totalPages - 2) {
			pages.push({ type: "ellipsis", key: "start" });
			for (let i = totalPages - 4; i <= totalPages; i++) {
				pages.push({ type: "page", value: i });
			}
			return pages;
		}

		pages.push({ type: "ellipsis", key: "start" });
		for (let i = currentPage - 1; i <= currentPage + 1; i++) {
			pages.push({ type: "page", value: i });
		}
		pages.push({ type: "ellipsis", key: `end-${totalPages}` });
		pages.push({ type: "page", value: totalPages });

		return pages;
	}, [currentPage, totalPages]);

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href={currentPage > 1 ? buildUrl(currentPage - 1) : "#"}
							className={
								currentPage <= 1 ? "pointer-events-none opacity-50" : ""
							}
						/>
					</PaginationItem>

					{pageNumbers.map((item) => {
						if (item.type === "ellipsis") {
							return (
								<PaginationItem key={item.key}>
									<PaginationEllipsis />
								</PaginationItem>
							);
						}

						const isCurrentPage = item.value === currentPage;

						return (
							<PaginationItem key={item.value}>
								<PaginationLink
									href={isCurrentPage ? "#" : buildUrl(item.value)}
									isActive={isCurrentPage}
								>
									{item.value}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					<PaginationItem>
						<PaginationNext
							href={currentPage < totalPages ? buildUrl(currentPage + 1) : "#"}
							className={
								currentPage >= totalPages
									? "pointer-events-none opacity-50"
									: ""
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
