"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Bot, X, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { detectIntent } from "@/lib/bot/intent";
import type { PNodeMetrics } from "@/lib/xandeum-rpc";
import type { NetworkStats } from "@/lib/bot/prompts";
import type { ChatMessage as APIChatMessage } from "@/lib/bot/huggingface";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface PNodeBotProps {
  nodes?: PNodeMetrics[];
  networkStats?: NetworkStats;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm the pNode Bot. Ask me about the Xandeum network, node stats, or anything about XAND.",
};

const STORAGE_KEY = "pnode-bot-history";

// Extract pubkey pattern from message (32-44 base58 chars)
function extractPubkey(message: string): string | null {
  const match = message.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  return match ? match[0] : null;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Build node info response from actual node data
function buildNodeResponse(node: PNodeMetrics): string {
  const shortKey = `${node.pubkey.slice(0, 6)}...${node.pubkey.slice(-4)}`;
  const typeLabel = node.isPublic ? "Public" : "Private";
  
  let response = `**Node: ${shortKey}**\n\n`;
  response += `Status: **${node.status}**\n`;
  response += `Type: **${typeLabel}**\n`;
  response += `Version: **${node.version}**\n`;
  response += `Location: **${node.location}**\n`;
  
  if (node.storage && node.storage.capacity > 0) {
    const usedStr = formatBytes(node.storage.used);
    const capStr = formatBytes(node.storage.capacity);
    const pct = ((node.storage.used / node.storage.capacity) * 100).toFixed(1);
    response += `Storage: **${usedStr}** / ${capStr} (${pct}%)\n`;
  }
  
  if (node.uptimePercentage) {
    response += `Uptime: **${node.uptimePercentage.toFixed(1)}%**\n`;
  }
  
  response += `\n**Links:**\n`;
  response += `[Dashboard](/nodes/${node.pubkey})\n`;
  response += `[Xandeum Explorer](https://explorer.solana.com/address/${node.pubkey}?cluster=custom&customUrl=https://api.xandeum.com:8899)\n`;
  response += `[Solscan](https://solscan.io/account/${node.pubkey})`;
  
  return response;
}

// Build "not found" response with links
function buildNotFoundResponse(pubkey: string): string {
  const shortKey = `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
  
  let response = `**Node: ${shortKey}**\n\n`;
  response += `Not found in network gossip data.\n\n`;
  response += `**Check these links:**\n`;
  response += `[Xandeum Explorer](https://explorer.solana.com/address/${pubkey}?cluster=custom&customUrl=https://api.xandeum.com:8899)\n`;
  response += `[Solscan](https://solscan.io/account/${pubkey})`;
  
  return response;
}

// Load history from localStorage
function loadHistory(): Message[] {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return [WELCOME_MESSAGE];
}

// Save history to localStorage
function saveHistory(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep last 50 messages max
    const toSave = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore errors
  }
}

export function PNodeBot({ nodes = [], networkStats }: PNodeBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Load history on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const history = loadHistory();
      setMessages(history);
    }
  }, []);

  // Save history when messages change
  useEffect(() => {
    if (initialized.current && messages.length > 0) {
      saveHistory(messages);
    }
  }, [messages]);

  // Listen for global open event
  useEffect(() => {
    const handleOpenBot = () => setIsOpen(true);
    window.addEventListener("open-pnode-bot", handleOpenBot);
    return () => window.removeEventListener("open-pnode-bot", handleOpenBot);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      
      // Check for pubkey lookup FIRST - handle client-side with real node data
      const pubkey = extractPubkey(content);
      if (pubkey && pubkey.length >= 32) {
        const node = nodes.find((n) => n.pubkey === pubkey);
        const response = node ? buildNodeResponse(node) : buildNotFoundResponse(pubkey);
        setMessages((prev) => [
          ...prev,
          { id: `assistant-node-${Date.now()}`, role: "assistant", content: response },
        ]);
        return;
      }
      
      // Check for swap intent - redirect to swap page
      const intent = detectIntent(content);
      if (intent === "swap") {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-swap-${Date.now()}`,
            role: "assistant",
            content: "Let's get you swapping! \n\n[Go to Swap Page →](/swap)\n\nYou can swap any token ↔ XAND there using Jupiter aggregator with the best rates. Make sure your wallet is connected!",
          },
        ]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const history: APIChatMessage[] = messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        const stats: NetworkStats = networkStats || {
          totalNodes: nodes.length,
          activeNodes: nodes.filter((n) => n.status === "Active").length,
          offlineNodes: nodes.filter((n) => n.status !== "Active").length,
          totalStake: nodes.reduce((sum, n) => sum + (n.activatedStake || 0), 0) / 1e9,
        };

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, history, networkStats: stats }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const text = await response.text();
        
        setMessages((prev) => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: "assistant", content: text },
        ]);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I had trouble processing that. Please try again.",
          },
        ]);
      }
    },
    [messages, nodes, networkStats]
  );

  return (
    <>
      {/* Floating Action Button - hide when sidebar is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "h-14 w-14 rounded-full",
            "bg-emerald-600/20 border border-emerald-500/30",
            "flex items-center justify-center",
            "text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300",
            "shadow-lg shadow-emerald-500/10",
            "transition-all duration-200"
          )}
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Right Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-40",
          "w-[380px] max-w-full",
          "bg-zinc-900 border-l border-white/10",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">pNode Bot</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Xandeum Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {isLoading && <TypingIndicator />}
          {error && (
            <div className="text-xs text-red-400 text-center py-2">{error}</div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Xandeum..."
              disabled={isLoading}
              className="flex-1 h-10 px-4 rounded-xl bg-zinc-800/50 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop - click to close, blur background */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm cursor-pointer"
        />
      )}
    </>
  );
}

export default PNodeBot;
