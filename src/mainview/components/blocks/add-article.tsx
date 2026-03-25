import { useState } from "react";
import { Plus } from "lucide-react";
import {
	InputGroup,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { useCreateArticle } from "@/hooks";

function sanitizeUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const trackingParams = [
			"ref",
			"utm_source",
			"utm_medium",
			"utm_campaign",
			"utm_term",
			"utm_content",
			"fbclid",
			"gclid",
			"source",
			"medium",
			"campaign",
		];

		trackingParams.forEach((param) => {
			urlObj.searchParams.delete(param);
		});

		return urlObj.toString();
	} catch {
		return url;
	}
}

export function AddArticle({
	onAdding,
}: {
	onAdding?: (isAdding: boolean) => void;
}) {
	const [url, setUrl] = useState("");
	const createArticle = useCreateArticle();
	const isPending = createArticle.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url?.trim()) return;

		onAdding?.(true);
		try {
			const sanitizedUrl = sanitizeUrl(url);
			await createArticle.mutateAsync(sanitizedUrl);
			setUrl("");
		} finally {
			onAdding?.(false);
		}
	};

	return (
		<div className="mb-4 sm:mb-6">
			<div className="flex flex-col">
				<p className="text-foreground text-sm sm:text-base font-medium leading-normal pb-2">
					Add new article
				</p>

				<form onSubmit={handleSubmit}>
					<InputGroup className="rounded-xl h-12 sm:h-14">
						<InputGroupInput
							id="article-url"
							name="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="Paste an article URL here..."
							type="url"
							autoComplete="off"
						/>
						<InputGroupButton
							type="submit"
							variant="default"
							disabled={isPending}
							className="px-3 sm:px-5 rounded-r-xl h-12 sm:h-14 cursor-pointer"
						>
							<span className="h-6 w-6">
								<Plus className="size-6" />
							</span>
						</InputGroupButton>
					</InputGroup>
				</form>
			</div>
		</div>
	);
}
