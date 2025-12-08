import { fetchPNodes, fetchNetworkStats } from "@/lib/xandeum";
import { MapPageClient } from "@/components/map-page-client";
import { PNodeMetrics } from "@/lib/xandeum-rpc";

// Generate connections between nodes for visualization
function generateNodeConnections(nodes: PNodeMetrics[]) {
    // Get unique locations
    const locationMap = new Map<string, { lat: number; lng: number; label: string; count: number }>();

    nodes.forEach(node => {
        const key = node.location;
        if (locationMap.has(key)) {
            locationMap.get(key)!.count++;
        } else {
            locationMap.set(key, {
                lat: node.coordinates[0],
                lng: node.coordinates[1],
                label: node.location,
                count: 1
            });
        }
    });

    const locations = Array.from(locationMap.values());
    const connections: Array<{
        start: { lat: number; lng: number; label: string };
        end: { lat: number; lng: number; label: string };
    }> = [];

    // Create a mesh of connections between regions
    for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
            connections.push({
                start: { lat: locations[i].lat, lng: locations[i].lng, label: locations[i].label },
                end: { lat: locations[j].lat, lng: locations[j].lng, label: locations[j].label }
            });
        }
    }

    return { connections, locations };
}

export default async function MapPage() {
    const [nodes, networkStats] = await Promise.all([
        fetchPNodes(),
        fetchNetworkStats(),
    ]);
    
    const { locations } = generateNodeConnections(nodes);

    // Calculate region stats from real geolocation data
    const regionStats = locations
        .filter(loc => loc.label !== "Unknown, Unknown") // Filter out unknown locations
        .map(loc => ({
            name: loc.label,
            count: loc.count,
            percentage: (loc.count / nodes.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

    const activeNodes = nodes.filter(n => n.status === "Active").length;
    const totalRegions = locations.filter(l => l.label !== "Unknown, Unknown").length;

    return (
        <MapPageClient
            nodes={nodes}
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
