/**
 * Smart Bot Responses
 * Pattern matching for Xandeum questions + CoinGecko price data
 * Pubkey lookups handled client-side in bot component
 */

import { fetchXandPrice, formatPrice } from "@/lib/coingecko";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function createChatCompletion(messages: ChatMessage[]): Promise<string> {
  const userMessage = messages.filter(m => m.role === "user").pop()?.content || "";
  const systemContext = messages.find(m => m.role === "system")?.content || "";
  
  const statsMatch = systemContext.match(/Total Nodes: (\d+)[\s\S]*?Active: (\d+)[\s\S]*?Offline: (\d+)/);
  const totalNodes = statsMatch ? statsMatch[1] : "250+";
  const activeNodes = statsMatch ? statsMatch[2] : "240+";
  const offlineNodes = statsMatch ? statsMatch[3] : "10";

  return getSmartResponse(userMessage, { totalNodes, activeNodes, offlineNodes });
}

interface NetworkInfo {
  totalNodes: string;
  activeNodes: string;
  offlineNodes: string;
}

async function getSmartResponse(message: string, network: NetworkInfo): Promise<string> {
  const lower = message.toLowerCase();
  
  if (lower.includes("address") || lower.includes("pubkey") || lower.includes("lookup") || lower.includes("check node") || lower.includes("find node")) {
    return "Paste a **pubkey** and I'll show you the node info.";
  }

  if (lower.includes("price") || lower.includes("worth") || lower.includes("value") || lower.includes("cost")) {
    try {
      const price = await fetchXandPrice();
      if (price) {
        const changeSign = price.usd_24h_change >= 0 ? "+" : "";
        return `**XAND**\n\nPrice: **${formatPrice(price.usd)}**\n24h: ${changeSign}${price.usd_24h_change.toFixed(2)}%\nMCap: ${(price.usd_market_cap / 1e6).toFixed(2)}M`;
      }
    } catch {}
    return "Check [CoinGecko](https://coingecko.com/en/coins/xandeum) or [Jupiter](https://jup.ag) for XAND price.";
  }

  if (lower.includes("swap") || lower.includes("trade") || lower.includes("buy") || lower.includes("sell") || lower.includes("exchange")) {
    return "**Swap XAND**\n\n1. Go to [Jupiter](https://jup.ag)\n2. Connect wallet\n3. Swap SOL / XAND\n\nOr use the **Swap page** in sidebar.";
  }

  if (lower.includes("how many") || lower.includes("stats") || lower.includes("status") || lower.includes("network")) {
    return `**Network**\n\nTotal: **${network.totalNodes}**\nOnline: **${network.activeNodes}**\nOffline: **${network.offlineNodes}**\n\nSee [Dashboard](/dashboard) for more.`;
  }

  if (lower.includes("what is xandeum") || lower.includes("about xandeum")) {
    return "**Xandeum** - decentralized storage blockchain.\n\n**pNodes** = physical hardware\n**Pods** = storage units\n**XAND** = native token";
  }

  if (lower.includes("what is xand") || lower.includes("xand token")) {
    try {
      const price = await fetchXandPrice();
      if (price) {
        return `**XAND** = Xandeum token\n\nPrice: **${formatPrice(price.usd)}**\nFor staking & rewards\nTrade on [Jupiter](https://jup.ag)`;
      }
    } catch {}
    return "**XAND** = Xandeum's native token for staking & rewards. Trade on [Jupiter](https://jup.ag).";
  }

  if (lower.includes("pnode") || lower.includes("node")) {
    if (lower.includes("run") || lower.includes("setup")) {
      return "**Run a pNode**\n\n1. Hardware specs\n2. Stable internet\n3. XAND stake\n\nSee [docs](https://docs.xandeum.com)";
    }
    return `**pNodes** = physical nodes\n\nTotal: **${network.totalNodes}**\nOnline: **${network.activeNodes}**\n\nSee [Nodes page](/nodes)`;
  }

  if (lower.includes("pod")) {
    return "**Pods** = storage units on pNodes.\n\nMultiple pods per node, handling data storage.";
  }

  if (lower.includes("stake") || lower.includes("staking") || lower.includes("earn")) {
    return "**Stake XAND**\n\nSecure the network\nEarn rewards\nRun pNodes\n\nSee [docs](https://docs.xandeum.com)";
  }

  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("sup") || lower.includes("yo")) {
    return `Hey!\n\nI help with:\nNode lookup (paste pubkey)\nNetwork stats\nXAND price\nSwap help\n\nWhat's up?`;
  }

  if (lower.includes("thank")) {
    return "No problem!";
  }

  if (lower.includes("help")) {
    return "**I can help with:**\n\nPaste a **pubkey** for node info\n\"price\" for XAND price\n\"stats\" for network info\n\"swap\" for how to trade";
  }

  return `Ask about:\nPaste **pubkey** for node info\nXAND price\nNetwork stats (${network.activeNodes} online)\nHow to swap`;
}
