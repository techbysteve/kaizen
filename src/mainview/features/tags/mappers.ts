import type { Tag as RPCTag } from "@/lib/rpc-client";
import type { TagItem } from "../../../types/types";

export function toTagItem(tag: RPCTag): TagItem {
	return {
		id: tag.id,
		userId: "local-user",
		name: tag.name,
		createdAt: tag.createdAt,
		updatedAt: tag.updatedAt,
		articleCount: tag.articleCount ?? 0,
	};
}
