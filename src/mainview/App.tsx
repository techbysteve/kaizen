import { Toaster } from "@/components/ui/sonner";
import { Route, Switch } from "wouter";

import { AppLayout } from "@/components/blocks/app-layout";
import { TagsProvider } from "@/contexts/tags-context";
import "./index.css";

import { ArchivedPage } from "./app/archived";
import { FavoritesPage } from "./app/favorites";
import { LibraryPage } from "./app/library";
import { ReadPage } from "./app/read";
import { SearchPage } from "./app/search";
import { TagDetailsPage } from "./app/tag-details";
import { TagsPage } from "./app/tags";
import { OnboardingPage } from "./components/blocks/onboarding-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/users/queries";
import { routes } from "@/app/routes";

const queryClient = new QueryClient();

function AppContent() {
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) return null;

	// No user or onboarding not done — show onboarding without sidebar
	if (!user?.onboardingCompleted) {
		return (
			<>
				<OnboardingPage />
				<Toaster />
			</>
		);
	}

	// Onboarded — full app with sidebar
	return (
		<TagsProvider>
			<AppLayout>
				<Switch>
					<Route path={routes.library} component={LibraryPage} />
					<Route path={routes.favorites} component={FavoritesPage} />
					<Route path={routes.archived} component={ArchivedPage} />
					<Route path={routes.tagging.tags} component={TagsPage} />
					<Route path={routes.tagging.tagDetailPattern}>
						{(params) => <TagDetailsPage id={(params as { id: string }).id} />}
					</Route>
					<Route path={routes.search} component={SearchPage} />
					<Route path={routes.read.pattern}>
						{(params) => <ReadPage id={(params as { id: string }).id} />}
					</Route>
					<Route>
						<LibraryPage />
					</Route>
				</Switch>
				<Toaster />
			</AppLayout>
		</TagsProvider>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AppContent />
		</QueryClientProvider>
	);
}

export default App;
