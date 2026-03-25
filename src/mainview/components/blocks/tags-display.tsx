interface TagsDisplayProps {
	tags?: Array<{ id: number; name: string }>;
	className?: string;
}

export default function TagsDisplay({
	tags = [],
	className,
}: TagsDisplayProps) {
	if (tags.length === 0) {
		return null;
	}

	return (
		<div className={`flex flex-wrap gap-1.5 ${className}`}>
			{tags.slice(0, 3).map((tag) => (
				<span
					key={tag.id}
					className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
				>
					{tag.name}
				</span>
			))}
			{tags.length > 3 && (
				<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
					+{tags.length - 3}
				</span>
			)}
		</div>
	);
}
