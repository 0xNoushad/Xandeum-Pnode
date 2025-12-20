"use client";

import { PNodeList } from "@/components/dashboard/pnode-list";
import { usePNodes } from "@/hooks/use-pnodes";
import { RefreshButton } from "@/components/refresh-button";
import { AIChatButton } from "@/components/ai-chat-button";
import { MotionDiv, AnimatedHeader } from "@/components/motion-div";
import { GeoJsonMap } from "@/components/ui/geojson-map";
import { aggregateNodesByLocation } from "@/lib/node-utils";
import { fetchXandPrice, formatPrice, type XandPrice } from "@/lib/coingecko";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { nodes, isLoading, refresh } = usePNodes({
    pollingInterval: 30000,
    enablePolling: true,
    useGossipData: true,
  });

  const [xandPrice, setXandPrice] = useState<XandPrice | null>(null);
  
  // Fetch XAND price
  useEffect(() => {
    fetchXandPrice().then(setXandPrice);
    const priceInterval = setInterval(() => {
      fetchXandPrice().then(setXandPrice);
    }, 60000);
    return () => clearInterval(priceInterval);
  }, []);

  const total = nodes.length;
  const online = nodes.filter(n => n.status === "Active").length;
  const publicNodes = nodes.filter(n => n.isPublic).length;
  const privateNodes = online - publicNodes;
  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;

  // Get locations for map markers
  const locations = aggregateNodesByLocation(nodes);
  const validLocations = locations.filter(l => l.label !== "Unknown, Unknown");
  const markers = validLocations.map(loc => ({
    lat: loc.lat,
    lng: loc.lng,
    label: loc.label,
    count: loc.count,
  }));

  // Show skeleton while loading
  if (isLoading && nodes.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
            <p className="text-zinc-500 text-sm">Xandeum network overview</p>
          </div>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 animate-pulse">
              <div className="h-3 w-16 bg-zinc-800 rounded mb-2" />
              <div className="h-7 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 h-[280px] sm:h-[350px] animate-pulse" />
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 animate-pulse">
          <div className="h-4 w-24 bg-zinc-800 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedHeader>
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
            <p className="text-zinc-500 text-sm">Xandeum network overview</p>
          </div>
          <div className="flex items-center gap-2">
            <AIChatButton />
            <RefreshButton onClick={() => refresh()} isLoading={isLoading} />
          </div>
        </header>
      </AnimatedHeader>

      {/* Stats Row */}
      <MotionDiv delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">XAND Price</div>
            <div className="text-2xl font-bold text-zinc-50">
              {xandPrice ? formatPrice(xandPrice.usd) : "—"}
            </div>
            {xandPrice && (
              <div className={`text-[10px] ${xandPrice.usd_24h_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {xandPrice.usd_24h_change >= 0 ? '+' : ''}{xandPrice.usd_24h_change.toFixed(2)}%
              </div>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Total Nodes</div>
            <div className="text-2xl font-bold text-zinc-50">{isLoading && !total ? "—" : total}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Online</div>
            <div className="text-2xl font-bold text-emerald-400">{isLoading && !total ? "—" : online}</div>
            <div className="text-[10px] text-zinc-600">{onlinePercent}%</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Public</div>
            <div className="text-2xl font-bold text-blue-400">{isLoading && !total ? "—" : publicNodes}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Private</div>
            <div className="text-2xl font-bold text-orange-400">{isLoading && !total ? "—" : privateNodes}</div>
          </div>
        </div>
      </MotionDiv>

      {/* Map with live stats */}
      <MotionDiv delay={0.15}>
        <div className="relative rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden h-[280px] sm:h-[350px]">
          <GeoJsonMap 
            markers={markers}
            markerColor="#10b981"
            showLabel={false}
          />
          
          {/* Active Nodes overlay - bottom right */}
          <div className="absolute bottom-4 right-4 px-3 py-2 bg-zinc-900/90 rounded-lg border border-white/10">
            <div className="text-xs text-zinc-500 mb-0.5">Active Nodes</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{online}</div>
          </div>
        </div>
      </MotionDiv>

      {/* Node List */}
      <MotionDiv delay={0.2} className="pb-8">
        <PNodeList nodes={nodes.slice(0, 15)} />
      </MotionDiv>
    </div>
  );
}
