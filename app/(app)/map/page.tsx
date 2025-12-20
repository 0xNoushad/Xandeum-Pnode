import { fetchPNodes, fetchNetworkStats } from "@/lib/xandeum";
import { MapPageClient } from "@/components/map-page-client";
import { 
    filterNodesWithValidCoordinates, 
    aggregateNodesByLocation 
} from "@/lib/node-utils";

// Force dynamic rendering - don't try to fetch during build
export const dynamic = "force-dynamic";

export default async function MapPage() {
    const [nodes, networkStats] = await Promise.all([
        fetchPNodes(),
        fetchNetworkStats(),
    ]);
    
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
                totalStake: networkStats.totalStake,
                tps: networkStats.tps,
            }}
        />
    );
}
