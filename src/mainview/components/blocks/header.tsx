import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

interface HeaderProps {
	title: string;
	children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
	return (
		<header className="sm:px-0 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center justify-between gap-3 sm:gap-4 mb-6">
			<div className="flex items-center w-full sm:w-auto text-left justify-start gap-2">
				<div className="md:hidden">
					<SidebarTrigger className="justify-normal!" />
				</div>
				<h1 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] w-full sm:w-auto">
					{title}
				</h1>
			</div>
			{children && (
				<div className="mt-4 sm:mt-0 w-full sm:w-auto">{children}</div>
			)}
		</header>
	);
}
