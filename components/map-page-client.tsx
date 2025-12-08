"use client"

import { WorldMap } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Globe, MapPin, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Location {
    lat: number;
    lng: number;
    label: string;
    count: number;
}

interface MapPageClientProps {
    nodes: {
        pubkey: string;
        status: string;
        location: string;
        coordinates: [number, number];
    }[];
    locations: Location[];
    regionStats: { name: string; count: number; percentage: number }[];
    activeNodes: number;
    totalRegions: number;
    networkStats?: {
        totalStake: number;
        tps: number;
    };
}

export function MapPageClient({
    nodes,
    locations,
    regionStats,
    activeNodes,
    totalRegions,
    networkStats,
}: MapPageClientProps) {
    // Filter out unknown locations
    const validLocations = locations.filter(l => l.label !== "Unknown, Unknown");
    
    return (
        <div className="space-y-4 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Node Locations</h1>
                            <Badge variant="outline" className="text-[10px] sm:text-xs border-emerald-500/30 text-emerald-400">
                                Real IP Data
                            </Badge>
                        </div>
                        <p className="text-zinc-500 text-xs sm:text-sm">
                            {nodes.length} pNodes across {totalRegions} locations
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                            <span className="text-xs sm:text-sm font-medium text-emerald-400">{activeNodes} Active</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-zinc-800 border border-zinc-700">
                            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                            <span className="text-xs sm:text-sm font-medium text-zinc-300">{totalRegions} Locations</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <Card className="h-[300px] sm:h-[400px] lg:h-[500px] p-0 overflow-hidden border-white/10 bg-zinc-900/50">
                <WorldMap locations={validLocations} />
            </Card>

            {/* Stats Grid - Simple cards on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {regionStats.slice(0, 5).map((region, index) => (
                    <Card 
                        key={region.name}
                        className={`p-3 sm:p-4 border-white/10 bg-zinc-900/50 ${
                            index === 0 ? "ring-1 ring-emerald-500/30" : ""
                        }`}
                    >
                        <div className="text-lg sm:text-2xl font-bold text-white mb-1">{region.count}</div>
                        <div className="text-xs sm:text-sm text-zinc-400 truncate">{region.name}</div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                            <div
                                className={`h-full rounded-full ${index === 0 ? "bg-emerald-500" : "bg-zinc-600"}`}
                                style={{ width: `${region.percentage}%` }}
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {/* More Locations - Collapsible list */}
            {regionStats.length > 5 && (
                <Card className="border-white/10 bg-zinc-900/50">
                    <div className="p-3 sm:p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">All Locations</h3>
                            <span className="text-xs text-zinc-500">({regionStats.length})</span>
                        </div>
                    </div>
                    <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {regionStats.slice(5).map((region) => (
                            <div 
                                key={region.name}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                            >
                                <span className="text-xs sm:text-sm text-zinc-300 truncate mr-2">{region.name}</span>
                                <span className="text-xs sm:text-sm font-medium text-zinc-400">{region.count}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Network Stats */}
            {networkStats && (
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 sm:p-4 border-white/10 bg-zinc-900/50">
                        <div className="text-xs text-zinc-500 mb-1">Total Stake</div>
                        <div className="text-lg sm:text-xl font-bold text-white">
                            {(networkStats.totalStake / 1e9).toFixed(2)}B
                        </div>
                        <div className="text-xs text-zinc-500">XAND</div>
                    </Card>
                    <Card className="p-3 sm:p-4 border-white/10 bg-zinc-900/50">
                        <div className="text-xs text-zinc-500 mb-1">TPS</div>
                        <div className="text-lg sm:text-xl font-bold text-emerald-400">
                            {networkStats.tps.toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">transactions/sec</div>
                    </Card>
                </div>
            )}
        </div>
    );
}
