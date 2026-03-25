import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { articlesApi } from "./api";
import { articleKeys } from "./queries";

export function useCreateArticle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (url: string) => {
			const result = await articlesApi.create(url);
			if (!result) {
				throw new Error("Failed to create article");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Article added to your library");
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to add article";
			const isTimeout = message.includes("RPC request timed out");

			if (isTimeout) {
				toast.warning(
					"Article is being added. Please refresh if it doesn't appear shortly.",
				);
			} else {
				toast.error(message);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}

export function useDeleteArticle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await articlesApi.delete(id);
			if (!result) {
				throw new Error("Failed to delete article");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Article deleted");
		},
		onError: () => {
			toast.error("Failed to delete article");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}

export function useToggleRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await articlesApi.toggleRead(id);
			if (!result) {
				throw new Error("Failed to toggle read status");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Read status updated");
		},
		onError: () => {
			toast.error("Failed to update read status");
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(variables),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}

export function useToggleFavorite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await articlesApi.toggleFavorite(id);
			if (!result) {
				throw new Error("Failed to toggle favorite status");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Added to favorites");
		},
		onError: () => {
			toast.error("Failed to update favorite status");
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(variables),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}

export function useToggleArchived() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await articlesApi.toggleArchived(id);
			if (!result) {
				throw new Error("Failed to toggle archived status");
			}
			return result;
		},
		onSuccess: () => {
			toast.success("Article archived successfully");
		},
		onError: () => {
			toast.error("Failed to update archived status");
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(variables),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}
