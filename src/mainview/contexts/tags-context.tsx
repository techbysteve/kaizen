import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTagsList, tagKeys } from "@/features/tags/queries";
import type { TagItem } from "../../types/types";

interface TagsContextType {
	tags: TagItem[];
	isLoading: boolean;
	error: string | null;
	refreshTags: () => Promise<void>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function TagsProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const { data, isLoading, error } = useTagsList();
	const tags = data ?? [];

	const refreshTags = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: tagKeys.list() });
	}, [queryClient]);

	return (
		<TagsContext.Provider
			value={{
				tags,
				isLoading,
				error: error instanceof Error ? error.message : null,
				refreshTags,
			}}
		>
			{children}
		</TagsContext.Provider>
	);
}

export function useTags() {
	const context = useContext(TagsContext);
	if (context === undefined) {
		throw new Error("useTags must be used within a TagsProvider");
	}
	return context;
}
