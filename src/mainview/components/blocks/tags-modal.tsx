import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Loader2 } from "lucide-react";
import { DEFAULT_TAG_SIZE } from "@/lib/constants";
import {
	useCreateTag,
	useLinkTagToArticle,
	useUnlinkTagFromArticle,
	useUnlinkAllTagsFromArticle,
} from "@/hooks";
import { useTagsList } from "@/hooks";

interface TagsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	articleId: number;
	selectedTags?: number[];
	onTagsChange?: (tags: number[]) => void;
}

export function TagsModal({
	open,
	onOpenChange,
	articleId,
	selectedTags = [],
	onTagsChange,
}: TagsModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>(selectedTags);

	const { data: availableTags = [], isLoading: isLoadingTags } = useTagsList();

	const createTag = useCreateTag();
	const linkTag = useLinkTagToArticle();
	const unlinkTag = useUnlinkTagFromArticle();
	const removeAllTags = useUnlinkAllTagsFromArticle();

	const handleTagToggle = async (tagId: number) => {
		const isTagSelected = selectedTagIds.includes(tagId);

		if (isTagSelected) {
			unlinkTag.mutate({ articleId, tagId });
			const newTags = selectedTagIds.filter((t) => t !== tagId);
			setSelectedTagIds(newTags);
			onTagsChange?.(newTags);
		} else {
			linkTag.mutate({ articleId, tagId });
			const newTags = [...selectedTagIds, tagId];
			setSelectedTagIds(newTags);
			onTagsChange?.(newTags);
		}
	};

	const handleCreateTag = async (tagName: string) => {
		if (!tagName.trim()) return;

		try {
			const newTag = await createTag.mutateAsync(tagName.trim());
			const tagId = newTag.id;
			linkTag.mutate({ articleId, tagId });
			const newTags = [...selectedTagIds, tagId];
			setSelectedTagIds(newTags);
			onTagsChange?.(newTags);
			setSearchQuery("");
		} catch {
			// Error handling is done in the mutation hook
		}
	};

	const filteredTags = availableTags.filter((tag) =>
		tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const selectedTagObjects = availableTags.filter((tag) =>
		selectedTagIds.includes(tag.id),
	);

	const clearTags = () => {
		removeAllTags.mutate(articleId);
		setSelectedTagIds([]);
		onTagsChange?.([]);
	};

	const convertToLowerSnakeCase = (str: string) => {
		return str.replace(/ /g, "-").toLowerCase();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md p-0 gap-0">
				<DialogHeader className="px-5 py-4 border-b border-border">
					<DialogTitle className="text-lg font-bold">Edit Tags</DialogTitle>
					<DialogDescription className="text-xs mt-0.5">
						Categorize this article to find it easily later.
					</DialogDescription>
				</DialogHeader>

				<div className="p-5">
					{/* Search Input */}
					<div className="relative mb-4 group">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search or create a tag..."
							value={searchQuery}
							onChange={(e) =>
								setSearchQuery(convertToLowerSnakeCase(e.target.value))
							}
							className="pl-10 pr-3 bg-muted/50 border-border focus-visible:ring-primary/50"
							maxLength={DEFAULT_TAG_SIZE}
							id="search"
						/>
						<div className="absolute right-2 top-[45%] -translate-y-1/2 hidden group-focus-within:block">
							<kbd className="text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background">
								ESC
							</kbd>
						</div>
					</div>

					{/* Selected Tags */}
					{selectedTagObjects.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-5">
							{selectedTagObjects.map((tag) => (
								<Badge
									key={tag.id}
									variant="outline"
									className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium border transition-colors bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
								>
									<span>{tag.name}</span>
									<button
										type="button"
										onClick={() => handleTagToggle(tag.id)}
										className="flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full h-4 w-4 transition-colors"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Available Tags */}
					<div className="mb-4">
						<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
							Available Tags
						</h4>
						<ScrollArea className="h-48 border border-border rounded-lg bg-muted/30 p-2">
							<div className="space-y-1">
								{isLoadingTags ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<Loader2 className="h-5 w-5 animate-spin text-muted-foreground mb-2" />
										<p className="text-sm text-muted-foreground">
											Loading tags...
										</p>
									</div>
								) : filteredTags.length > 0 ? (
									filteredTags.map((tag) => (
										<div
											key={tag.id}
											className="flex items-center justify-between p-2 rounded hover:bg-background hover:shadow-sm transition-all group"
										>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={selectedTagIds.includes(tag.id)}
													onCheckedChange={() => handleTagToggle(tag.id)}
													className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
												/>
												<span className="text-sm font-medium text-foreground group-hover:text-foreground">
													{tag.name}
												</span>
											</div>
											<span className="text-xs text-muted-foreground">
												{tag.articleCount} articles
											</span>
										</div>
									))
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<p className="text-sm text-muted-foreground mb-2">
											No tags found
										</p>
										{searchQuery && (
											<button
												type="button"
												disabled={createTag.isPending}
												className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
												onClick={() => handleCreateTag(searchQuery)}
											>
												{createTag.isPending ? (
													<>
														<Loader2 className="h-3 w-3 animate-spin" />
														Creating...
													</>
												) : (
													<>Create "{searchQuery}"</>
												)}
											</button>
										)}
									</div>
								)}
							</div>
						</ScrollArea>
					</div>

					{/* Quick Stats */}
					<div className="pt-4 border-t border-border">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>{selectedTagIds.length} tags selected</span>
							<button
								type="button"
								onClick={clearTags}
								className="text-primary hover:underline font-medium"
							>
								Clear all
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
