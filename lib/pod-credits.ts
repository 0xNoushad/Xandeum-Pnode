/**
 * Pod Credits API client
 * Fetches credit scores for pNodes from the Xandeum credits API
 */

const CREDITS_API = "/api/pod-credits";

export interface PodCredit {
    pod_id: string;
    credits: number;
}

export interface PodCreditsResponse {
    pods_credits: PodCredit[];
    status: string;
}

// Cache for credits data
let creditsCache: { data: Map<string, number>; timestamp: number } = { 
    data: new Map(), 
    timestamp: 0 
};
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Fetch all pod credits from the API
 */
export async function fetchAllPodCredits(): Promise<Map<string, number>> {
    const now = Date.now();
    
    // Return cached data if fresh
    if (creditsCache.data.size > 0 && (now - creditsCache.timestamp) < CACHE_TTL) {
        return creditsCache.data;
    }

    try {
        const response = await fetch(CREDITS_API);
        
        if (!response.ok) {
            console.warn("[PodCredits] Failed to fetch:", response.status);
            return creditsCache.data;
        }

        const data: PodCreditsResponse = await response.json();
        
        if (data.status === "success" && Array.isArray(data.pods_credits)) {
            const creditsMap = new Map<string, number>();
            data.pods_credits.forEach(pod => {
                creditsMap.set(pod.pod_id, pod.credits);
            });
            creditsCache = { data: creditsMap, timestamp: now };
            return creditsMap;
        }
        
        return creditsCache.data;
    } catch (error) {
        console.error("[PodCredits] Error fetching:", error);
        return creditsCache.data;
    }
}

/**
 * Get credits for a specific pod
 */
export async function getPodCredits(podId: string): Promise<number | null> {
    const allCredits = await fetchAllPodCredits();
    return allCredits.get(podId) ?? null;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
    if (credits >= 1000000) {
        return `${(credits / 1000000).toFixed(2)}M`;
    } else if (credits >= 1000) {
        return `${(credits / 1000).toFixed(1)}K`;
    }
    return credits.toLocaleString();
}

/**
 * Get credit tier based on score
 */
export function getCreditTier(credits: number): { tier: string; color: string } {
    if (credits >= 50000) return { tier: "Elite", color: "text-purple-400" };
    if (credits >= 40000) return { tier: "Excellent", color: "text-emerald-400" };
    if (credits >= 30000) return { tier: "Good", color: "text-blue-400" };
    if (credits >= 20000) return { tier: "Average", color: "text-yellow-400" };
    if (credits >= 10000) return { tier: "Fair", color: "text-orange-400" };
    return { tier: "Low", color: "text-red-400" };
}
