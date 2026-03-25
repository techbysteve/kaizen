/**
 * Article extraction service
 * Mirrors the Go backend flow:
 * - validate URL
 * - fetch HTML from the best available source
 * - process that HTML through one unified Readability pipeline
 */

import { checkCrawl4AIHealth, extractWithCrawl4AI } from "./crawl4ai";
import {
	calculateReadTime,
	extractTitleFromUrl,
	extractWithReadability,
	processHtmlWithReadability,
} from "./readability";
import { settings } from "../database/db";

export interface ExtractedArticle {
	url: string;
	title: string | null;
	author: string | null;
	description: string | null;
	publishedDate: string | null;
	content: string; // Markdown
	html: string;
	imageUrl: string | null;
	readTimeMinutes: number;
}

function validateUrl(url: string) {
	if (!url.trim()) {
		throw new Error("Invalid URL");
	}

	try {
		new URL(url);
	} catch (error) {
		throw new Error(
			`Invalid URL${error instanceof Error && error.message ? `: ${error.message}` : ""}`,
		);
	}
}

/**
 * Extract article from URL
 * Tries Crawl4AI first, then falls back to direct fetch.
 * Both sources share the same processing step to stay aligned with Go.
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
	validateUrl(url);

	// Get Crawl4AI URL from settings
	const appSettings = settings.get();
	const crawl4aiUrl = appSettings.crawl4aiUrl;
	const defaultPublishedDate = new Date().toISOString();
	const fallbackTitle = extractTitleFromUrl(url);

	// Check if Crawl4AI is available
	const crawl4aiAvailable = await checkCrawl4AIHealth(crawl4aiUrl);

	if (crawl4aiAvailable) {
		console.log(`[Extraction] Using Crawl4AI for: ${url}`);
		try {
			const result = await extractWithCrawl4AI(url, crawl4aiUrl);
			const processed = processHtmlWithReadability(result.html, url, {
				fallbackTitle,
				defaultPublishedTime: defaultPublishedDate,
			});

			return {
				url: result.url || url,
				title: processed.title,
				author: processed.byline,
				description: processed.excerpt,
				publishedDate: processed.publishedTime,
				content: processed.markdown,
				html: processed.content,
				imageUrl: processed.imageUrl,
				readTimeMinutes: calculateReadTime(processed.markdown),
			};
		} catch (error) {
			console.error(`[Extraction] Crawl4AI failed:`, error);
			console.log(`[Extraction] Falling back to Readability...`);
		}
	} else {
		console.log(
			`[Extraction] Crawl4AI not available at ${crawl4aiUrl}, using Readability fallback`,
		);
	}

	// Fallback to Readability
	const result = await extractWithReadability(url);
	return {
		url: result.url,
		title: result.title,
		author: result.byline,
		description: result.excerpt,
		publishedDate: result.publishedTime,
		content: result.markdown,
		html: result.content,
		imageUrl: result.imageUrl,
		readTimeMinutes: calculateReadTime(result.markdown),
	};
}
