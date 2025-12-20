"use client";

import { usePNodes, useNetworkStats } from "@/hooks/use-pnodes";
import { MapPageClient } from "@/components/map-page-client";
import { 
    filterNodesWithValidCoordinates, 
    aggregateNodesByLocation 
} from "@/lib/node-utils";

export default function MapPage() {
    const { nodes, isLoading } = usePNodes();
    const { stats } = useNetworkStats();
    
    if (isLoading || nodes.length === 0) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Loading map data...</p>
                </div>
            </div>
        );
    }
    
    // Filter out nodes with invalid coordinates (including [0, 0])
    const validNodes = filterNodesWithValidCoordinates(nodes);
    
    // Aggregate nodes by location using utility function
    const locations = aggregateNodesByLocation(nodes);

    // Calculate region stats from aggregated locations
    const regionStats = locations
        .map(loc => ({
            name: loc.label,
            count: loc.count,
            percentage: (loc.count / nodes.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

    const activeNodes = validNodes.filter(n => n.status === "Active").length;
    const totalRegions = locations.length;

    return (
        <MapPageClient
            nodes={validNodes}
            locations={locations}
            regionStats={regionStats}
            activeNodes={activeNodes}
            totalRegions={totalRegions}
            networkStats={{
                totalStake: stats?.totalStake || 0,
                tps: stats?.tps || 0,
            }}
        />
    );
}
