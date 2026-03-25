import { ChevronRight, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { routes } from "@/app/routes";
import { Link } from "wouter";

import type { TagItem } from "../../../types/types";
import { encodeId } from "@/lib/utils";

interface TagsListProps {
	tags: TagItem[];
}

export function TagsList({ tags }: TagsListProps) {
	return (
		<div className="flex flex-col rounded-xl border divide-y overflow-hidden">
			{tags.map((tag) => (
				<Link
					key={tag.id}
					href={routes.tagging.tagDetail(encodeId(tag.id))}
					className="group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-3">
						<Tag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
						<span className="text-foreground text-base font-medium">
							{tag.name}
						</span>
					</div>
					<div className="flex items-center gap-4">
						<Badge
							className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-muted hover:bg-muted"
							variant="secondary"
						>
							{tag.articleCount}
						</Badge>
						<ChevronRight className="h-5 w-5 text-muted-foreground/60" />
					</div>
				</Link>
			))}
			{tags.length === 0 && (
				<div className="p-8 text-center text-muted-foreground">No tags</div>
			)}
		</div>
	);
}
