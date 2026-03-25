import { useState } from "react";
import { useLocation } from "wouter";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteTag } from "@/hooks";
import { routes } from "@/app/routes";

interface TagDeleteButtonProps {
	tagId: number;
	tagName: string;
}

export function TagDeleteButton({ tagId, tagName }: TagDeleteButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [, navigate] = useLocation();
	const deleteTag = useDeleteTag();

	const router = {
		push: navigate,
		replace: navigate,
		back: () => window.history.back(),
	};

	const handleDelete = async () => {
		await deleteTag.mutateAsync(tagId);
		router.push(routes.tagging.tags);
		setIsOpen(false);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" className="cursor-pointer">
					<Trash2 className="h-4 w-4" />
					Delete Tag
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete tag "{tagName}"?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. The tag will be permanently removed
						from all articles.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						className="cursor-pointer"
						disabled={deleteTag.isPending}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							handleDelete();
						}}
						disabled={deleteTag.isPending}
						className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
					>
						{deleteTag.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Deleting...
							</>
						) : (
							"Delete"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
