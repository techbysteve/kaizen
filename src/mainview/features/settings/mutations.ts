import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Settings } from "./types";
import { settingsApi } from "./api";
import { settingsKeys } from "./queries";

export function useUpdateSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Partial<Settings>) => {
			const result = await settingsApi.update(params);
			if (!result) {
				throw new Error("Failed to update settings");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Settings updated");
		},
		onError: () => {
			toast.error("Failed to update settings");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
		},
	});
}
