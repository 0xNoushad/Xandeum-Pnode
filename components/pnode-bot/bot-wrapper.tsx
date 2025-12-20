"use client";

import { usePNodes } from "@/hooks/use-pnodes";
import { PNodeBot } from "./index";
import type { NetworkStats } from "@/lib/bot/prompts";

/**
 * Client wrapper for PNodeBot that connects to live data via usePNodes hook.
 * This component handles data fetching and passes it to the bot.
 */
export function PNodeBotWrapper() {
  const { nodes } = usePNodes({ enablePolling: true, pollingInterval: 30000 });

  // Build network stats from nodes data
  const networkStats: NetworkStats = {
    totalNodes: nodes.length,
    activeNodes: nodes.filter((n) => n.status === "Active").length,
    offlineNodes: nodes.filter((n) => n.status !== "Active").length,
    totalStake: nodes.reduce((sum, n) => sum + (n.activatedStake || 0), 0) / 1e9,
  };

  return <PNodeBot nodes={nodes} networkStats={networkStats} />;
}

export default PNodeBotWrapper;
