export type FontFamily = "sans" | "serif" | "mono";
export type MarginWidth = "narrow" | "medium" | "wide";
export type Theme = "light" | "dark" | "system";

export interface FontSettings {
	fontFamily: FontFamily;
	fontSize: number;
	marginWidth: MarginWidth;
}

export interface Tag {
	id: number;
	userId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	articleCount?: number;
}

export type ArticleTag = Pick<Tag, "id" | "name">;

export interface Article {
	id: number;
	userId: string;
	url: string;
	title: string | null;
	author: string | null;
	description: string | null;
	publishedDate: string | null;
	content: string | null;
	imageUrl: string | null;
	readTimeMinutes: number;
	readStatus: boolean;
	isFavorite: boolean;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
	tags?: Tag[];
}

export interface User {
	id: string;
	username: string;
	profilePhotoDataUrl: string | null;
	isCurrent: boolean;
	onboardingCompleted: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface Settings {
	fontFamily: FontFamily;
	fontSize: number;
	marginWidth: MarginWidth;
	theme: Theme;
	crawl4aiUrl: string;
}

export interface PaginationMeta {
	page: number;
	perPage: number;
	total: number;
	totalPages: number;
}

export interface ArticleListItem
	extends Omit<Article, "content" | "updatedAt" | "title" | "tags"> {
	title: string;
	tags?: ArticleTag[];
}

export interface ViewArticle extends ArticleListItem {
	content: string;
}

export interface TagItem extends Tag {
	articleCount: number;
}
