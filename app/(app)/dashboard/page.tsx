"use client";

import { OverviewCards } from "@/components/dashboard/overview";
import { PNodeList } from "@/components/dashboard/pnode-list";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import RotatingEarth from "@/components/dashboard/rotating-earth";
import { usePNodes, useHealthAlerts } from "@/hooks/use-pnodes";
import { xandeumRPC } from "@/lib/xandeum-rpc";
import { useEffect, useState } from "react";

import { RefreshButton } from "@/components/refresh-button";
import { HealthAlerts } from "@/components/health-alerts";
import { MotionDiv, AnimatedHeader } from "@/components/motion-div";
import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkStats {
  activeNodes: number;
  totalNodes: number;
  epoch?: number;
  slot?: number;
  blockHeight?: number;
  transactionCount?: number;
  totalStake?: number;
  delinquentNodes?: number;
  tps?: number;
  circulatingSupply?: number;
}

export default function DashboardPage() {
  const { nodes, isLoading, lastUpdated, refresh, isConnected } = usePNodes({
    pollingInterval: 15000,
    enablePolling: true,
  });
  const { alerts, unreadCount, markAsRead, markAllAsRead, clearAlerts } = useHealthAlerts(nodes);

  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const realStats = await xandeumRPC.getNetworkStats();
        setStats({
          activeNodes: realStats.activeNodes,
          totalNodes: realStats.totalNodes,
          epoch: realStats.epoch,
          slot: realStats.slot,
          blockHeight: realStats.blockHeight,
          transactionCount: realStats.transactionCount,
          totalStake: realStats.totalStake,
          delinquentNodes: realStats.delinquentNodes,
          tps: realStats.tps,
          circulatingSupply: realStats.circulatingSupply,
        });
      } catch (error) {
        console.error("Failed to fetch network stats:", error);
        // Set fallback stats so UI doesn't stay blank
        setStats({
          activeNodes: 0,
          totalNodes: 0,
          epoch: 0,
          slot: 0,
          blockHeight: 0,
          transactionCount: 0,
          totalStake: 0,
          delinquentNodes: 0,
          tps: 0,
          circulatingSupply: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    // Fetch stats immediately, don't wait for nodes
    fetchStats();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <AnimatedHeader>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Analytics
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <p className="text-zinc-500 text-xs sm:text-sm">
                Xandeum network overview
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                    <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
                    <span className="text-[10px] sm:text-xs text-amber-400 font-medium">Cached</span>
                  </>
                )}
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <HealthAlerts
              alerts={alerts}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAlerts={clearAlerts}
            />
            <RefreshButton onClick={() => refresh()} isLoading={isLoading} />
          </div>
        </header>
      </AnimatedHeader>

      {statsLoading ? (
        <div className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-white/10 animate-pulse" />
      ) : stats?.epoch ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-zinc-400">Epoch</span>
            <span className="text-xs sm:text-sm font-semibold text-white">{stats.epoch}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-zinc-400">Slot</span>
            <span className="text-xs sm:text-sm font-mono text-orange-400">{stats.slot?.toLocaleString()}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-zinc-400">Block</span>
            <span className="text-sm font-mono text-cyan-400">{stats.blockHeight?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-zinc-400">TPS</span>
            <span className="text-xs sm:text-sm font-mono text-emerald-400">{stats.tps?.toFixed(1)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-zinc-400">Txns</span>
            <span className="text-sm font-mono text-blue-400">{stats.transactionCount?.toLocaleString()}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-zinc-400">Stake</span>
            <span className="text-sm font-mono text-purple-400">{stats.totalStake ? `${(stats.totalStake / 1e9).toFixed(1)}B` : "—"}</span>
          </div>
          {lastUpdated && (
            <div className="ml-auto text-[10px] sm:text-xs text-zinc-500">
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </motion.div>
      ) : null}

      <MotionDiv delay={0.1} className="space-y-6">
        {statsLoading ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 sm:h-40 rounded-2xl sm:rounded-3xl bg-zinc-900/50 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <OverviewCards stats={stats} />
        ) : (
          <div className="text-center py-8 text-zinc-500">
            Unable to load network stats. Please refresh.
          </div>
        )}
      </MotionDiv>

      <MotionDiv delay={0.2} className="grid gap-4 sm:gap-6 lg:grid-cols-7 h-auto">
        <div className="col-span-full lg:col-span-5 card-hover">
          <PerformanceChart />
        </div>
        <div className="col-span-full lg:col-span-2 min-h-[300px] sm:min-h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black shadow-sm relative flex items-center justify-center card-hover">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
            <h3 className="text-white font-semibold text-sm sm:text-base">Global Distribution</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-breathe"></span>
              <span className="text-zinc-400 text-[10px] sm:text-xs">
                {nodes.filter(n => n.status === "Active").length} Active Nodes
              </span>
            </div>
          </div>
          <RotatingEarth width={280} height={280} className="opacity-90 animate-float" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
      </MotionDiv>

      <MotionDiv delay={0.3} className="space-y-6 pb-8">
        <PNodeList nodes={nodes} />
      </MotionDiv>
    </div>
  );
}
