import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

export function CodeBlock({
	children,
	...props
}: React.HTMLAttributes<HTMLPreElement>) {
	const [copied, setCopied] = useState(false);
	const preRef = useRef<HTMLPreElement>(null);

	const handleCopy = async () => {
		const code = preRef.current?.textContent || "";

		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative group">
			<button
				type="button"
				onClick={handleCopy}
				className="absolute right-2 top-2 p-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 dark:bg-[#1e1e1e] dark:hover:bg-[#2a2a2a] dark:text-[#b2b2b2] dark:hover:text-white transition-colors"
				aria-label="Copy code"
			>
				{copied ? <Check size={16} /> : <Copy size={16} />}
			</button>
			<pre ref={preRef} {...props}>
				{children}
			</pre>
		</div>
	);
}
