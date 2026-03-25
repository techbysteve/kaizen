import { Sidebar } from "@/components/blocks/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function AppLayout({ children, className = "" }: AppLayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex h-screen w-full flex-col bg-background">
				<div className="flex flex-1 overflow-hidden">
					<Sidebar />
					<main className={`flex-1 w-full overflow-auto ${className}`}>
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
