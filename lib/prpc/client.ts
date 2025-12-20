/**
 * pRPC Client - Custom implementation for Xandeum pNode RPC
 * 
 * Server-side: Uses Node.js http module (bypasses port restrictions)
 * Client-side: Uses API route proxy
 */

import http from "http";
import type { PRPCMethod, PRPCStats, PRPCVersion, PRPCPodsResponse, PRPCPodWithStats } from "./types";
import { PUBLIC_PRPC_ENDPOINTS, PRPC_DEFAULT_PORT, PRPC_TIMEOUT } from "./constants";

const isServer = typeof window === "undefined";

function getBaseUrl(): string {
    if (!isServer) return "";
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) return `https://${vercelUrl}`;
    if (process.env.NODE_ENV === "production") {
        return "https://xandeum-pnode.vercel.app";
    }
    return "http://localhost:3000";
}

/**
 * Server-side pRPC call using Node.js http module
 */
export function callPRPCServer(host: string, port: number, method: PRPCMethod): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method,
        });

        const options = {
            hostname: host,
            port,
            path: "/rpc",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
            timeout: PRPC_TIMEOUT,
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) {
                        reject(new Error(json.error.message || "pRPC Error"));
                    } else {
                        resolve(json.result);
                    }
                } catch {
                    reject(new Error(`Invalid JSON response: ${data.slice(0, 100)}`));
                }
            });
        });

        req.on("error", (e) => reject(e));
        req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
        req.write(postData);
        req.end();
    });
}

/**
 * Client-side pRPC call via API route proxy
 */
async function callPRPCClient<T>(method: PRPCMethod, endpoint?: string): Promise<T> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/prpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, endpoint }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data.result;
}

/**
 * Unified pRPC call
 */
export async function callPRPC<T>(method: PRPCMethod, host?: string, port?: number): Promise<T> {
    if (isServer && host) {
        return callPRPCServer(host, port || PRPC_DEFAULT_PORT, method) as Promise<T>;
    }
    const endpoint = host ? `${host}:${port || PRPC_DEFAULT_PORT}` : undefined;
    return callPRPCClient<T>(method, endpoint);
}

/**
 * Merge pods from multiple sources, keeping the most complete data for each pod
 */
function mergePods(allResults: PRPCPodsResponse[]): PRPCPodsResponse {
    const podsByAddress = new Map<string, PRPCPodWithStats>();
    
    for (const result of allResults) {
        for (const pod of result.pods as PRPCPodWithStats[]) {
            if (!pod.address) continue;
            
            const existing = podsByAddress.get(pod.address);
            if (!existing) {
                podsByAddress.set(pod.address, pod);
            } else {
                // Keep the one with more data (has stats, has pubkey, more recent)
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
    return { pods, total_count: pods.length };
}

/**
 * Try both get-pods and get-pods-with-stats, return the one with more data
 */
async function tryBothMethods(host: string, port: number): Promise<PRPCPodsResponse | null> {
    const [podsPromise, statsPromise] = await Promise.allSettled([
        callPRPCServer(host, port, "get-pods").catch(() => null),
        callPRPCServer(host, port, "get-pods-with-stats").catch(() => null),
    ]);
    
    const podsResult = podsPromise.status === "fulfilled" ? podsPromise.value as PRPCPodsResponse | null : null;
    const statsResult = statsPromise.status === "fulfilled" ? statsPromise.value as PRPCPodsResponse | null : null;
    
    // Return the result with more pods, preferring stats if equal
    if (statsResult?.pods?.length && podsResult?.pods?.length) {
        return statsResult.pods.length >= podsResult.pods.length ? statsResult : podsResult;
    }
    
    return statsResult || podsResult;
}

/**
 * Fetch pods from public endpoints - queries all endpoints in parallel and merges results
 */
export async function fetchPodsFromPublicEndpoints(): Promise<PRPCPodsResponse | null> {
    if (isServer) {
        // Query all endpoints in parallel, trying both methods per endpoint
        const results = await Promise.allSettled(
            PUBLIC_PRPC_ENDPOINTS.map(({ host, port }) => tryBothMethods(host, port))
        );
        
        // Collect successful results
        const successfulResults: PRPCPodsResponse[] = [];
        for (const r of results) {
            if (r.status === "fulfilled" && r.value?.pods?.length) {
                console.log(`[pRPC] Got ${r.value.pods.length} pods from endpoint`);
                successfulResults.push(r.value);
            }
        }
        
        if (successfulResults.length > 0) {
            const merged = mergePods(successfulResults);
            console.log(`[pRPC] Merged ${merged.pods.length} unique pods from ${successfulResults.length} endpoints`);
            return merged;
        }
        return null;
    }
    // Client-side goes through API route which handles merging
    return callPRPCClient<PRPCPodsResponse>("get-pods");
}

/**
 * Get pNode version
 */
export async function getPNodeVersion(host?: string, port?: number): Promise<PRPCVersion | null> {
    try {
        return await callPRPC<PRPCVersion>("get-version", host, port);
    } catch {
        return null;
    }
}

/**
 * Get pNode stats
 */
export async function getPNodeStats(host?: string, port?: number): Promise<PRPCStats | null> {
    try {
        return await callPRPC<PRPCStats>("get-stats", host, port);
    } catch {
        return null;
    }
}

/**
 * Get pods from network
 */
export async function getPods(host?: string, port?: number): Promise<PRPCPodsResponse | null> {
    try {
        if (host) {
            return await callPRPC<PRPCPodsResponse>("get-pods", host, port);
        }
        return await fetchPodsFromPublicEndpoints();
    } catch {
        return null;
    }
}

/**
 * Get pods with stats (v0.7.0+) - queries all endpoints in parallel and merges results
 * Falls back to get-pods if get-pods-with-stats fails
 */
export async function getPodsWithStats(host?: string, port?: number): Promise<PRPCPodsResponse | null> {
    try {
        if (isServer) {
            // If specific host provided, try both methods on that host
            if (host) {
                return await tryBothMethods(host, port || PRPC_DEFAULT_PORT);
            }
            
            // Query all endpoints in parallel, trying both methods
            const results = await Promise.allSettled(
                PUBLIC_PRPC_ENDPOINTS.map(({ host: h, port: p }) => tryBothMethods(h, p))
            );
            
            // Collect successful results
            const successfulResults: PRPCPodsResponse[] = [];
            for (const r of results) {
                if (r.status === "fulfilled" && r.value?.pods?.length) {
                    successfulResults.push(r.value);
                }
            }
            
            if (successfulResults.length > 0) {
                const merged = mergePods(successfulResults);
                console.log(`[pRPC] getPodsWithStats: Merged ${merged.pods.length} unique pods`);
                return merged;
            }
            return null;
        }
        // Client-side goes through API route which handles merging
        return callPRPCClient<PRPCPodsResponse>("get-pods-with-stats");
    } catch {
        return null;
    }
}

/**
 * Fetch stats from a specific pod address
 */
export async function fetchPodStats(podAddress: string): Promise<PRPCStats | null> {
    const ip = podAddress.split(':')[0];
    if (!ip) return null;
    return getPNodeStats(ip, PRPC_DEFAULT_PORT);
}

/**
 * Extract IP from gossip address
 */
export function extractIP(gossipAddress: string | null): string | null {
    if (!gossipAddress) return null;
    const match = gossipAddress.match(/^(\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
}
