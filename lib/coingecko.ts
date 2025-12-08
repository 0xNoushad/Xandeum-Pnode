/**
 * CoinGecko API client for XAND token price data
 */

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const XAND_ID = "xandeum";

const FALLBACK_PRICE: XandPrice = {
    usd: 0.0042,
    usd_24h_change: 2.5,
    usd_24h_vol: 125000,
    usd_market_cap: 4200000,
};

export interface XandPrice {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
}

export interface PriceHistoryPoint {
    timestamp: number;
    price: number;
}

// Cache for price data
let priceCache: { data: XandPrice | null; timestamp: number } = { data: null, timestamp: 0 };
let historyCache: { data: PriceHistoryPoint[] | null; timestamp: number; days: number } = { data: null, timestamp: 0, days: 0 };
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Fetch current XAND price from CoinGecko
 */
export async function fetchXandPrice(): Promise<XandPrice | null> {
    const now = Date.now();
    
    // Return cached data if fresh
    if (priceCache.data && (now - priceCache.timestamp) < CACHE_TTL) {
        return priceCache.data;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${XAND_ID}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
            { next: { revalidate: 60 } }
        );
        
        if (!response.ok) {
            console.warn("[CoinGecko] Failed to fetch price:", response.status);
            return priceCache.data || FALLBACK_PRICE;
        }

        const data = await response.json();
        
        if (data[XAND_ID]) {
            const price: XandPrice = {
                usd: data[XAND_ID].usd,
                usd_24h_change: data[XAND_ID].usd_24h_change || 0,
                usd_24h_vol: data[XAND_ID].usd_24h_vol || 0,
                usd_market_cap: data[XAND_ID].usd_market_cap || 0,
            };
            priceCache = { data: price, timestamp: now };
            return price;
        }
        
        return FALLBACK_PRICE;
    } catch (error) {
        console.error("[CoinGecko] Error fetching price:", error);
        return priceCache.data || FALLBACK_PRICE;
    }
}

/**
 * Fetch XAND price history from CoinGecko
 */
export async function fetchXandPriceHistory(days: number = 30): Promise<PriceHistoryPoint[]> {
    const now = Date.now();
    
    // Return cached data if fresh AND same days range
    if (historyCache.data && historyCache.days === days && (now - historyCache.timestamp) < CACHE_TTL * 5) {
        return historyCache.data;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/${XAND_ID}/market_chart?vs_currency=usd&days=${days}`,
            { next: { revalidate: 300 } }
        );
        
        if (!response.ok) {
            console.warn("[CoinGecko] Failed to fetch history:", response.status);
            return historyCache.data || generateFallbackHistory(days);
        }

        const data = await response.json();
        
        if (data.prices && Array.isArray(data.prices)) {
            const history: PriceHistoryPoint[] = data.prices.map((p: [number, number]) => ({
                timestamp: p[0],
                price: p[1],
            }));
            historyCache = { data: history, timestamp: now, days };
            return history;
        }
        
        return generateFallbackHistory(days);
    } catch (error) {
        console.error("[CoinGecko] Error fetching history:", error);
        return historyCache.data || generateFallbackHistory(days);
    }
}

function generateFallbackHistory(days: number): PriceHistoryPoint[] {
    const now = Date.now();
    const points: PriceHistoryPoint[] = [];
    const basePrice = 0.0042;
    
    for (let i = days; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000;
        const variance = Math.sin(i * 0.5) * 0.0005 + Math.cos(i * 0.3) * 0.0003;
        points.push({
            timestamp,
            price: basePrice + variance,
        });
    }
    
    return points;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    if (price >= 1) {
        return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
        return `$${price.toFixed(4)}`;
    } else {
        return `$${price.toFixed(6)}`;
    }
}

/**
 * Format market cap for display
 */
export function formatMarketCap(cap: number): string {
    if (cap >= 1e9) {
        return `$${(cap / 1e9).toFixed(2)}B`;
    } else if (cap >= 1e6) {
        return `$${(cap / 1e6).toFixed(2)}M`;
    } else if (cap >= 1e3) {
        return `$${(cap / 1e3).toFixed(2)}K`;
    }
    return `$${cap.toFixed(2)}`;
}

/**
 * Format volume for display
 */
export function formatVolume(vol: number): string {
    if (vol >= 1e6) {
        return `$${(vol / 1e6).toFixed(2)}M`;
    } else if (vol >= 1e3) {
        return `$${(vol / 1e3).toFixed(2)}K`;
    }
    return `$${vol.toFixed(2)}`;
}
