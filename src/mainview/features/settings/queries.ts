import { useQuery } from "@tanstack/react-query";
import type { Settings } from "./types";
import { settingsApi } from "./api";

export const settingsKeys = {
	all: ["settings"] as const,
	current: () => [...settingsKeys.all, "current"] as const,
};

export function useSettings() {
	return useQuery({
		queryKey: settingsKeys.current(),
		queryFn: async () => (await settingsApi.get()) as Settings,
	});
}
