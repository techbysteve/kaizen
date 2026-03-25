import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Monitor, Moon, Sun, Minus, Plus, RotateCcw } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
	FontSettings,
	FontFamily,
	MarginWidth,
} from "../../../types/types";
import {
	applyFontSettingsToCSS,
	fontSettingsToDbSettings,
	getDefaultFontSettings,
	settingsToFontSettings,
} from "@/features/settings/font-settings";
import { settingsApi } from "@/features/settings/api";
import { settingsKeys, useSettings } from "@/features/settings/hooks";
import { systemKeys, useCrawl4AIStatus } from "@/features/system/queries";

const FONT_SIZE_MIN = 50;
const FONT_SIZE_MAX = 200;
const FONT_SIZE_DEFAULT = 100;

interface SettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
	const { theme, setTheme } = useTheme();
	const queryClient = useQueryClient();
	const { data: appSettings } = useSettings();
	const { data: crawl4aiStatus, isFetching: isCheckingCrawl4AIStatus } =
		useCrawl4AIStatus();
	const [fontSettings, setFontSettings] = useState<FontSettings>(
		getDefaultFontSettings,
	);
	const [crawl4aiUrl, setCrawl4aiUrl] = useState("");
	const [isSavingCrawl4AIUrl, setIsSavingCrawl4AIUrl] = useState(false);

	useEffect(() => {
		applyFontSettingsToCSS(fontSettings);
	}, [fontSettings]);

	useEffect(() => {
		if (!appSettings) {
			return;
		}

		setFontSettings(settingsToFontSettings(appSettings));
		setCrawl4aiUrl(appSettings.crawl4aiUrl);
	}, [appSettings]);

	const persistFontSettings = (nextSettings: FontSettings) => {
		setFontSettings(nextSettings);

		void settingsApi
			.update(fontSettingsToDbSettings(nextSettings))
			?.then((updatedSettings) => {
				queryClient.setQueryData(settingsKeys.current(), updatedSettings);
			})
			.catch((error) => {
				console.error("Failed to persist font settings:", error);
			});
	};

	const updateFontSettings = (updates: Partial<FontSettings>) => {
		persistFontSettings({ ...fontSettings, ...updates });
	};

	const handleFontFamilyChange = (value: FontFamily) => {
		if (value) {
			updateFontSettings({ fontFamily: value });
		}
	};

	const handleFontSizeDecrease = () => {
		const newSize = Math.max(FONT_SIZE_MIN, fontSettings.fontSize - 10);
		updateFontSettings({ fontSize: newSize });
	};

	const handleFontSizeIncrease = () => {
		const newSize = Math.min(FONT_SIZE_MAX, fontSettings.fontSize + 10);
		updateFontSettings({ fontSize: newSize });
	};

	const handleMarginWidthChange = (value: MarginWidth) => {
		if (value) {
			updateFontSettings({ marginWidth: value });
		}
	};

	const handleResetFontSettings = () => {
		updateFontSettings({
			fontFamily: "sans",
			fontSize: FONT_SIZE_DEFAULT,
			marginWidth: "medium",
		});
	};

	const handleSaveCrawl4AIUrl = async () => {
		const trimmedUrl = crawl4aiUrl.trim();
		if (!trimmedUrl || trimmedUrl === appSettings?.crawl4aiUrl) {
			setCrawl4aiUrl(trimmedUrl || appSettings?.crawl4aiUrl || "");
			return;
		}

		setIsSavingCrawl4AIUrl(true);
		try {
			const updatedSettings = await settingsApi.update({
				crawl4aiUrl: trimmedUrl,
			});
			queryClient.setQueryData(settingsKeys.current(), updatedSettings);
			await queryClient.invalidateQueries({
				queryKey: systemKeys.crawl4aiStatus(),
			});
		} catch (error) {
			console.error("Failed to persist Crawl4AI endpoint:", error);
		} finally {
			setIsSavingCrawl4AIUrl(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="themed-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Customize your reading experience
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="theme-select" className="text-sm font-medium">
								Theme
							</label>
							<p className="text-sm text-muted-foreground">
								Select your preferred theme
							</p>
						</div>

						<Select value={theme} onValueChange={setTheme}>
							<SelectTrigger id="theme-select" className="w-35">
								<SelectValue placeholder="Select theme" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="system">
									<div className="flex items-center gap-2">
										<Monitor className="h-4 w-4" />
										<span>System</span>
									</div>
								</SelectItem>
								<SelectItem value="light">
									<div className="flex items-center gap-2">
										<Sun className="h-4 w-4" />
										<span>Light</span>
									</div>
								</SelectItem>
								<SelectItem value="dark">
									<div className="flex items-center gap-2">
										<Moon className="h-4 w-4" />
										<span>Dark</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="flex flex-col space-y-4">
						<div className="flex flex-col space-y-0.5">
							<h4 className="text-sm font-medium">Crawl4AI</h4>
							<p className="text-sm text-muted-foreground">
								Set the endpoint used for article extraction.
							</p>
						</div>

						<div className="flex flex-col space-y-2">
							<label
								htmlFor="crawl4ai-url"
								className="text-xs text-muted-foreground"
							>
								Endpoint URL
							</label>
							<Input
								id="crawl4ai-url"
								type="url"
								placeholder="http://localhost:11235"
								value={crawl4aiUrl}
								onChange={(event) => setCrawl4aiUrl(event.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								{isCheckingCrawl4AIStatus
									? "Checking endpoint status..."
									: crawl4aiStatus?.available
										? "Crawl4AI is reachable."
										: "Crawl4AI is unavailable. Readability fallback will be used."}
							</p>
						</div>

						<Button
							onClick={() => {
								void handleSaveCrawl4AIUrl();
							}}
							disabled={
								isSavingCrawl4AIUrl ||
								!crawl4aiUrl.trim() ||
								crawl4aiUrl.trim() === appSettings?.crawl4aiUrl
							}
						>
							{isSavingCrawl4AIUrl ? "Saving..." : "Save Endpoint"}
						</Button>
					</div>

					<Separator />

					<div className="flex flex-col space-y-4">
						<div className="flex flex-col space-y-0.5">
							<h4 className="text-sm font-medium">Text Settings</h4>
						</div>

						<div className="flex flex-col space-y-2">
							<span className="text-xs text-muted-foreground">Font Family</span>
							<ToggleGroup
								type="single"
								value={fontSettings.fontFamily}
								onValueChange={handleFontFamilyChange}
								className="bg-muted rounded-lg w-full"
							>
								<ToggleGroupItem
									value="sans"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Sans
								</ToggleGroupItem>
								<ToggleGroupItem
									value="serif"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Serif
								</ToggleGroupItem>
								<ToggleGroupItem
									value="mono"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Mono
								</ToggleGroupItem>
							</ToggleGroup>
						</div>

						<div className="flex flex-col space-y-2">
							<span className="text-xs text-muted-foreground">Font Size</span>
							<div className="flex items-center justify-between gap-3 text-foreground">
								<Button
									variant="ghost"
									size="icon"
									onClick={handleFontSizeDecrease}
									className="size-8 text-muted-foreground hover:text-foreground"
								>
									<Minus className="h-4 w-4" />
								</Button>
								<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all duration-200"
										style={{
											width: `${((fontSettings.fontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100}%`,
										}}
									/>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleFontSizeIncrease}
									className="size-8 text-muted-foreground hover:text-foreground"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="flex flex-col space-y-2">
							<span className="text-xs text-muted-foreground">
								Article Width
							</span>
							<ToggleGroup
								type="single"
								value={fontSettings.marginWidth}
								onValueChange={handleMarginWidthChange}
								className="bg-muted rounded-lg w-full"
							>
								<ToggleGroupItem
									value="narrow"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Narrow
								</ToggleGroupItem>
								<ToggleGroupItem
									value="medium"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Medium
								</ToggleGroupItem>
								<ToggleGroupItem
									value="wide"
									className="flex-1 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
								>
									Wide
								</ToggleGroupItem>
							</ToggleGroup>
						</div>

						<Button
							variant="ghost"
							onClick={handleResetFontSettings}
							className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
						>
							<RotateCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
							Reset Text Settings
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
