import type { ArticleListItem } from "../../../types/types";
import ArticleGrid from "./article-grid";

interface TagArticleGridClientProps {
	tagName: string;
	articles: ArticleListItem[];
}

export function TagArticleGridClient({
	tagName: _tagName,
	articles,
}: TagArticleGridClientProps) {
	return <ArticleGrid articles={articles} hideTagDropdown={true} />;
}
