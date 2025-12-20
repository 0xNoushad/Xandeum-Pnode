import { NextRequest, NextResponse } from "next/server";
import {
    PUBLIC_PRPC_ENDPOINTS,
    PRPC_METHODS,
    PRPC_DEFAULT_PORT,
    type PRPCMethod,
    type PRPCPodsResponse,
    type PRPCPodWithStats,
    callPRPCServer,
} from "@/lib/prpc";

interface PRPCRequestBody {
    method: PRPCMethod;
    endpoint?: string;
}

// Simple in-memory cache for pods data
let podsCache: { data: PRPCPodsResponse; timestamp: number; sources: string[] } | null = null;
const CACHE_TTL = 30000; // 30 seconds cache

// Try to call pRPC - try both methods and return the one with more pods
async function tryPRPCWithFallback(host: string, port: number): Promise<PRPCPodsResponse | null> {
    let podsResult: PRPCPodsResponse | null = null;
    let statsResult: PRPCPodsResponse | null = null;
    
    // Try both methods in parallel
    const [podsPromise, statsPromise] = await Promise.allSettled([
        callPRPCServer(host, port, "get-pods").catch(() => null),
        callPRPCServer(host, port, "get-pods-with-stats").catch(() => null),
    ]);
    
    if (podsPromise.status === "fulfilled" && podsPromise.value) {
        podsResult = podsPromise.value as PRPCPodsResponse;
    }
    if (statsPromise.status === "fulfilled" && statsPromise.value) {
        statsResult = statsPromise.value as PRPCPodsResponse;
    }
    
    // Return the result with more pods, preferring stats if equal
    if (statsResult?.pods?.length && podsResult?.pods?.length) {
        return statsResult.pods.length >= podsResult.pods.length ? statsResult : podsResult;
    }
    
    return statsResult || podsResult;
}

// Merge pods from multiple sources, keeping the most complete data for each pod
function mergePods(allResults: PRPCPodsResponse[]): PRPCPodsResponse {
    const podsByAddress = new Map<string, PRPCPodWithStats>();
    
    for (const result of allResults) {
        for (const pod of result.pods as PRPCPodWithStats[]) {
            if (!pod.address) continue;
            
            const existing = podsByAddress.get(pod.address);
            if (!existing) {
                podsByAddress.set(pod.address, pod);
            } else {
                // Keep the one with more data (has pubkey, has stats, more recent)
                const existingHasStats = existing.storage_committed != null;
                const newHasStats = pod.storage_committed != null;
                const existingHasPubkey = !!existing.pubkey;
                const newHasPubkey = !!pod.pubkey;
                
                // Prefer: has stats > has pubkey > more recent
                if (
                    (newHasStats && !existingHasStats) ||
                    (newHasPubkey && !existingHasPubkey && !existingHasStats) ||
                    (pod.last_seen_timestamp > existing.last_seen_timestamp && !existingHasStats)
                ) {
                    podsByAddress.set(pod.address, pod);
                }
            }
        }
    }
    
    const pods = Array.from(podsByAddress.values());
    return {
        pods,
        total_count: pods.length,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: PRPCRequestBody = await request.json();
        const { method, endpoint } = body;

        // Validate method
        if (!method || !PRPC_METHODS.includes(method)) {
            return NextResponse.json(
                { error: `Invalid method. Use: ${PRPC_METHODS.join(", ")}` },
                { status: 400 }
            );
        }

        // Custom endpoint provided - call directly
        if (endpoint) {
            const [host, portStr] = endpoint.replace(/^https?:\/\//, "").replace(/\/.*$/, "").split(":");
            const port = parseInt(portStr || String(PRPC_DEFAULT_PORT), 10);

            try {
                const result = await callPRPCServer(host, port, method);
                return NextResponse.json({ result, endpoint: `${host}:${port}` });
            } catch (error) {
                return NextResponse.json(
                    { error: `Failed to reach ${host}:${port}: ${error}` },
                    { status: 502 }
                );
            }
        }

        // get-pods or get-pods-with-stats: use cache if fresh
        if (method === "get-pods" || method === "get-pods-with-stats") {
            // Return cached data if still fresh
            if (podsCache && Date.now() - podsCache.timestamp < CACHE_TTL) {
                return NextResponse.json({
                    result: podsCache.data,
                    sources: podsCache.sources,
                    source: "cache",
                    cached: true,
                });
            }

            // Query ALL endpoints in parallel to get the full network view
            console.log(`[pRPC] Querying ${PUBLIC_PRPC_ENDPOINTS.length} endpoints in parallel...`);
            
            const startTime = Date.now();
            const results = await Promise.allSettled(
                PUBLIC_PRPC_ENDPOINTS.map(async ({ host, port }) => {
                    try {
                        const result = await tryPRPCWithFallback(host, port);
                        if (result) {
                            console.log(`[pRPC] ✓ ${host}:${port} returned ${result.pods.length} pods`);
                            return { host, port, result };
                        }
                        console.log(`[pRPC] ✗ ${host}:${port} returned empty`);
                        return null;
                    } catch (err) {
                        console.log(`[pRPC] ✗ ${host}:${port} error: ${err}`);
                        return null;
                    }
                })
            );
            console.log(`[pRPC] All queries completed in ${Date.now() - startTime}ms`);

            // Collect successful results
            const successfulResults: PRPCPodsResponse[] = [];
            const sources: string[] = [];
            const podCounts: Record<string, number> = {};
            
            for (const r of results) {
                if (r.status === "fulfilled" && r.value?.result) {
                    successfulResults.push(r.value.result);
                    const ep = `${r.value.host}:${r.value.port}`;
                    sources.push(ep);
                    podCounts[ep] = r.value.result.pods.length;
                }
            }
            
            console.log(`[pRPC] Pod counts by endpoint:`, podCounts);

            if (successfulResults.length > 0) {
                // Merge all results to get complete network view
                const merged = mergePods(successfulResults);
                console.log(`[pRPC] Merged ${merged.pods.length} unique pods from ${sources.length} endpoints`);
                
                // Cache the merged result
                podsCache = { data: merged, timestamp: Date.now(), sources };
                
                return NextResponse.json({
                    result: merged,
                    sources,
                    source: "merged",
                    endpointsQueried: PUBLIC_PRPC_ENDPOINTS.length,
                    endpointsSucceeded: sources.length,
                });
            }

            // Return stale cache if all endpoints failed
            if (podsCache) {
                console.log(`[pRPC] All endpoints failed, returning stale cache`);
                return NextResponse.json({
                    result: podsCache.data,
                    sources: podsCache.sources,
                    source: "stale-cache",
                    cached: true,
                });
            }

            return NextResponse.json(
                { error: "All public pRPC endpoints failed" },
                { status: 502 }
            );
        }

        // get-stats/get-version require endpoint
        return NextResponse.json(
            { error: "endpoint required for get-stats and get-version" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[pRPC API] Error:", error);
        return NextResponse.json(
            { error: "Failed to process pRPC request" },
            { status: 500 }
        );
    }
}
