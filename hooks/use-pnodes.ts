"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    PNodeMetrics,
    PNodeDetailedMetrics,
    PRPCPod,
    xandeumRPC,
} from "@/lib/xandeum-rpc";

interface UsePNodesOptions {
    pollingInterval?: number;
    enablePolling?: boolean;
    /** Use real gossip network data instead of RPC */
    useGossipData?: boolean;
}

interface UsePNodesReturn {
    nodes: PNodeMetrics[];
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
    isConnected: boolean;
    /** Data source: "gossip" for real pods, "rpc" for cluster nodes */
    dataSource: "gossip" | "rpc";
}

/**
 * Hook for fetching and subscribing to pNode data with real-time updates
 * 
 * By default, uses real gossip network data (84+ pods).
 * Set useGossipData: false to use RPC data instead.
 */
export function usePNodes(options: UsePNodesOptions = {}): UsePNodesReturn {
    const { pollingInterval = 30000, enablePolling = false, useGossipData = true } = options;

    const [nodes, setNodes] = useState<PNodeMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [dataSource, setDataSource] = useState<"gossip" | "rpc">("gossip");

    const cleanupRef = useRef<(() => void) | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchGossipData = useCallback(async (skipGeo = false) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPodsAsPNodes(skipGeo);
            if (data.length > 0) {
                setNodes(data);
                setLastUpdated(new Date());
                setIsConnected(true);
                setDataSource("gossip");
                console.log(`[usePNodes] Fetched ${data.length} pods from gossip network`);
                return true;
            }
            return false;
        } catch {
            // Gossip fetch failed, will fall back to RPC
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRPCData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPNodes(true);
            setNodes(data);
            setLastUpdated(new Date());
            setIsConnected(true);
            setDataSource("rpc");
            console.log(`[usePNodes] Fetched ${data.length} nodes from RPC`);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch nodes"));
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refresh = useCallback(async (skipGeo = false) => {
        if (useGossipData) {
            // Try gossip first, fall back to RPC silently
            const success = await fetchGossipData(skipGeo);
            if (!success) {
                await fetchRPCData();
            }
        } else {
            await fetchRPCData();
        }
    }, [useGossipData, fetchGossipData, fetchRPCData]);

    useEffect(() => {
        // Initial fetch - skip geo for faster load, then fetch with geo
        refresh(true).then(() => {
            // Background fetch with geo data after initial load
            setTimeout(() => refresh(false), 100);
        });

        // Set up polling if enabled
        if (enablePolling) {
            pollingRef.current = setInterval(() => {
                refresh();
            }, pollingInterval);
        }

        // Capture refs for cleanup
        const cleanup = cleanupRef.current;
        const polling = pollingRef.current;

        return () => {
            if (cleanup) {
                cleanup();
            }
            if (polling) {
                clearInterval(polling);
            }
        };
    }, [pollingInterval, enablePolling, refresh]);

    return {
        nodes,
        isLoading,
        error,
        lastUpdated,
        refresh,
        isConnected,
        dataSource,
    };
}

interface UsePNodeDetailReturn {
    node: PNodeDetailedMetrics | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching detailed pNode information
 */
export function usePNodeDetail(pubkey: string): UsePNodeDetailReturn {
    const [node, setNode] = useState<PNodeDetailedMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPNodeDetail(pubkey);
            setNode(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch node details"));
        } finally {
            setIsLoading(false);
        }
    }, [pubkey]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        node,
        isLoading,
        error,
        refresh,
    };
}

interface UseNodeComparisonReturn {
    comparedNodes: PNodeDetailedMetrics[];
    isLoading: boolean;
    addNode: (pubkey: string) => Promise<void>;
    removeNode: (pubkey: string) => void;
    clearAll: () => void;
}

/**
 * Hook for comparing multiple nodes side-by-side
 */
export function useNodeComparison(maxNodes = 4): UseNodeComparisonReturn {
    const [comparedNodes, setComparedNodes] = useState<PNodeDetailedMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addNode = useCallback(async (pubkey: string) => {
        if (comparedNodes.length >= maxNodes) {
            throw new Error(`Maximum ${maxNodes} nodes can be compared`);
        }

        if (comparedNodes.some(n => n.pubkey === pubkey)) {
            return; // Already added
        }

        try {
            setIsLoading(true);
            const detail = await xandeumRPC.fetchPNodeDetail(pubkey);
            if (detail) {
                setComparedNodes(prev => [...prev, detail]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [comparedNodes, maxNodes]);

    const removeNode = useCallback((pubkey: string) => {
        setComparedNodes(prev => prev.filter(n => n.pubkey !== pubkey));
    }, []);

    const clearAll = useCallback(() => {
        setComparedNodes([]);
    }, []);

    return {
        comparedNodes,
        isLoading,
        addNode,
        removeNode,
        clearAll,
    };
}

interface HealthAlert {
    id: string;
    type: "offline" | "delinquent" | "recovered" | "degraded";
    pubkey: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface UseHealthAlertsReturn {
    alerts: HealthAlert[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAlerts: () => void;
}

/**
 * Hook for monitoring node health and generating alerts
 */
export function useHealthAlerts(nodes: PNodeMetrics[]): UseHealthAlertsReturn {
    const [alerts, setAlerts] = useState<HealthAlert[]>([]);
    const previousNodesRef = useRef<Map<string, PNodeMetrics>>(new Map());
    const initializedRef = useRef(false);

    useEffect(() => {
        if (nodes.length === 0) return;

        const previousNodes = previousNodesRef.current;
        const newAlerts: HealthAlert[] = [];

        // On first load, create alerts for currently delinquent/offline nodes
        if (!initializedRef.current) {
            initializedRef.current = true;
            nodes.forEach(node => {
                if (node.status === "Delinquent") {
                    newAlerts.push({
                        id: `${node.pubkey}-init-${Date.now()}`,
                        type: "delinquent",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... is delinquent`,
                        timestamp: new Date(),
                        read: false,
                    });
                } else if (node.status === "Offline") {
                    newAlerts.push({
                        id: `${node.pubkey}-init-${Date.now()}`,
                        type: "offline",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... is offline`,
                        timestamp: new Date(),
                        read: false,
                    });
                }
                previousNodes.set(node.pubkey, node);
            });
            if (newAlerts.length > 0) {
                // Use callback to avoid synchronous setState warning
                queueMicrotask(() => setAlerts(newAlerts.slice(0, 10)));
            }
            return;
        }

        nodes.forEach(node => {
            const previous = previousNodes.get(node.pubkey);

            if (previous) {
                // Check for status changes
                if (previous.status === "Active" && node.status === "Offline") {
                    newAlerts.push({
                        id: `${node.pubkey}-${Date.now()}`,
                        type: "offline",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... went offline`,
                        timestamp: new Date(),
                        read: false,
                    });
                } else if (previous.status === "Active" && node.status === "Delinquent") {
                    newAlerts.push({
                        id: `${node.pubkey}-${Date.now()}`,
                        type: "delinquent",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... is delinquent`,
                        timestamp: new Date(),
                        read: false,
                    });
                } else if (previous.status !== "Active" && node.status === "Active") {
                    newAlerts.push({
                        id: `${node.pubkey}-${Date.now()}`,
                        type: "recovered",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... is back online`,
                        timestamp: new Date(),
                        read: false,
                    });
                }

                // Check for degraded performance
                if (previous.uptimePercentage > 95 && node.uptimePercentage < 90) {
                    newAlerts.push({
                        id: `${node.pubkey}-perf-${Date.now()}`,
                        type: "degraded",
                        pubkey: node.pubkey,
                        message: `Node ${node.pubkey.slice(0, 8)}... performance degraded`,
                        timestamp: new Date(),
                        read: false,
                    });
                }
            }

            previousNodes.set(node.pubkey, node);
        });

        if (newAlerts.length > 0) {
            // Use queueMicrotask to avoid synchronous setState warning
            queueMicrotask(() => setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)));
        }

        previousNodesRef.current = previousNodes;
    }, [nodes]);

    const markAsRead = useCallback((id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    }, []);

    const markAllAsRead = useCallback(() => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    }, []);

    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    const unreadCount = alerts.filter(a => !a.read).length;

    return {
        alerts,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAlerts,
    };
}


interface UsePodsReturn {
    pods: PRPCPod[];
    totalCount: number;
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching pods from the gossip network via pRPC
 */
export function usePods(): UsePodsReturn {
    const [pods, setPods] = useState<PRPCPod[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPodsFromNetwork();
            if (data) {
                setPods(data.pods);
                setTotalCount(data.total_count);
                setLastUpdated(new Date());
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch pods"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        pods,
        totalCount,
        isLoading,
        error,
        lastUpdated,
        refresh,
    };
}

interface UsePodsAsPNodesReturn {
    nodes: PNodeMetrics[];
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching pods and converting them to PNodeMetrics format
 */
export function usePodsAsPNodes(): UsePodsAsPNodesReturn {
    const [nodes, setNodes] = useState<PNodeMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPodsAsPNodes();
            setNodes(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch pods"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        nodes,
        isLoading,
        error,
        lastUpdated,
        refresh,
    };
}


interface UseBlockProductionReturn {
    blockProduction: {
        validators: {
            pubkey: string;
            leaderSlots: number;
            blocksProduced: number;
            skipRate: number;
        }[];
        totalLeaderSlots: number;
        totalBlocksProduced: number;
        networkSkipRate: number;
    } | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching block production stats - useful for validator operators
 */
export function useBlockProduction(): UseBlockProductionReturn {
    const [blockProduction, setBlockProduction] = useState<UseBlockProductionReturn["blockProduction"]>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.getBlockProduction();
            if (data) {
                const networkSkipRate = data.totalLeaderSlots > 0
                    ? ((data.totalLeaderSlots - data.totalBlocksProduced) / data.totalLeaderSlots) * 100
                    : 0;
                setBlockProduction({
                    validators: data.validators,
                    totalLeaderSlots: data.totalLeaderSlots,
                    totalBlocksProduced: data.totalBlocksProduced,
                    networkSkipRate,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch block production"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        blockProduction,
        isLoading,
        error,
        refresh,
    };
}

interface UseNetworkStatsReturn {
    stats: {
        totalNodes: number;
        activeNodes: number;
        delinquentNodes: number;
        epoch: number;
        slot: number;
        blockHeight: number;
        tps: number;
        totalStake: number;
        circulatingSupply: number;
    } | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching network-wide statistics
 */
export function useNetworkStats(pollingInterval = 30000): UseNetworkStatsReturn {
    const [stats, setStats] = useState<UseNetworkStatsReturn["stats"]>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.getNetworkStats();
            setStats({
                totalNodes: data.totalNodes,
                activeNodes: data.activeNodes,
                delinquentNodes: data.delinquentNodes,
                epoch: data.epoch,
                slot: data.slot,
                blockHeight: data.blockHeight,
                tps: data.tps,
                totalStake: data.totalStake,
                circulatingSupply: data.circulatingSupply,
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch network stats"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, pollingInterval);
        return () => clearInterval(interval);
    }, [refresh, pollingInterval]);

    return {
        stats,
        isLoading,
        error,
        refresh,
    };
}

interface UseInflationReturn {
    inflation: {
        total: number;
        validator: number;
        foundation: number;
        epoch: number;
    } | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook for fetching inflation rate
 */
export function useInflation(): UseInflationReturn {
    const [inflation, setInflation] = useState<UseInflationReturn["inflation"]>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsLoading(true);
                const data = await xandeumRPC.getInflationRate();
                if (data) {
                    setInflation(data);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to fetch inflation"));
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    return { inflation, isLoading, error };
}
