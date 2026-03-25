import { Loader2, CircleCheckBig, CircleMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleRead } from "@/hooks";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";

interface MarkAsReadProps {
	articleId: number;
	readStatus: boolean;
	className?: string;
}

export default function MarkAsRead({
	articleId,
	readStatus,
	className,
}: MarkAsReadProps) {
	const [isReadStatus, setIsReadStatus] = useState(readStatus);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const toggleRead = useToggleRead();
	const isLoading = toggleRead.isPending;

	const handleToggleReadStatus = async () => {
		const newStatus = !isReadStatus;
		await toggleRead.mutateAsync(articleId);

		if (!isReadStatus && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const x = (rect.left + rect.width / 2) / window.innerWidth;
			const y = (rect.top + rect.height / 2) / window.innerHeight;
			confetti({ particleCount: 50, spread: 50, origin: { x, y } });
		}
		setIsReadStatus(newStatus);
	};

	return (
		<div
			className={`mt-12 p-8 border-t border-border flex flex-col items-center justify-center gap-4 text-center ${className}`}
		>
			<p className="text-muted-foreground font-medium">
				You have reached the end of the article.
			</p>
			<Button
				ref={buttonRef}
				onClick={handleToggleReadStatus}
				variant="outline"
				className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
				disabled={isLoading}
			>
				{isLoading ? (
					<Loader2 className="w-4 h-4 animate-spin" />
				) : isReadStatus ? (
					<CircleMinus className="w-4 h-4" />
				) : (
					<CircleCheckBig className="w-4 h-4" />
				)}
				{isReadStatus ? "Mark as unread" : "Mark as read"}
			</Button>
		</div>
	);
}
