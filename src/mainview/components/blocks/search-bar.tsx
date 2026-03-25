import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Input } from "@/components/ui/input";
import { useSearchParamsString } from "@/hooks/use-search-params";

interface SearchBarProps {
	placeholder: string;
	queryParam?: string;
	wrapperClassName?: string;
}

export function SearchBar({
	placeholder,
	queryParam = "query",
	wrapperClassName = "",
}: SearchBarProps) {
	const [pathname, navigate] = useLocation();
	const searchParamsString = useSearchParamsString();
	const currentQuery =
		new URLSearchParams(searchParamsString).get(queryParam) ?? "";

	const [searchQuery, setSearchQuery] = useState(currentQuery);
	const [debouncedSearch] = useDebounce(searchQuery, 300);

	useEffect(() => {
		setSearchQuery(currentQuery);
	}, [currentQuery]);

	useEffect(() => {
		const params = new URLSearchParams(searchParamsString);
		const value = debouncedSearch.trim();

		if (!value) {
			params.delete(queryParam);
			params.delete("page");
		} else {
			params.set(queryParam, value);
			params.delete("page");
		}

		const nextQuery = params.toString();
		const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
		const currentUrl = searchParamsString
			? `${pathname}?${searchParamsString}`
			: pathname;

		if (nextUrl !== currentUrl) {
			navigate(nextUrl);
		}
	}, [debouncedSearch, navigate, pathname, queryParam, searchParamsString]);

	return (
		<div className={`flex items-center gap-2 w-full ${wrapperClassName}`}>
			<div className="relative w-full">
				<Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					className="rounded-xl border py-6 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
					placeholder={placeholder}
					type="search"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
		</div>
	);
}
