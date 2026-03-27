import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	EyeOff,
	LoaderCircle,
	X,
} from "lucide-react";
import { toast } from "sonner";

import appLogo from "@/assets/icon.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/features/users/api";
import { userKeys, useCurrentUser, useUsers } from "@/features/users/hooks";
import type { User } from "@/lib/api/client";

function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(new Error("Failed to read image"));
		reader.readAsDataURL(file);
	});
}

export function OnboardingPage({
	onComplete,
}: {
	onComplete?: (user: User) => void;
}) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data: user } = useCurrentUser();
	const { data: users = [] } = useUsers();
	const [username, setUsername] = useState(() => user?.username ?? "");
	const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(
		() => user?.profilePhotoDataUrl ?? null,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isProcessingImage, setIsProcessingImage] = useState(false);

	const trimmedUsername = username.trim();

	const handlePhotoSelection = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file");
			event.target.value = "";
			return;
		}

		setIsProcessingImage(true);
		try {
			const dataUrl = await readFileAsDataUrl(file);
			setPhotoDataUrl(dataUrl);
		} catch (error) {
			console.error("Failed to process profile photo:", error);
			toast.error("Could not load that image");
		} finally {
			setIsProcessingImage(false);
			event.target.value = "";
		}
	};

	const handleSubmit = async () => {
		if (!trimmedUsername) {
			toast.error("Please enter a username");
			return;
		}

		setIsSaving(true);
		try {
			const updatedUser = await usersApi.updateCurrent({
				username: trimmedUsername,
				profilePhotoDataUrl: photoDataUrl,
				onboardingCompleted: true,
			});

			queryClient.setQueryData(userKeys.current(), updatedUser);
			await queryClient.invalidateQueries({ queryKey: userKeys.list() });

			toast.success(`Welcome, ${trimmedUsername}`);
			if (updatedUser) {
				onComplete?.(updatedUser);
			}
		} catch (error) {
			console.error("Failed to save onboarding settings:", error);
			toast.error("Could not save your profile");
		} finally {
			setIsSaving(false);
		}
	};

	const hasMultipleUsers = users.length > 1;

	const handleGoBack = async () => {
		if (!user?.id || hasMultipleUsers) {
			try {
				await usersApi.delete(user?.id ?? "");
			} catch (error) {
				console.error("Failed to cancel account creation:", error);
			}
		}
		await queryClient.invalidateQueries();
	};

	return (
		<main className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/40 dark:bg-background">
			<section className="relative flex w-full flex-col justify-center overflow-hidden p-8 lg:w-1/2 lg:p-24 border-b border-border bg-card lg:border-r lg:border-b-0 dark:bg-[oklch(0.13_0.03_272)] dark:border-b-0">
				<div className="pointer-events-none absolute -left-[10%] -top-[10%] size-96 rounded-full blur-[120px] bg-primary/10 dark:bg-primary/15" />
				<div className="pointer-events-none absolute -bottom-[10%] right-[10%] size-64 rounded-full blur-[100px] bg-secondary/50 dark:bg-primary/8" />
				<div className="pointer-events-none absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_45%)]" />

				<div className="relative z-10 max-w-xl xl:max-w-2xl">
					<div className="mb-8 inline-flex items-center gap-4">
						<img
							src={appLogo}
							alt="Kaizen logo"
							className="size-12 rounded-xl object-cover"
						/>
						<p className="text-left text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							Kaizen
						</p>
					</div>
					<h1 className="mb-8 font-extrabold text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl xl:text-7xl">
						Your personal{" "}
						<span className="text-primary">knowledge sanctuary.</span>
					</h1>
					<p className="mb-12 font-light text-lg leading-relaxed text-muted-foreground lg:text-xl">
						Escape the noise of the modern web. Curate, reflect, and grow with a
						read&#8209;later experience designed for focus.
					</p>

					<div className="grid grid-cols-1 gap-6">
						<FeatureRow
							icon={<BookOpen className="size-5 text-primary" />}
							title="Intentional Reading"
						>
							Distraction-free environment for deep work.
						</FeatureRow>
						<FeatureRow
							icon={<EyeOff className="size-5 text-primary/70" />}
							title="Minimalist Zen"
						>
							Beautiful editorial layouts that prioritise content.
						</FeatureRow>
					</div>
				</div>
			</section>

			<section className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-24 bg-muted/20 dark:bg-background">
				<div className="w-full max-w-md">
					{hasMultipleUsers && (
						<Button
							type="button"
							variant="link"
							size="icon"
							onClick={() => {
								handleGoBack();
							}}
							className="ml-5 mb-4 gap-2 text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="size-4" />
							Go back
						</Button>
					)}
					<div className="mb-12 text-center lg:text-left">
						<h2 className="mb-2 text-3xl font-bold text-foreground">
							Create your profile
						</h2>
						<p className="text-muted-foreground">
							Set the stage for your curated experience.
						</p>
					</div>

					<form
						className="space-y-10"
						onSubmit={(event) => {
							event.preventDefault();
							void handleSubmit();
						}}
					>
						<div className="flex flex-col items-center gap-4 lg:items-start">
							{/** biome-ignore lint/a11y/noLabelWithoutControl: ignored */}
							<label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
								Profile Image
							</label>

							<Button
								type="button"
								variant="outline"
								size="icon-lg"
								onClick={() => fileInputRef.current?.click()}
								disabled={isProcessingImage}
								className="group relative size-32 overflow-hidden rounded-xl border-dashed p-0 shadow-none hover:border-primary/40 bg-background hover:bg-background dark:bg-muted dark:hover:bg-muted"
								aria-label="Add a profile image"
							>
								{photoDataUrl ? (
									<img
										src={photoDataUrl}
										alt="Selected profile"
										className="size-full object-cover"
									/>
								) : (
									<div className="flex size-full flex-col items-center justify-center gap-2">
										{isProcessingImage ? (
											<LoaderCircle className="size-7 animate-spin text-muted-foreground" />
										) : (
											<>
												<span className="text-2xl text-muted-foreground transition-transform group-hover:scale-110">
													+
												</span>
												<span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 transition-colors group-hover:text-primary">
													Browse
												</span>
											</>
										)}
										<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
									</div>
								)}
							</Button>

							{photoDataUrl && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setPhotoDataUrl(null)}
									className="gap-1.5"
								>
									<X className="size-3.5" />
									Remove photo
								</Button>
							)}

							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(event) => {
									void handlePhotoSelection(event);
								}}
							/>
						</div>

						<div className="space-y-3">
							<label
								htmlFor="username"
								className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
							>
								Choose a Username
							</label>
							<div className="relative">
								<Input
									id="username"
									value={username}
									maxLength={32}
									placeholder="Curator Name"
									onChange={(event) => setUsername(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											void handleSubmit();
										}
									}}
									className="h-12 rounded-xl pl-5 pr-12 shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-primary/40 border-border bg-background dark:bg-muted/60"
								/>
							</div>
							<p className="px-1 text-[11px] text-muted-foreground/70">
								This will be your unique handle in the Kaizen ecosystem.
							</p>
						</div>

						<div className="pt-2">
							<Button
								type="submit"
								size="lg"
								disabled={isSaving || !trimmedUsername}
								className="group w-full py-6 font-bold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/10 dark:shadow-2xl dark:shadow-primary/20"
							>
								{isSaving ? (
									<>
										<LoaderCircle className="animate-spin" />
										Saving profile...
									</>
								) : (
									<>
										Save and Start Reading
										<ArrowRight className="transition-transform group-hover:translate-x-1" />
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</section>
		</main>
	);
}

function FeatureRow({
	icon,
	title,
	children,
}: {
	icon: ReactNode;
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center gap-4">
			<div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm dark:border-0 dark:bg-muted/30 dark:shadow-none">
				{icon}
			</div>
			<div>
				<h3 className="font-bold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground">{children}</p>
			</div>
		</div>
	);
}
