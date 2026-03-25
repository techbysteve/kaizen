import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
	Bookmark,
	Heart,
	Archive,
	Tag,
	Search,
	Settings,
	MessageCircle,
	Check,
	ChevronsUpDown,
	Plus,
	Trash2,
} from "lucide-react";
import { routes } from "@/app/routes";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { SettingsModal } from "@/components/blocks/settings-modal";
import { usersApi } from "@/features/users/api";
import { useCurrentUser, useUsers } from "@/features/users/hooks";
import { userKeys } from "@/features/users/queries";
import { openExternalLink } from "@/lib/open-external";
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
} from "@/components/ui/alert-dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

const navigationItems = [
	{ icon: Bookmark, label: "My Library", href: routes.library },
	{ icon: Heart, label: "Favorites", href: routes.favorites },
	{ icon: Archive, label: "Archive", href: routes.archived },
	{ icon: Tag, label: "Tags", href: routes.tagging.tags },
	{ icon: Search, label: "Search", href: routes.search },
];

function getProfileName(username?: string) {
	return username?.trim() || "You";
}

export function Sidebar() {
	const [pathname, navigate] = useLocation();
	const queryClient = useQueryClient();
	const { data: user } = useCurrentUser();
	const { data: users = [] } = useUsers();
	const { setOpen, state, toggleSidebar, open, isMobile, setOpenMobile } =
		useSidebar();

	// Start collapsed on mobile or when viewing an article
	const isArticlePage = pathname.startsWith("/read");

	const initialOpen = useRef(open);
	const hasManualOverride = useRef(false);

	// Auto-collapse on article page
	useEffect(() => {
		if (hasManualOverride.current || !initialOpen.current) {
			return;
		}
		if (isArticlePage) {
			setOpen(false);
			return;
		}
		setOpen(true);
	}, [isArticlePage, setOpen]);

	const [settingsOpen, setSettingsOpen] = useState(false);
	const [accountMenuOpen, setAccountMenuOpen] = useState(false);
	const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);
	const [accountToDelete, setAccountToDelete] = useState<
		(typeof users)[number] | null
	>(null);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const profileName = getProfileName(user?.username);
	const profileInitial = profileName.charAt(0).toUpperCase() || "Y";

	const closeMobileSidebar = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const refreshForAccountChange = async (nextUserId?: string) => {
		await Promise.all([
			queryClient.invalidateQueries(),
			nextUserId
				? queryClient.refetchQueries({ queryKey: userKeys.current() })
				: Promise.resolve(),
		]);
		navigate(routes.library);
		closeMobileSidebar();
	};

	const handleSwitchAccount = async (userId: string) => {
		if (!user || user.id === userId) {
			setAccountMenuOpen(false);
			return;
		}

		setIsSwitchingAccount(true);
		try {
			const nextUser = await usersApi.switch(userId);
			queryClient.setQueryData(userKeys.current(), nextUser);
			await refreshForAccountChange(userId);
			setAccountMenuOpen(false);
		} catch (error) {
			console.error("Failed to switch account:", error);
			toast.error("Could not switch accounts");
		} finally {
			setIsSwitchingAccount(false);
		}
	};

	const handleAddAccount = async () => {
		setIsCreatingAccount(true);
		try {
			const nextUser = await usersApi.create({});
			queryClient.setQueryData(userKeys.current(), nextUser);
			await refreshForAccountChange(nextUser?.id);
			setAccountMenuOpen(false);
		} catch (error) {
			console.error("Failed to create account:", error);
			toast.error("Could not add another account");
		} finally {
			setIsCreatingAccount(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!accountToDelete) return;

		setIsDeletingAccount(true);
		try {
			const result = await usersApi.delete(accountToDelete.id);
			queryClient.setQueryData(userKeys.current(), result?.currentUser ?? null);
			await queryClient.invalidateQueries();
			navigate(routes.library);
			setAccountMenuOpen(false);
			setAccountToDelete(null);
			closeMobileSidebar();
		} catch (error) {
			console.error("Failed to delete account:", error);
			toast.error("Could not delete this account");
		} finally {
			setIsDeletingAccount(false);
		}
	};

	const getActiveState = (selectedPath: string) => {
		console.log("pathname", pathname);
		// My Library: active on "/library" OR any "/read/*" routes
		if (selectedPath === routes.library) {
			return (
				pathname === routes.library ||
				pathname.startsWith("/read") ||
				pathname.startsWith("/index.html")
			);
		}
		// Tags: active on "/tags" OR any "/tags/*" routes
		if (selectedPath === routes.tagging.tags) {
			return pathname.startsWith(routes.tagging.tags);
		}
		// Favorites: active on "/favorites"
		if (selectedPath === routes.favorites) {
			return pathname === routes.favorites;
		}
		// All other routes: exact match
		return pathname === selectedPath;
	};

	return (
		<>
			<ShadcnSidebar collapsible="icon">
				<SidebarHeader className="pt-6 gap-4">
					<Popover open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
						<PopoverTrigger asChild>
							<button
								type="button"
								className={`flex w-full items-center gap-4 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60 ${state === "collapsed" ? "justify-center" : ""}`}
								aria-label="Manage accounts"
							>
								{user?.profilePhotoDataUrl ? (
									<img
										src={user.profilePhotoDataUrl}
										alt={`${profileName} profile`}
										className="aspect-square size-10 shrink-0 rounded-full object-cover ring-2 ring-primary/10"
									/>
								) : (
									<div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
										{profileInitial}
									</div>
								)}

								{state === "expanded" && (
									<>
										<div className="flex min-w-0 flex-1 flex-col text-left text-sm leading-tight animate-in fade-in zoom-in-95 duration-200">
											<span className="truncate text-sidebar-foreground text-base font-medium leading-normal">
												{profileName}
											</span>
											<span className="text-[11px] font-medium leading-none text-muted-foreground mt-1">
												Ready to curate
											</span>
										</div>
										<ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
									</>
								)}
							</button>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							side="right"
							sideOffset={8}
							collisionPadding={16}
							className="w-80 p-3"
						>
							<div className="space-y-3">
								<div>
									<h3 className="text-sm font-semibold text-foreground">
										Accounts
									</h3>
									<p className="text-xs text-muted-foreground">
										Switch profiles or start a new one.
									</p>
								</div>

								<div className="space-y-2">
									{users.map((account) => {
										const accountName = getProfileName(account.username);
										const isActive = account.isCurrent;

										return (
											<div
												key={account.id}
												className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:bg-accent"
											>
												<button
													type="button"
													onClick={() => {
														void handleSwitchAccount(account.id);
													}}
													disabled={
														isSwitchingAccount ||
														isCreatingAccount ||
														isDeletingAccount
													}
													className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
												>
													{account.profilePhotoDataUrl ? (
														<img
															src={account.profilePhotoDataUrl}
															alt={`${accountName} profile`}
															className="size-10 rounded-full object-cover"
														/>
													) : (
														<div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
															{accountName.charAt(0).toUpperCase() || "U"}
														</div>
													)}
													<div className="min-w-0 flex-1">
														<p className="truncate text-sm font-medium text-foreground">
															{accountName}
														</p>
														<p className="truncate text-xs text-muted-foreground">
															Ready to curate
														</p>
													</div>
													{isActive && (
														<Check className="size-4 shrink-0 text-primary" />
													)}
												</button>

												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													className="shrink-0 text-muted-foreground hover:text-destructive"
													disabled={
														isSwitchingAccount ||
														isCreatingAccount ||
														isDeletingAccount
													}
													onClick={(event) => {
														event.stopPropagation();
														setAccountToDelete(account);
													}}
													aria-label={`Delete ${accountName}`}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										);
									})}
								</div>

								<Button
									type="button"
									variant="outline"
									className="w-full justify-start"
									onClick={() => {
										void handleAddAccount();
									}}
									disabled={isSwitchingAccount || isCreatingAccount}
								>
									<Plus className="size-4" />
									{isCreatingAccount ? "Adding account..." : "Add account"}
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</SidebarHeader>
				<SidebarContent className="px-4">
					<SidebarGroup className="p-0">
						<SidebarGroupContent>
							<SidebarMenu className="gap-2 mt-4">
								{navigationItems.map((item) => {
									const isActive = getActiveState(item.href);
									return (
										<SidebarMenuItem key={item.label}>
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={item.label}
												className="px-3 py-2 h-auto gap-3"
											>
												<Link href={item.href} onClick={closeMobileSidebar}>
													<item.icon className="size-5!" />
													<span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
														{item.label}
													</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter className="p-4">
					<SidebarMenu className="gap-2">
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => {
									setSettingsOpen(true);
									closeMobileSidebar();
								}}
								tooltip="Settings"
								className="px-3 py-2 h-auto gap-3"
							>
								<Settings className="size-5!" />
								<span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
									Settings
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip="Feedback"
								className="px-3 py-2 h-auto gap-3"
							>
								<a
									href="mailto:support@kaizenhq.net"
									onClick={(event) => {
										event.preventDefault();
										closeMobileSidebar();
										void openExternalLink(event.currentTarget.href);
									}}
								>
									<MessageCircle className="size-5!" />
									<span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
										Feedback
									</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip="Discord"
								className="px-3 py-2 h-auto gap-3"
							>
								<a
									href="https://discord.gg/j6nDzunVQs"
									target="_blank"
									rel="noopener noreferrer"
									onClick={(event) => {
										event.preventDefault();
										closeMobileSidebar();
										void openExternalLink(event.currentTarget.href);
									}}
								>
									<DiscordIcon className="size-5!" />
									<span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
										Discord
									</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<button
					type="button"
					onClick={() => {
						hasManualOverride.current = true;
						toggleSidebar();
					}}
					className="hidden md:flex absolute right-0 top-0 h-full w-1.5 cursor-e-resize items-center justify-center hover:bg-muted transition-colors group z-20"
					aria-label={
						state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
					}
				>
					<div className="h-8 w-1 rounded-full dark:bg-gray-600 bg-sidebar-border group-hover:bg-sidebar-border/80 transition-colors" />
				</button>
			</ShadcnSidebar>

			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
			<AlertDialog
				open={accountToDelete !== null}
				onOpenChange={(open) => {
					if (!open) {
						setAccountToDelete(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {getProfileName(accountToDelete?.username)}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes the account and all of its saved
							articles, tags, and settings from this device.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingAccount}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isDeletingAccount}
							onClick={(event) => {
								event.preventDefault();
								void handleDeleteAccount();
							}}
						>
							{isDeletingAccount ? "Deleting..." : "Delete account"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
