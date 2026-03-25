/**
 * Application route definitions
 * Centralized route constants to avoid hardcoding paths throughout the codebase
 */

export const routes = {
	library: "/",
	onboarding: "/onboarding",
	favorites: "/favorites",
	search: "/search",
	tagging: {
		tags: "/tags",
		tagDetail: (id: string | number) => `/tags/${id}`,
		tagDetailPattern: "/tags/:id",
	},
	archived: "/archived",
	read: {
		article: (id: string) => `/read/${id}`,
		pattern: "/read/:id",
	},
};
