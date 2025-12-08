"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    PNodeMetrics,
    PNodeDetailedMetrics,
    xandeumRPC,
    createNodeStatusPoller
} from "@/lib/xandeum-rpc";

interface UsePNodesOptions {
    pollingInterval?: number;
    enablePolling?: boolean;
}

interface UsePNodesReturn {
    nodes: PNodeMetrics[];
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
    isConnected: boolean;
}

/**
 * Hook for fetching and subscribing to pNode data with real-time updates
 */
export function usePNodes(options: UsePNodesOptions = {}): UsePNodesReturn {
    const { pollingInterval = 10000, enablePolling = true } = options;

    const [nodes, setNodes] = useState<PNodeMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const cleanupRef = useRef<(() => void) | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await xandeumRPC.fetchPNodes(true);
            setNodes(data);
            setLastUpdated(new Date());
            setIsConnected(true);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch nodes"));
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (enablePolling) {
            cleanupRef.current = createNodeStatusPoller((updatedNodes) => {
                setNodes(updatedNodes);
                setLastUpdated(new Date());
                setIsLoading(false);
                setIsConnected(true);
            }, pollingInterval);
        } else {
            refresh();
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
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
                setAlerts(newAlerts.slice(0, 10)); // Show max 10 initial alerts
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
            setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep max 50 alerts
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
