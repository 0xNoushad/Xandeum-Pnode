/**
 * pRPC Constants - Centralized configuration
 * 
 * Gossip network runs on port 9001, pRPC API runs on port 6000
 * 
 * Different nodes see different subsets of the network.
 * We query multiple endpoints and merge results to get the full picture.
 * 
 * Network has ~134 pNodes (v0.5.1: 5, v0.6.0: 128, unknown: 1)
 */

export const PUBLIC_PRPC_ENDPOINTS = [
    // 192.190.136.x cluster - official Xandeum nodes (v0.7.0, best visibility)
    { host: "192.190.136.36", port: 6000 },
    { host: "192.190.136.37", port: 6000 },
    { host: "192.190.136.38", port: 6000 },
    { host: "192.190.136.28", port: 6000 },
    { host: "192.190.136.29", port: 6000 },
    // Contabo nodes - often have good network visibility
    { host: "173.212.220.65", port: 6000 },
    { host: "173.212.203.145", port: 6000 },
    { host: "173.212.207.32", port: 6000 },
    { host: "161.97.97.41", port: 6000 },
    // Additional community nodes
    { host: "45.84.138.110", port: 6000 },
    { host: "5.189.133.204", port: 6000 },
    { host: "167.235.115.210", port: 6000 },
] as const;

export const PRPC_DEFAULT_PORT = 6000;
export const PRPC_TIMEOUT = 10000; // 10 seconds - some nodes are slow

export const PRPC_METHODS = ["get-pods", "get-stats", "get-version", "get-pods-with-stats"] as const;
