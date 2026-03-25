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

import { Heart, CircleCheck, BookOpen } from "lucide-react";
import { routes } from "@/app/routes";

export function EmptyFavorites() {
	return (
		<EmptyState
			icon={Heart}
			title="No favorites yet"
			description="Start by adding articles to your library, then heart the ones you love to save them here."
			action={{ label: "Go to My Library", href: routes.library }}
		/>
	);
}

export function EmptyFavoritesUnread() {
	return (
		<EmptyState
			icon={CircleCheck}
			title="All favorites are read"
			description="Great job! You've read all your favorited articles."
			action={{ label: "Go to My Library", href: routes.library }}
		/>
	);
}

export function EmptyFavoritesRead() {
	return (
		<EmptyState
			icon={BookOpen}
			title="No favorites read yet"
			description="Start reading your favorites to track progress here."
			action={{ label: "Go to My Library", href: routes.library }}
		/>
	);
}
