import { useQuery } from "@tanstack/react-query";
import { systemApi } from "./api";

export const systemKeys = {
	all: ["system"] as const,
	health: () => [...systemKeys.all, "health"] as const,
	crawl4aiStatus: () => [...systemKeys.all, "crawl4ai"] as const,
};

export function useSystemHealth() {
	return useQuery({
		queryKey: systemKeys.health(),
		queryFn: async () => systemApi.health(),
		staleTime: 30 * 1000,
	});
}

export function useCrawl4AIStatus() {
	return useQuery({
		queryKey: systemKeys.crawl4aiStatus(),
		queryFn: async () => systemApi.crawl4aiStatus(),
		staleTime: 30 * 1000,
	});
}
