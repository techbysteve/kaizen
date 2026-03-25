import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { articleKeys } from "@/features/articles/queries";
import type { TagItem } from "./types";
import { tagsApi } from "./api";
import { tagKeys } from "./queries";

export function useCreateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			const result = await tagsApi.create(name);
			if (!result) {
				throw new Error("Failed to create tag");
			}
			return result;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: tagKeys.list() });
			toast.success(`Tag "${data.name}" created`);
		},
		onError: () => {
			toast.error("Failed to create tag");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.list() });
		},
	});
}

export function useDeleteTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await tagsApi.delete(id);
			if (!result) {
				throw new Error("Failed to delete tag");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
			toast.success("Tag deleted");
		},
		onError: () => {
			toast.error("Failed to delete tag");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
		},
	});
}

export function useLinkTagToArticle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			articleId,
			tagId,
		}: {
			articleId: number;
			tagId: number;
		}) => {
			const result = await tagsApi.linkArticle(articleId, tagId);
			if (!result) {
				throw new Error("Failed to link tag");
			}
			return result;
		},
		onMutate: async ({ tagId }) => {
			await queryClient.cancelQueries({ queryKey: tagKeys.list() });

			const previousTags =
				queryClient.getQueryData<TagItem[]>(tagKeys.list()) ?? [];

			queryClient.setQueryData<TagItem[]>(tagKeys.list(), (current = []) =>
				current.map((tag) =>
					tag.id === tagId
						? { ...tag, articleCount: tag.articleCount + 1 }
						: tag,
				),
			);

			return { previousTags };
		},
		onSuccess: () => {
			toast.success("Tag linked");
		},
		onError: (_error, _variables, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagKeys.list(), context.previousTags);
			}
			toast.error("Failed to link tag");
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(variables.articleId),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
			queryClient.invalidateQueries({ queryKey: tagKeys.list() });
			queryClient.invalidateQueries({
				queryKey: tagKeys.byArticle(variables.articleId),
			});
		},
	});
}

export function useUnlinkTagFromArticle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			articleId,
			tagId,
		}: {
			articleId: number;
			tagId: number;
		}) => {
			const result = await tagsApi.unlinkArticle(articleId, tagId);
			if (!result) {
				throw new Error("Failed to unlink tag");
			}
			return result;
		},
		onMutate: async ({ tagId }) => {
			await queryClient.cancelQueries({ queryKey: tagKeys.list() });

			const previousTags =
				queryClient.getQueryData<TagItem[]>(tagKeys.list()) ?? [];

			queryClient.setQueryData<TagItem[]>(tagKeys.list(), (current = []) =>
				current.map((tag) =>
					tag.id === tagId
						? {
								...tag,
								articleCount: Math.max(0, tag.articleCount - 1),
							}
						: tag,
				),
			);

			return { previousTags };
		},
		onSuccess: () => {
			toast.success("Tag unlinked");
		},
		onError: (_error, _variables, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagKeys.list(), context.previousTags);
			}
			toast.error("Failed to unlink tag");
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(variables.articleId),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
			queryClient.invalidateQueries({ queryKey: tagKeys.list() });
			queryClient.invalidateQueries({
				queryKey: tagKeys.byArticle(variables.articleId),
			});
		},
	});
}

export function useUnlinkAllTagsFromArticle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (articleId: number) => {
			const result = await tagsApi.unlinkAllFromArticle(articleId);
			if (!result) {
				throw new Error("Failed to unlink tags");
			}
			return result;
		},
		onMutate: async (articleId) => {
			await queryClient.cancelQueries({ queryKey: tagKeys.list() });
			await queryClient.cancelQueries({
				queryKey: tagKeys.byArticle(articleId),
			});

			const previousTags =
				queryClient.getQueryData<TagItem[]>(tagKeys.list()) ?? [];
			const previousArticleTags =
				queryClient.getQueryData<TagItem[]>(tagKeys.byArticle(articleId)) ?? [];

			const selectedTagIds = new Set(previousArticleTags.map((tag) => tag.id));

			queryClient.setQueryData<TagItem[]>(tagKeys.list(), (current = []) =>
				current.map((tag) =>
					selectedTagIds.has(tag.id)
						? {
								...tag,
								articleCount: Math.max(0, tag.articleCount - 1),
							}
						: tag,
				),
			);
			queryClient.setQueryData<TagItem[]>(tagKeys.byArticle(articleId), []);

			return { previousTags, previousArticleTags };
		},
		onSuccess: () => {
			toast.success("All tags removed");
		},
		onError: (_error, articleId, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagKeys.list(), context.previousTags);
			}
			if (context?.previousArticleTags) {
				queryClient.setQueryData(
					tagKeys.byArticle(articleId),
					context.previousArticleTags,
				);
			}
			toast.error("Failed to unlink tags");
		},
		onSettled: (_data, _error, articleId) => {
			queryClient.invalidateQueries({
				queryKey: articleKeys.detail(articleId),
			});
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
			queryClient.invalidateQueries({ queryKey: tagKeys.list() });
			queryClient.invalidateQueries({
				queryKey: tagKeys.byArticle(articleId),
			});
		},
	});
}
