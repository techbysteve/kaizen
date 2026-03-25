/**
 * Crawl4AI integration for article extraction.
 *
 * Windows note:
 * - Kaizen runs as a Windows desktop app.
 * - Crawl4AI still runs in a Docker container via Docker Desktop.
 * - The app talks to the container through http://localhost:11235 by default.
 */

export interface Crawl4AIConfig {
	url: string;
	enableStealth?: boolean;
	waitTimeout?: number;
	headless?: boolean;
}

export interface Crawl4AIResult {
	url: string;
	html: string;
	markdown?: {
		raw_markdown?: string;
		fit_markdown?: string;
	};
	success: boolean;
	error_message?: string;
}

export interface Crawl4AIResponse {
	success?: boolean;
	results?: Crawl4AIResult[];
	error?: string;
}

export interface Crawl4AIStatus {
	available: boolean;
	url: string;
	healthUrl: string;
	playgroundUrl: string;
}

const DEFAULT_CRAWL4AI_URL = "http://localhost:11235";
const HEALTH_TIMEOUT_MS = 5_000;
const REQUEST_TIMEOUT_MS = 90_000;
const WAIT_TIMEOUT_MS = 15_000;

function normalizeCrawl4AIUrl(url?: string): string {
	const trimmed = url?.trim();
	if (!trimmed) return DEFAULT_CRAWL4AI_URL;
	return trimmed.replace(/\/+$/, "");
}

export function getCrawl4AIStatus(url?: string): Crawl4AIStatus {
	const normalizedUrl = normalizeCrawl4AIUrl(url);
	return {
		available: false,
		url: normalizedUrl,
		healthUrl: `${normalizedUrl}/health`,
		playgroundUrl: `${normalizedUrl}/playground`,
	};
}

/**
 * Check if Crawl4AI service is available.
 */
export async function checkCrawl4AIHealth(url?: string): Promise<boolean> {
	const status = getCrawl4AIStatus(url);

	try {
		const response = await fetch(status.healthUrl, {
			signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
		});
		return response.ok;
	} catch {
		return false;
	}
}

function buildCrawlRequest(
	articleUrl: string,
	config?: Partial<Crawl4AIConfig>,
) {
	return {
		urls: [articleUrl],
		browser_config: {
			type: "BrowserConfig",
			params: {
				enable_stealth: config?.enableStealth ?? true,
				headless: config?.headless ?? true,
				user_agent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
			},
		},
		crawler_run_config: {
			type: "CrawlerRunConfig",
			params: {
				wait_for_images: true,
				scan_full_page: true,
				wait_timeout: config?.waitTimeout ?? WAIT_TIMEOUT_MS,
				simulate_user: true,
			},
		},
	};
}

function parseCrawlResult(data: Crawl4AIResponse): Crawl4AIResult {
	const result = data.results?.[0];

	if (!result) {
		throw new Error(data.error || "Crawl4AI returned no results");
	}

	if (!result.success) {
		throw new Error(
			result.error_message || data.error || "Crawl4AI crawl failed",
		);
	}

	return {
		url: result.url,
		html: result.html,
		markdown: result.markdown,
		success: true,
		error_message: result.error_message,
	};
}

/**
 * Extract article content using Crawl4AI.
 */
export async function extractWithCrawl4AI(
	articleUrl: string,
	crawl4aiUrl?: string,
	config?: Partial<Crawl4AIConfig>,
): Promise<Crawl4AIResult> {
	const baseUrl = normalizeCrawl4AIUrl(crawl4aiUrl);
	const response = await fetch(`${baseUrl}/crawl`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(buildCrawlRequest(articleUrl, config)),
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!response.ok) {
		const responseText = await response.text().catch(() => "");
		throw new Error(
			`Crawl4AI request failed: ${response.status}${responseText ? ` - ${responseText.slice(0, 200)}` : ""}`,
		);
	}

	const data = (await response.json()) as Crawl4AIResponse;
	return parseCrawlResult(data);
}

export { DEFAULT_CRAWL4AI_URL };
