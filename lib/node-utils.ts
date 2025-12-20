/**
 * Node Utility Functions
 * Provides consistent data handling for pNode display across all components.
 * Handles private node detection, metric formatting, and coordinate validation.
 */

import type { PNodeMetrics, PNodeDetailedMetrics } from "./xandeum-rpc";

// Invalid display values that should never appear in UI
const INVALID_DISPLAY_VALUES = ["NaN", "undefined", "null", "Infinity"];

/**
 * Sanitizes a display value to ensure it never contains invalid strings
 */
function sanitizeDisplayValue(value: string): string {
  if (INVALID_DISPLAY_VALUES.some((invalid) => value.includes(invalid))) {
    return "N/A";
  }
  return value;
}

/**
 * Determines if a node is private based on data availability.
 * A node is considered private if:
 * 1. isPublic is explicitly false, OR
 * 2. isPublic is undefined AND key metrics are missing (uptimeSeconds === 0 AND storage.used === 0)
 */
export function isPrivateNode(
  node: PNodeMetrics | PNodeDetailedMetrics
): boolean {
  // Explicit flag takes precedence
  if (node.isPublic === false) {
    return true;
  }

  // If isPublic is undefined, use implicit detection
  if (node.isPublic === undefined) {
    const hasNoUptime = !node.uptimeSeconds || node.uptimeSeconds === 0;
    const hasNoStorageUsed = !node.storage?.used || node.storage.used === 0;
    return hasNoUptime && hasNoStorageUsed;
  }

  return false;
}

/**
 * Formats a numeric value with fallback for private/missing data.
 * Returns "Private" for private nodes with missing data.
 * Returns "N/A" for public nodes with missing data.
 * Returns formatted value otherwise.
 */
export function formatMetricValue(
  value: number | null | undefined,
  formatter: (v: number) => string,
  isPrivate: boolean
): string {
  // Handle null, undefined, NaN, or Infinity
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return isPrivate ? "Private" : "N/A";
  }

  try {
    const formatted = formatter(value);
    return sanitizeDisplayValue(formatted);
  } catch {
    return isPrivate ? "Private" : "N/A";
  }
}

/**
 * Formats bytes with appropriate unit (B, KB, MB, GB, TB).
 * Returns "Private" if value is 0/null/undefined and node is private.
 */
export function formatBytes(
  bytes: number | null | undefined,
  isPrivate: boolean = false
): string {
  // Handle null, undefined, NaN, or Infinity
  if (
    bytes === null ||
    bytes === undefined ||
    Number.isNaN(bytes) ||
    !Number.isFinite(bytes)
  ) {
    return isPrivate ? "Private" : "N/A";
  }

  // Handle zero - for private nodes, this likely means data is hidden
  if (bytes === 0) {
    return isPrivate ? "Private" : "0 B";
  }

  // Handle negative values
  if (bytes < 0) {
    return isPrivate ? "Private" : "N/A";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Format with appropriate decimal places
  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(2);
  return sanitizeDisplayValue(`${formatted} ${units[unitIndex]}`);
}

/**
 * Formats uptime from seconds to human-readable string.
 * Returns "Private" if value is 0/null/undefined and node is private.
 */
export function formatUptime(
  seconds: number | null | undefined,
  isPrivate: boolean = false
): string {
  // Handle null, undefined, NaN, or Infinity
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(seconds) ||
    !Number.isFinite(seconds)
  ) {
    return isPrivate ? "Private" : "N/A";
  }

  // Handle zero or negative - for private nodes, this likely means data is hidden
  if (seconds <= 0) {
    return isPrivate ? "Private" : "N/A";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${Math.floor(seconds)}s`;
}

/**
 * Formats percentage value safely.
 * Returns "Private" if value is invalid and node is private.
 * Never returns standalone "%" without a number.
 */
export function formatPercentage(
  value: number | null | undefined,
  isPrivate: boolean = false
): string {
  // Handle null, undefined, NaN, or Infinity
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return isPrivate ? "Private" : "N/A";
  }

  // Handle negative values
  if (value < 0) {
    return isPrivate ? "Private" : "N/A";
  }

  // Format with one decimal place, capped at 100%
  const capped = Math.min(100, value);
  return sanitizeDisplayValue(`${capped.toFixed(1)}%`);
}


// ============================================================================
// Coordinate Utility Functions
// ============================================================================

/**
 * Checks if coordinates are valid (not [0,0], null, or undefined).
 * Coordinates of [0, 0] are considered invalid as they typically indicate
 * unknown or unresolved geolocation.
 */
export function hasValidCoordinates(
  coordinates: [number, number] | null | undefined
): boolean {
  if (!coordinates) {
    return false;
  }

  const [lat, lon] = coordinates;

  // Check for null/undefined/NaN values
  if (
    lat === null ||
    lat === undefined ||
    lon === null ||
    lon === undefined ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return false;
  }

  // [0, 0] is considered invalid (unknown location)
  if (lat === 0 && lon === 0) {
    return false;
  }

  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return false;
  }

  return true;
}

/**
 * Filters nodes to only those with valid coordinates for map display.
 * Generic function that works with any object containing a coordinates property.
 */
export function filterNodesWithValidCoordinates<
  T extends { coordinates: [number, number] | null | undefined }
>(nodes: T[]): T[] {
  return nodes.filter((node) => hasValidCoordinates(node.coordinates));
}

/**
 * Location aggregation result for map display
 */
export interface AggregatedLocation {
  lat: number;
  lng: number;
  label: string;
  count: number;
}

/**
 * Aggregates nodes by location for map display.
 * Groups nodes with same city/country combination.
 * Excludes nodes with invalid coordinates or "Unknown, Unknown" locations.
 */
export function aggregateNodesByLocation(
  nodes: PNodeMetrics[]
): AggregatedLocation[] {
  // Filter to only nodes with valid coordinates
  const validNodes = filterNodesWithValidCoordinates(nodes);

  // Group by location label (city, country)
  const locationMap = new Map<
    string,
    { lat: number; lng: number; count: number }
  >();

  for (const node of validNodes) {
    const label = node.location || `${node.city || "Unknown"}, ${node.country || "Unknown"}`;

    // Skip "Unknown, Unknown" locations
    if (label === "Unknown, Unknown") {
      continue;
    }

    const existing = locationMap.get(label);
    if (existing) {
      existing.count++;
    } else {
      locationMap.set(label, {
        lat: node.coordinates![0],
        lng: node.coordinates![1],
        count: 1,
      });
    }
  }

  // Convert to array format
  return Array.from(locationMap.entries()).map(([label, data]) => ({
    lat: data.lat,
    lng: data.lng,
    label,
    count: data.count,
  }));
}
