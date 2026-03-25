import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		href: string;
	};
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 gap-6">
			<div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
				<Icon className="h-10 w-10 text-muted-foreground" />
			</div>
			<div className="text-center max-w-sm">
				<h3 className="text-foreground text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground mb-4">{description}</p>
				{action && (
					<Link
						href={action.href}
						className="inline-flex items-center text-primary hover:underline font-medium"
					>
						{action.label}
						<ArrowRight className="ml-1 h-4 w-4" />
					</Link>
				)}
			</div>
		</div>
	);
}

import { Bookmark, CircleCheck, BookOpen, Search } from "lucide-react";

export function EmptyLibrary() {
	return (
		<EmptyState
			icon={Bookmark}
			title="No articles yet"
			description="Add articles to your library to get started."
		/>
	);
}

export function EmptyUnread() {
	return (
		<EmptyState
			icon={CircleCheck}
			title="All articles are read"
			description="Great job! You've read everything in your library."
		/>
	);
}

export function EmptyRead() {
	return (
		<EmptyState
			icon={BookOpen}
			title="No articles read yet"
			description="Start reading to track your progress here."
		/>
	);
}

export function EmptySearch() {
	return (
		<EmptyState
			icon={Search}
			title="No results found"
			description="Try adjusting your search terms or filters."
		/>
	);
}
