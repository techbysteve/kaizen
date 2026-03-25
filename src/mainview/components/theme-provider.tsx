import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	...props
}: ThemeProviderProps & React.HTMLAttributes<HTMLDivElement>) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);

	useEffect(() => {
		let cancelled = false;

		const hydrateTheme = async () => {
			try {
				const appSettings = await apiClient.settings.get();
				if (cancelled || !appSettings) {
					return;
				}

				setThemeState(appSettings.theme);
			} catch (error) {
				console.error("Failed to load theme settings:", error);
			}
		};

		hydrateTheme();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(theme);
	}, [theme]);

	const value: ThemeProviderState = {
		theme,
		setTheme: (theme: Theme) => {
			setThemeState(theme);
			void apiClient.settings.update({ theme })?.catch((error) => {
				console.error("Failed to persist theme settings:", error);
			});
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};

export type { Theme };
