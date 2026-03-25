import { systemApi } from "@/features/system/api";

export async function openExternalLink(url: string) {
	try {
		const result = await systemApi.openExternal(url);
		if (result?.success) {
			return true;
		}
	} catch (error) {
		console.error("Failed to open external link via Electrobun", error);
	}

	window.open(url, "_blank", "noopener,noreferrer");
	return false;
}
