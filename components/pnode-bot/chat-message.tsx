"use client";

import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

/**
 * Renders a chat message with different styles for user and assistant
 * Supports basic markdown formatting (bold, italic, code, links)
 */
export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-emerald-600/20 text-emerald-100 border border-emerald-500/20"
            : "bg-zinc-800/50 text-zinc-200 border border-white/5"
        )}
      >
        <div className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words">
          <FormattedContent content={content} />
        </div>
      </div>
    </div>
  );
}

/**
 * Formats content with basic markdown support
 */
function FormattedContent({ content }: { content: string }) {
  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        // Multi-line code block
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).replace(/^\w+\n/, ""); // Remove language identifier
          return (
            <pre
              key={i}
              className="my-2 p-2 rounded-lg bg-zinc-900/80 border border-white/5 overflow-x-auto text-xs"
            >
              <code>{code.trim()}</code>
            </pre>
          );
        }
        // Inline code
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-zinc-900/80 text-emerald-300 text-xs"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        // Regular text with bold/italic
        return <TextWithFormatting key={i} text={part} />;
      })}
    </>
  );
}

/**
 * Handles bold, italic, and link formatting
 */
function TextWithFormatting({ text }: { text: string }) {
  // Parse links, bold, italic in order
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Find the next markdown pattern
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/\*([^*]+)\*/);

    // Find which comes first
    const matches = [
      linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      // No more patterns, add remaining text
      if (remaining) elements.push(<span key={keyIndex++}>{remaining}</span>);
      break;
    }

    const first = matches[0]!;
    
    // Add text before the match
    if (first.index > 0) {
      elements.push(<span key={keyIndex++}>{remaining.slice(0, first.index)}</span>);
    }

    // Add the formatted element
    if (first.type === 'link') {
      const [fullMatch, linkText, url] = first.match!;
      const isExternal = url.startsWith("http");
      elements.push(
        <a
          key={keyIndex++}
          href={url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
        >
          {linkText}
        </a>
      );
      remaining = remaining.slice(first.index + fullMatch.length);
    } else if (first.type === 'bold') {
      const [fullMatch, content] = first.match!;
      elements.push(
        <strong key={keyIndex++} className="font-semibold text-zinc-100">
          {content}
        </strong>
      );
      remaining = remaining.slice(first.index + fullMatch.length);
    } else if (first.type === 'italic') {
      const [fullMatch, content] = first.match!;
      elements.push(
        <em key={keyIndex++} className="italic">
          {content}
        </em>
      );
      remaining = remaining.slice(first.index + fullMatch.length);
    }
  }

  return <>{elements}</>;
}
