import { Tag } from "lucide-react";

import { Header } from "@/components/blocks/header";
import { EmptyState } from "@/components/blocks/empty-state";
import { TagsList } from "@/components/blocks/tags-list";
import { useTagsList } from "@/hooks";

export function TagsPage() {
	const { data: tags = [] } = useTagsList();

	return (
		<div className="max-w-400 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 mx-auto">
			<Header title="Tags" />
			{tags.length > 0 ? (
				<TagsList tags={tags} />
			) : (
				<EmptyState
					icon={Tag}
					title="No tags yet"
					description="Add tags to your articles to organize them."
				/>
			)}
		</div>
	);
}
