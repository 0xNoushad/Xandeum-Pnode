"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Animated typing indicator shown during API loading state
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div className="bg-zinc-800/50 border border-white/5 rounded-2xl px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
