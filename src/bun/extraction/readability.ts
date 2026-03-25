/**
 * Readability-based article extraction (fallback)
 *
 * This mirrors the cleanup flow used in kaizen-go more closely:
 * - fetch raw HTML
 * - remove noisy containers before parsing
 * - run Mozilla Readability on cleaned HTML
 * - normalize image URLs
 * - decode embedded/proxied image URLs
 * - convert cleaned article HTML to Markdown
 */

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

export interface ReadabilityResult {
	url: string;
	title: string | null;
	byline: string | null;
	content: string; // Clean article HTML
	textContent: string;
	excerpt: string | null;
	siteName: string | null;
	publishedTime: string | null;
	imageUrl: string | null;
}

export interface ProcessHtmlOptions {
	fallbackTitle?: string | null;
	defaultPublishedTime?: string | null;
}

const FETCH_TIMEOUT_MS = 30_000;
const WINDOWS_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36";

const turndown = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	emDelimiter: "*",
	bulletListMarker: "-",
});

function getMathAnnotation(node: Node): string | null {
	if (node.nodeType !== 1) {
		return null;
	}

	const element = node as Element;
	const annotation = element.querySelector(
		'annotation[encoding="application/x-tex"], annotation[encoding="application/x-latex"]',
	);
	const latex = annotation?.textContent?.trim();

	return latex || null;
}

turndown.addRule("displayMath", {
	filter: (node) => {
		if (node.nodeType !== 1) {
			return false;
		}

		const element = node as Element;
		const isKatexDisplay = element.classList.contains("katex-display");
		const isBlockMathMl =
			element.localName === "math" &&
			element.getAttribute("display") === "block";

		return (
			(isKatexDisplay || isBlockMathMl) && Boolean(getMathAnnotation(node))
		);
	},
	replacement: (_content, node) => {
		const latex = getMathAnnotation(node);
		if (!latex) {
			return "\n\n";
		}

		return `\n\n$$\n${latex}\n$$\n\n`;
	},
});
//TODO: Give an option to the user to render inline math 
turndown.addRule("inlineMath", {
	filter: (node) => {
		if (node.nodeType !== 1) {
			return false;
		}

		const element = node as Element;
		const isInlineKatex =
			element.classList.contains("katex") &&
			!element.classList.contains("katex-display");
		const isInlineMathMl =
			element.localName === "math" &&
			element.getAttribute("display") !== "block";

		return (
			isInlineKatex || (isInlineMathMl && Boolean(getMathAnnotation(node)))
		);
	},
	replacement: (_content, node) => {
		const latex = getMathAnnotation(node);
		if (!latex) {
			return "";
		}

		return `${latex}`;
	},
});

function cleanDocument(document: Document) {
	document
		.querySelectorAll(
			"header, nav, footer, .speechify-ignore, script, style, noscript",
		)
		.forEach((node) => {
			node.remove();
		});
}

function decodeEmbeddedImageUrls(html: string): string {
	return html.replace(
		/(https?:\/\/[^"'\s]+)\/(https?%3A%2F%2F[^"'\s]+)/gi,
		(_match, _prefix, encodedUrl) => {
			try {
				return decodeURIComponent(encodedUrl);
			} catch {
				return _match;
			}
		},
	);
}

function resolveUrl(
	pageUrl: string,
	maybeRelativeUrl: string | null | undefined,
): string | null {
	if (!maybeRelativeUrl?.trim()) return null;

	try {
		return new URL(maybeRelativeUrl, pageUrl).toString();
	} catch {
		return maybeRelativeUrl;
	}
}

function normalizeArticleImages(articleHtml: string, pageUrl: string): string {
	const dom = new JSDOM(articleHtml);
	const { document } = dom.window;

	document.querySelectorAll("img").forEach((img) => {
		const src = img.getAttribute("src");
		const normalizedSrc = resolveUrl(pageUrl, src);
		if (normalizedSrc) {
			img.setAttribute("src", normalizedSrc);
		}
	});

	return decodeEmbeddedImageUrls(document.body.innerHTML);
}

function extractPublishedTime(document: Document): string | null {
	const selectors = [
		'meta[property="article:published_time"]',
		'meta[name="article:published_time"]',
		'meta[property="og:published_time"]',
		"time[datetime]",
	];

	for (const selector of selectors) {
		const element = document.querySelector(selector);
		if (!element) continue;

		const content =
			element.getAttribute("content") || element.getAttribute("datetime");
		if (content?.trim()) return content.trim();
	}

	const ldJsonBlocks = document.querySelectorAll(
		'script[type="application/ld+json"]',
	);
	for (const block of ldJsonBlocks) {
		const text = block.textContent?.trim();
		if (!text) continue;
		const match = text.match(/"datePublished"\s*:\s*"([^"]+)"/i);
		if (match?.[1]) return match[1];
	}

	return null;
}

function extractImageUrl(document: Document, pageUrl: string): string | null {
	const selectors = [
		'meta[property="og:image"]',
		'meta[name="twitter:image"]',
		"article img[src]",
		"main img[src]",
		"img[src]",
	];

	for (const selector of selectors) {
		const element = document.querySelector(selector);
		if (!element) continue;

		const value =
			element.getAttribute("content") || element.getAttribute("src") || "";
		const resolved = resolveUrl(pageUrl, value);
		if (resolved) return resolved;
	}

	return null;
}

function htmlToMarkdown(html: string): string {
	return turndown.turndown(html).trim();
}

export function extractTitleFromUrl(articleUrl: string): string {
	try {
		const parsedUrl = new URL(articleUrl);
		const path = parsedUrl.pathname.replace(/\/$/, "");
		const parts = path.split("/").filter(Boolean);
		const slug = parts[parts.length - 1];

		if (!slug) {
			return "Untitled Article";
		}

		const normalizedSlug = slug
			.replace(/-[a-f0-9]{10,}$/i, "")
			.replace(/[-_]+/g, " ")
			.trim();

		if (!normalizedSlug) {
			return "Untitled Article";
		}

		return normalizedSlug.replace(/\b\w+/g, (word: string) => {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		});
	} catch {
		return "Untitled Article";
	}
}

export function calculateReadTime(text: string): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.floor(words / 200);
	if (minutes === 0 && words > 0) {
		return 1;
	}
	return minutes;
}

export function processHtmlWithReadability(
	html: string,
	url: string,
	options?: ProcessHtmlOptions,
): ReadabilityResult & { markdown: string } {
	const dom = new JSDOM(html, { url });
	cleanDocument(dom.window.document);

	const reader = new Readability(dom.window.document, {
		keepClasses: false,
		charThreshold: 150,
	});
	const article = reader.parse();

	if (!article?.content) {
		throw new Error("Readability could not extract article content");
	}

	const normalizedContent = normalizeArticleImages(article.content, url);
	const markdown = htmlToMarkdown(normalizedContent);
	const publishedTime = extractPublishedTime(dom.window.document);
	const imageUrl = extractImageUrl(dom.window.document, url);

	return {
		url,
		title: article.title || options?.fallbackTitle || null,
		byline: article.byline || null,
		content: normalizedContent,
		textContent: article.textContent || "",
		excerpt: article.excerpt || null,
		siteName: article.siteName || null,
		publishedTime: publishedTime || options?.defaultPublishedTime || null,
		imageUrl,
		markdown,
	};
}

export async function extractWithReadability(
	url: string,
): Promise<ReadabilityResult & { markdown: string }> {
	const response = await fetch(url, {
		headers: {
			"User-Agent": WINDOWS_USER_AGENT,
		},
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch URL: ${response.status}`);
	}

	const html = await response.text();
	return processHtmlWithReadability(html, url, {
		fallbackTitle: extractTitleFromUrl(url),
		defaultPublishedTime: new Date().toISOString(),
	});
}
