import type { Settings } from "@/lib/api/client";
import type {
	FontSettings,
	FontFamily,
	MarginWidth,
} from "../../../types/types";

const DEFAULT_FONT_SETTINGS: FontSettings = {
	fontFamily: "sans",
	fontSize: 100,
	marginWidth: "medium",
};

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
	sans: "var(--font-sans)",
	serif: "var(--font-serif)",
	mono: "var(--font-mono)",
};

export const MARGIN_WIDTH_MAP: Record<MarginWidth, string> = {
	narrow: "42rem",
	medium: "48rem",
	wide: "56rem",
};

export function getDefaultFontSettings(): FontSettings {
	return { ...DEFAULT_FONT_SETTINGS };
}

export function settingsToFontSettings(settings: Settings): FontSettings {
	return {
		fontFamily: settings.fontFamily,
		fontSize: settings.fontSize,
		marginWidth: settings.marginWidth,
	};
}

export function fontSettingsToDbSettings(
	settings: FontSettings,
): Pick<Settings, "fontFamily" | "fontSize" | "marginWidth"> {
	return {
		fontFamily: settings.fontFamily,
		fontSize: settings.fontSize,
		marginWidth: settings.marginWidth,
	};
}

export function applyFontSettingsToCSS(settings: FontSettings) {
	if (typeof document === "undefined") return;

	const root = document.documentElement;
	root.style.setProperty(
		"--article-font-family",
		FONT_FAMILY_MAP[settings.fontFamily],
	);
	root.style.setProperty("--article-font-size", `${settings.fontSize}%`);
	root.style.setProperty(
		"--article-max-width",
		MARGIN_WIDTH_MAP[settings.marginWidth],
	);
}
