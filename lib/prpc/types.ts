/**
 * pRPC Types - Xandeum pNode RPC Protocol
 * Port 6000 - pNode-specific stats (get-version, get-stats, get-pods)
 */

// pRPC response types (from pNode RPC API)
export interface PRPCVersion {
    version: string;
}

// NodeStats from get-stats (flat structure as returned by API)
export interface PRPCStats {
    active_streams: number;
    cpu_percent: number;
    current_index: number;
    file_size: number;
    last_updated: number;
    packets_received: number;
    packets_sent: number;
    ram_total: number;
    ram_used: number;
    total_bytes: number;
    total_pages: number;
    uptime: number;
}

// Pod from get-pods response
export interface PRPCPod {
    address?: string;
    pubkey?: string;
    version?: string;
    last_seen?: string;
    last_seen_timestamp: number;
}

// Extended pod from get-pods-with-stats (v0.7.0+)
export interface PRPCPodWithStats extends PRPCPod {
    is_public?: boolean | null;
    rpc_port?: number | null;
    storage_committed?: number | null;
    storage_usage_percent?: number | null;
    storage_used?: number | null;
    uptime?: number | null;
}

// PodsResponse from get-pods
export interface PRPCPodsResponse {
    pods: PRPCPod[];
    total_count: number;
}

// PodsResponse from get-pods-with-stats (v0.7.0+)
export interface PRPCPodsWithStatsResponse {
    pods: PRPCPodWithStats[];
    total_count: number;
}

// Valid pRPC methods
// Note: "get-pods-with-stats" available in v0.7.0+
export type PRPCMethod = "get-pods" | "get-stats" | "get-version" | "get-pods-with-stats";

// pRPC request body
export interface PRPCRequest {
    method: PRPCMethod;
    endpoint?: string; // Optional custom endpoint (IP:port format)
}

// pRPC JSON-RPC response
export interface PRPCJsonRpcResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}
