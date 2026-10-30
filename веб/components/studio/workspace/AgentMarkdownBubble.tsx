"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

type AgentMarkdownBubbleProps = {
  content: string;
  className?: string;
};

/**
 * C-carousel-agents — Dark Luxury prose for agent chat bubbles.
 * Headings / lists / bold via react-markdown + remark-gfm.
 */
export function AgentMarkdownBubble({
  content,
  className,
}: AgentMarkdownBubbleProps) {
  return (
    <div
      data-testid="agent-markdown-bubble"
      className={cn(
        "agent-md prose prose-invert max-w-none text-sm leading-relaxed",
        "[&_p]:mb-2.5 [&_p:last-child]:mb-0",
        "[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-4",
        "[&_li]:mb-1 [&_li]:leading-relaxed",
        "[&_strong]:font-semibold [&_strong]:text-[var(--text-primary)]",
        "[&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-[var(--text-primary)]",
        "[&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)]",
        "[&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
        "[&_a]:text-[var(--accent-blue-bright)] [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_code]:rounded [&_code]:bg-[rgba(255,255,255,0.06)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]",
        "[&_pre]:mb-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[rgba(0,0,0,0.35)] [&_pre]:p-2.5",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border-glass)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--text-muted)]",
        "text-[var(--text-primary)]",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
