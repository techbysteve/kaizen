import { extractDomain, formatReadTime } from "@/lib/utils";
import { Clock, Globe } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TagsDisplay from "./tags-display";

dayjs.extend(relativeTime);

interface ArticleHeaderProps {
	title: string;
	url: string;
	readTimeMinutes: number;
	createdAt: string;
	tags?: Array<{ id: number; name: string }>;
}

function formatSavedTime(dateString: string) {
	return dayjs(dateString).fromNow();
}

export default function ArticleHeader({
	title,
	url,
	readTimeMinutes,
	createdAt,
	tags = [],
}: ArticleHeaderProps) {
	return (
		<header className="mb-10">
			<h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-[-0.02em] mb-4">
				{title}
			</h1>
			<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<Globe className="h-[18px] w-[18px]" />
					<span className="font-medium text-foreground">
						{extractDomain(url)}
					</span>
				</div>
				<span className="text-muted-foreground/50">•</span>
				<div className="flex items-center gap-2">
					<Clock className="h-[18px] w-[18px]" />
					<span>{formatReadTime(readTimeMinutes)}</span>
				</div>
				<span className="text-muted-foreground/50">•</span>
				<span>Saved {formatSavedTime(createdAt)}</span>
			</div>
			<TagsDisplay tags={tags} className="mt-4" />
		</header>
	);
}
