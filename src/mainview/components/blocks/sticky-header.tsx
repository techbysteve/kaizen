import { routes } from "@/app/routes";
import {
	Archive,
	ArrowLeft,
	ArchiveRestore,
	Heart,
	Download,
	Sparkles,
	Tag,
	ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { TagsModal } from "./tags-modal";
import { useToggleFavorite, useToggleArchived } from "@/hooks";
import { openExternalLink } from "@/lib/open-external";

interface StickyHeaderProps {
	articleId: number;
	url: string;
	title: string;
	content: string;
	tags?: Array<{ id: number; name: string }>;
	isFavorite: boolean;
	isArchived: boolean;
}

export default function StickyHeader({
	articleId,
	url,
	title,
	content,
	tags = [],
	isFavorite: initialIsFavorite,
	isArchived: initialIsArchived,
}: StickyHeaderProps) {
	const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
	const [selectedTags, setSelectedTags] = useState<number[]>(
		tags.map((tag) => tag.id),
	);
	const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
	const [isArchived, setIsArchived] = useState(initialIsArchived);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	const toggleFavorite = useToggleFavorite();
	const toggleArchived = useToggleArchived();

	// Handle scroll direction detection
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			if (currentScrollY < lastScrollY) {
				// Scrolling up - show header
				setIsVisible(true);
			} else if (currentScrollY > lastScrollY && currentScrollY > 100) {
				// Scrolling down and past threshold - hide header
				setIsVisible(false);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	// Sync with parent prop changes
	useEffect(() => {
		setIsFavorite(initialIsFavorite);
	}, [initialIsFavorite]);

	useEffect(() => {
		setIsArchived(initialIsArchived);
	}, [initialIsArchived]);

	const handleToggleFavorite = () => {
		const newFavorite = !isFavorite;
		toggleFavorite.mutate(articleId);
		setIsFavorite(newFavorite);
	};

	const handleToggleArchived = () => {
		const newArchived = !isArchived;
		toggleArchived.mutate(articleId);
		setIsArchived(newArchived);
	};

	const handleExport = () => {
		try {
			const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
			const downloadUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = downloadUrl;
			// Sanitize title for filename
			const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
			a.download = `${safeTitle}.md`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div
			className={`sticky top-0 z-30 w-full bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-8 lg:px-12 py-3 transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
		>
			<Link
				href={routes.library}
				className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors pr-4 "
			>
				<ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
				<span className="text-sm font-medium hidden md:block">
					Back to Library
				</span>
			</Link>
			<div className="flex items-center gap-1 sm:gap-2">
				{/* AI Actions */}
				<div className="flex items-center gap-1 ">
					<Button
						variant="ghost"
						size="default"
						className="flex items-center gap-2 h-9 px-3 rounded-lg bg-linear-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border border-primary/10 transition-all group"
						title="Open in ChatGPT"
						asChild
					>
						<a
							href={`https://chatgpt.com/?hints=search&prompt=${encodeURIComponent(
								`Read from ${url} so I can ask questions about it.`,
							)}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(event) => {
								event.preventDefault();
								void openExternalLink(event.currentTarget.href);
							}}
						>
							<Sparkles className="h-5 w-5" />
							<span className="text-xs font-bold uppercase tracking-wide hidden lg:block">
								AI Analysis
							</span>
						</a>
					</Button>
				</div>

				{/* Article Actions */}
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="size-9 rounded-lg"
						title="Tag Article"
						onClick={() => setIsTagsModalOpen(true)}
					>
						<Tag className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className={`size-9 rounded-lg ${
							isFavorite
								? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
								: "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
						}`}
						title={isFavorite ? "Remove from favorites" : "Add to favorites"}
						onClick={handleToggleFavorite}
					>
						<Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-9 rounded-lg"
						title={isArchived ? "Unarchive Article" : "Archive Article"}
						onClick={handleToggleArchived}
					>
						{isArchived ? (
							<ArchiveRestore className="h-5 w-5" />
						) : (
							<Archive className="h-5 w-5" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-9 rounded-lg"
						title="Export Article"
						onClick={handleExport}
					>
						<Download className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-9 rounded-lg"
						title="View Original"
						asChild
					>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(event) => {
								event.preventDefault();
								void openExternalLink(event.currentTarget.href);
							}}
						>
							<ExternalLink className="h-5 w-5" />
						</a>
					</Button>
				</div>
			</div>

			{/* Tags Modal */}
			<TagsModal
				open={isTagsModalOpen}
				onOpenChange={setIsTagsModalOpen}
				articleId={articleId}
				selectedTags={selectedTags}
				onTagsChange={setSelectedTags}
			/>
		</div>
	);
}
