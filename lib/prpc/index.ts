/**
 * pRPC Module - Xandeum pNode RPC Protocol
 * 
 * Centralized pRPC implementation for the entire codebase.
 * Use this module for all pRPC calls instead of direct implementations.
 */

// Types
export type {
    PRPCVersion,
    PRPCStats,
    PRPCPod,
    PRPCPodWithStats,
    PRPCPodsResponse,
    PRPCPodsWithStatsResponse,
    PRPCMethod,
    PRPCRequest,
    PRPCJsonRpcResponse,
} from "./types";

// Constants
export {
    PUBLIC_PRPC_ENDPOINTS,
    PRPC_DEFAULT_PORT,
    PRPC_TIMEOUT,
    PRPC_METHODS,
} from "./constants";

// Client functions
export {
    callPRPC,
    callPRPCServer,
    fetchPodsFromPublicEndpoints,
    getPNodeVersion,
    getPNodeStats,
    getPods,
    getPodsWithStats,
    fetchPodStats,
    extractIP,
} from "./client";
