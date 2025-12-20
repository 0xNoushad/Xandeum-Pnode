"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, ExternalLink, Wallet } from "lucide-react";

/**
 * Jupiter Terminal configuration
 * @see https://station.jup.ag/docs/jupiter-terminal/terminal-integration-guide
 */
interface JupiterTerminalConfig {
  displayMode: "integrated" | "modal" | "widget";
  integratedTargetId: string;
  endpoint: string;
  strictTokenList: boolean;
  defaultExplorer: "solscan" | "solana-explorer" | "solana-beach";
  formProps: {
    initialInputMint?: string;
    initialOutputMint?: string;
    fixedInputMint?: boolean;
    fixedOutputMint?: boolean;
    initialAmount?: string;
    fixedAmount?: boolean;
    swapMode?: "ExactIn" | "ExactOut";
  };
  containerStyles?: Record<string, string>;
  containerClassName?: string;
}

declare global {
  interface Window {
    Jupiter?: {
      init: (config: JupiterTerminalConfig) => void;
      close: () => void;
      resume: () => void;
      _instance?: unknown;
    };
  }
}

// Token mint addresses
const SOL_MINT = "So11111111111111111111111111111111111111112";
// XAND token mint address on Solana mainnet
const XAND_MINT = "XANDnSwNcqNA1voFqyxMpMmuMgCbvfzPPiLgLfJvAwn";

export interface SwapQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  route: string[];
}

export interface SwapWidgetProps {
  onClose?: () => void;
  onSwapComplete?: (txId: string) => void;
  onSwapError?: (error: SwapError) => void;
  initialDirection?: "sol-to-xand" | "xand-to-sol";
}

export interface SwapError {
  type: "no_wallet" | "insufficient_balance" | "slippage" | "transaction_failed" | "load_error";
  message: string;
}

export const SWAP_ERROR_MESSAGES: Record<SwapError["type"], string> = {
  no_wallet: "Connect your wallet to swap tokens.",
  insufficient_balance: "Not enough balance for this swap.",
  slippage: "Price moved too much. Try increasing slippage tolerance.",
  transaction_failed: "Transaction failed. Please try again.",
  load_error: "Failed to load swap interface. Please try again.",
};

/**
 * Jupiter Terminal Swap Widget
 * Embeds Jupiter Terminal for SOL/XAND swaps
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
export function SwapWidget({
  onClose: _onClose,
  onSwapComplete: _onSwapComplete,
  onSwapError,
  initialDirection = "sol-to-xand",
}: SwapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SwapError | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(() => {
    // Check if script already loaded on initial render
    return typeof window !== "undefined" && !!window.Jupiter;
  });

  // Load Jupiter Terminal script
  useEffect(() => {
    // Script already loaded
    if (isScriptLoaded) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="jupiter-terminal"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://terminal.jup.ag/main-v3.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      setError({
        type: "load_error",
        message: SWAP_ERROR_MESSAGES.load_error,
      });
      setIsLoading(false);
    };
    document.head.appendChild(script);

    // Load Jupiter Terminal CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://terminal.jup.ag/main-v3.css";
    document.head.appendChild(link);

    return () => {
      // Cleanup Jupiter instance on unmount
      if (window.Jupiter?.close) {
        window.Jupiter.close();
      }
    };
  }, [isScriptLoaded]);

  // Initialize Jupiter Terminal when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.Jupiter) {
      return;
    }

    const containerId = "jupiter-terminal-container";
    containerRef.current.id = containerId;

    // Use requestAnimationFrame to defer state update
    const initJupiter = () => {
      try {
        const inputMint = initialDirection === "sol-to-xand" ? SOL_MINT : XAND_MINT;
        const outputMint = initialDirection === "sol-to-xand" ? XAND_MINT : SOL_MINT;

        window.Jupiter?.init({
          displayMode: "integrated",
          integratedTargetId: containerId,
          endpoint: "https://api.mainnet-beta.solana.com",
          strictTokenList: false,
          defaultExplorer: "solscan",
          formProps: {
            initialInputMint: inputMint,
            initialOutputMint: outputMint,
            fixedInputMint: false,
            fixedOutputMint: false,
            swapMode: "ExactIn",
          },
          containerStyles: {
            maxHeight: "400px",
          },
        });

        requestAnimationFrame(() => setIsLoading(false));
      } catch (err) {
        console.error("[SwapWidget] Failed to initialize Jupiter:", err);
        const swapError: SwapError = {
          type: "load_error",
          message: SWAP_ERROR_MESSAGES.load_error,
        };
        requestAnimationFrame(() => {
          setError(swapError);
          setIsLoading(false);
        });
        onSwapError?.(swapError);
      }
    };

    requestAnimationFrame(initJupiter);
  }, [isScriptLoaded, initialDirection, onSwapError]);

  // Reserved for future use - callbacks for swap lifecycle
  void _onClose;
  void _onSwapComplete;

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Force reload by removing and re-adding script
    const script = document.querySelector('script[src*="jupiter-terminal"]');
    if (script) {
      script.remove();
    }
    setIsScriptLoaded(false);
    // Trigger re-load
    const newScript = document.createElement("script");
    newScript.src = "https://terminal.jup.ag/main-v3.js";
    newScript.async = true;
    newScript.onload = () => setIsScriptLoaded(true);
    newScript.onerror = () => {
      setError({
        type: "load_error",
        message: SWAP_ERROR_MESSAGES.load_error,
      });
      setIsLoading(false);
    };
    document.head.appendChild(newScript);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
            <Wallet className="h-3 w-3 text-amber-400" />
          </div>
          <span className="text-xs font-mono text-zinc-300">
            Swap {initialDirection === "sol-to-xand" ? "SOL → XAND" : "XAND → SOL"}
          </span>
        </div>
        <a
          href="https://jup.ag"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-500 hover:text-zinc-400 flex items-center gap-1"
        >
          Powered by Jupiter
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Content */}
      <div className="relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/50">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">
              Loading swap interface...
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/50 p-4">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <span className="text-xs text-zinc-400 font-mono text-center">
              {error.message}
            </span>
            <button
              onClick={handleRetry}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-mono",
                "bg-emerald-600/20 border border-emerald-500/30",
                "text-emerald-400 hover:bg-emerald-600/30",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                "transition-colors"
              )}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Jupiter Terminal Container */}
        <div
          ref={containerRef}
          className={cn(
            "w-full",
            (isLoading || error) && "opacity-0 pointer-events-none"
          )}
        />
      </div>

      {/* Footer with wallet prompt */}
      <div className="px-4 py-2 border-t border-white/10">
        <p className="text-[10px] text-zinc-500 font-mono text-center">
          Connect your Solana wallet to swap tokens
        </p>
      </div>
    </div>
  );
}

/**
 * Format swap quote for display
 */
export function formatSwapQuote(quote: SwapQuote): string {
  const impact = quote.priceImpact < 0.01 
    ? "<0.01%" 
    : `${(quote.priceImpact * 100).toFixed(2)}%`;
  
  return `Output: ${quote.outputAmount.toFixed(4)} | Impact: ${impact}`;
}

/**
 * Check if quote has acceptable price impact
 */
export function isAcceptablePriceImpact(quote: SwapQuote, maxImpact = 0.05): boolean {
  return quote.priceImpact <= maxImpact;
}

export default SwapWidget;
