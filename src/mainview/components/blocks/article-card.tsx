/** biome-ignore-all lint/performance/noImgElement: ignored for now */

import defaultArticleImage from "@/assets/default-article-image.png";
import { routes } from "@/app/routes";
import type { ArticleListItem } from "../../../types/types";
import { extractDomain, encodeId, formatReadTime } from "@/lib/utils";
import { Link } from "wouter";
import {
	MoreHorizontal,
	Archive,
	Tag,
	Trash2,
	Check,
	CircleCheckBig,
	CircleMinus,
} from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagsModal } from "./tags-modal";
import { useState } from "react";
import TagsDisplay from "./tags-display";
import { useToggleArchived, useToggleRead, useDeleteArticle } from "@/hooks";

interface ArticleCardProps {
	article: ArticleListItem;
	hideTagDropdown?: boolean;
}

export default function ArticleCard({
	article,
	hideTagDropdown,
}: ArticleCardProps) {
	const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

	const [selectedTags, setSelectedTags] = useState<number[]>(
		article.tags?.map((tag) => tag.id) ?? [],
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const toggleArchived = useToggleArchived();
	const toggleRead = useToggleRead();
	const deleteArticle = useDeleteArticle();

	const handleToggleArchived = () => {
		toggleArchived.mutate(article.id);
	};

	const handleToggleReadStatus = () => {
		toggleRead.mutate(article.id);
	};

	const handleDelete = () => {
		deleteArticle.mutate(article.id);
		setIsDeleteDialogOpen(false);
	};

	return (
		<div className="flex flex-col gap-3 group relative">
			{" "}
			{/* Added h-full for grid consistency */}
			<div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-muted">
				<img
					src={article.imageUrl ?? defaultArticleImage}
					alt={article.title}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" // Subtle zoom on hover
					fetchPriority="low"
					loading="lazy"
					onError={(event) => {
						const img = event.currentTarget;
						if (img.dataset.fallbackApplied === "true") return;
						img.dataset.fallbackApplied = "true";
						img.src = defaultArticleImage;
					}}
				/>

				{/* Overlay Gradient for hover effect */}
				<div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

				{/* Three dot menu */}
				<div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 has-data-[state=open]:opacity-100">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
								type="button"
								aria-label="Article options"
							>
								<MoreHorizontal className="h-4.5 w-4.5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleToggleReadStatus}>
								{article.readStatus ? (
									<CircleMinus className="mr-2 h-4 w-4" />
								) : (
									<CircleCheckBig className="mr-2 h-4 w-4" />
								)}
								{article.readStatus ? "Unread" : "Read"}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleToggleArchived}>
								<Archive className="mr-2 h-4 w-4" />
								{article.isArchived ? "Unarchive" : "Archive"}
							</DropdownMenuItem>
							{!hideTagDropdown && (
								<DropdownMenuItem onClick={() => setIsTagsModalOpen(true)}>
									<Tag className="mr-2 h-4 w-4" />
									Tag
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Read status badge - Positioned below more options button */}
				{article.readStatus && (
					<div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md transition-all duration-300 ease-in-out">
						<Check className="h-3.5 w-3.5" />
						<span>Read</span>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<Link href={routes.read.article(encodeId(article.id))}>
					<p className="text-card-foreground text-base font-medium leading-normal hover:text-primary transition-colors">
						{article.title}
					</p>
				</Link>
				<p className="text-muted-foreground text-sm font-normal leading-normal">
					{" "}
					{/* mt-auto keeps metadata at the bottom */}
					{extractDomain(article.url)} ·{" "}
					{formatReadTime(article.readTimeMinutes)}
				</p>
				<TagsDisplay tags={article.tags ?? []} />
			</div>
			{/* Tags Modal */}
			<TagsModal
				open={isTagsModalOpen}
				onOpenChange={setIsTagsModalOpen}
				articleId={article.id}
				selectedTags={selectedTags}
				onTagsChange={setSelectedTags}
			/>
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							article from your library.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
