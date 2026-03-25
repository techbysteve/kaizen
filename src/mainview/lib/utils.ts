import { clsx, type ClassValue } from "clsx";
import Sqids from "sqids";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const extractDomain = (url: string) => {
	try {
		const domain = new URL(url).hostname.replace("www.", "");
		return domain;
	} catch {
		return url;
	}
};

const sqids = new Sqids({ minLength: 8 });

export function encodeId(id: number): string {
	return sqids.encode([id]);
}

export function decodeId(encodedId: string): string {
	const decodedIds = sqids.decode(encodedId);
	const decodedId = decodedIds[0];
	if (!decodedId) {
		throw new Error("Invalid ID");
	}
	return String(decodedId);
}

export function formatReadTime(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min read`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours} hr read`;
	}
	return `${hours} hr ${remainingMinutes} min read`;
}
