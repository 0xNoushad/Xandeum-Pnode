/**
 * Intent Detection for pNode Bot
 * Detects user intent from message content to route to appropriate handlers
 */

export type Intent = "swap" | "query" | "general";

/**
 * Keywords that indicate a swap intent
 */
const SWAP_KEYWORDS = [
  "swap",
  "exchange",
  "trade",
  "buy",
  "sell",
  "convert",
];

/**
 * Solana pubkey pattern (base58, 32-44 characters)
 */
const PUBKEY_PATTERN = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;

/**
 * Detect intent from user message
 * Returns "swap" if swap keywords are found, "query" if pubkey detected, otherwise "general"
 */
export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();

  // Check for swap keywords first (higher priority)
  if (SWAP_KEYWORDS.some((kw) => lowerMessage.includes(kw))) {
    return "swap";
  }

  // Check for node query (pubkey pattern)
  if (PUBKEY_PATTERN.test(message)) {
    return "query";
  }

  return "general";
}

/**
 * Extract pubkey from message if present
 * Returns the first valid pubkey found, or null if none
 */
export function extractPubkey(message: string): string | null {
  const match = message.match(PUBKEY_PATTERN);
  return match ? match[0] : null;
}

/**
 * Check if message contains swap-related keywords
 */
export function hasSwapKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SWAP_KEYWORDS.some((kw) => lowerMessage.includes(kw));
}

/**
 * Get all swap keywords (useful for testing)
 */
export function getSwapKeywords(): readonly string[] {
  return SWAP_KEYWORDS;
}
