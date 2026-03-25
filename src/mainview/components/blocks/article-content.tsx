import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "@/components/blocks/code-block";
import { openExternalLink } from "@/lib/open-external";
import "katex/dist/katex.min.css";
import "@/components/styles/code-highlight.css";

type ArticleContentProps = {
	content: string;
};

export default function ArticleContent({ content }: ArticleContentProps) {
	return (
		<article className="prose max-w-none relative">
			<ReactMarkdown
				remarkPlugins={[
					[remarkMath, { singleDollarTextMath: false }],
					remarkGfm,
				]}
				rehypePlugins={[
					rehypeKatex,
					[
						rehypeHighlight,
						{
							detect: true,
							subset: false,
						},
					],
				]}
				components={{
					pre: CodeBlock,
					a: ({ href, children, ...props }) => (
						<a
							{...props}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(event) => {
								if (!href) {
									return;
								}

								event.preventDefault();
								void openExternalLink(href);
							}}
						>
							{children}
						</a>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</article>
	);
}
