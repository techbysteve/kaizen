import { useLocation } from "wouter";

type FilterType = "all" | "unread" | "read";

interface FilterButtonsProps {
	currentFilter?: FilterType;
	onFilterChange?: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "unread", label: "Unread" },
	{ key: "read", label: "Read" },
];

export default function FilterButtons({
	currentFilter = "all",
	onFilterChange,
}: FilterButtonsProps) {
	const [, navigate] = useLocation();
	const router = {
		push: navigate,
		replace: navigate,
		back: () => window.history.back(),
	};
	const [pathname] = useLocation();

	const handleFilterClick = (filter: FilterType) => {
		// Update URL search params for server-side filtering
		const params = new URLSearchParams();
		if (filter !== "all") {
			params.set("filter", filter);
		}

		const newUrl = params.toString()
			? `${pathname}?${params.toString()}`
			: pathname;

		router.push(newUrl);
		onFilterChange?.(filter);
	};

	return (
		<div className="flex gap-3 mb-8 overflow-x-auto pb-2">
			{filters.map((filter) => (
				<button
					key={filter.key}
					onClick={() => handleFilterClick(filter.key)}
					className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 cursor-pointer ${
						currentFilter === filter.key
							? "bg-primary/20 dark:bg-primary/30"
							: "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
					}`}
					type="button"
				>
					<p
						className={`dark:text-primary-light text-sm font-medium leading-normal ${currentFilter === filter.key ? "text-primary" : "dark:text-primary-foreground text-foreground"}`}
					>
						{filter.label}
					</p>
				</button>
			))}
		</div>
	);
}
