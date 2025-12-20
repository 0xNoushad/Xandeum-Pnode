# Design Document: PNode Display Improvements

## Overview

This design addresses the display issues with private pNodes in the Xandeum Intelligence Platform. Private nodes expose limited metrics (no CPU, memory, detailed storage usage, or uptime data), which currently results in broken UI elements like empty percentages, dashes, and zero values that confuse users.

The solution introduces:
1. Utility functions for detecting private node status and formatting missing data
2. Updated UI components that gracefully handle missing data with clear "Private" indicators
3. Improved map filtering to exclude nodes with invalid coordinates

## Architecture

The implementation follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Components Layer                       │
│  (NodeDetailPage, MapPageClient, NodesPage)                 │
├─────────────────────────────────────────────────────────────┤
│                    Utility Functions Layer                   │
│  (lib/node-utils.ts - formatting, detection, validation)    │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  (PNodeMetrics, PNodeDetailedMetrics from xandeum-rpc.ts)   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Node Utility Functions (`lib/node-utils.ts`)

New utility module providing consistent data handling across all components.

```typescript
/**
 * Determines if a node is private based on data availability
 * A node is considered private if isPublic is false OR if key metrics are missing
 */
export function isPrivateNode(node: PNodeMetrics | PNodeDetailedMetrics): boolean;

/**
 * Formats a numeric value with fallback for private/missing data
 * Returns "Private" for private nodes with missing data
 * Returns "N/A" for public nodes with missing data
 * Returns formatted value otherwise
 */
export function formatMetricValue(
  value: number | null | undefined,
  formatter: (v: number) => string,
  isPrivate: boolean
): string;

/**
 * Formats bytes with appropriate unit (B, KB, MB, GB, TB)
 * Returns "Private" if value is 0/null/undefined and node is private
 */
export function formatBytes(
  bytes: number | null | undefined,
  isPrivate?: boolean
): string;

/**
 * Formats uptime from seconds to human-readable string
 * Returns "Private" if value is 0/null/undefined and node is private
 */
export function formatUptime(
  seconds: number | null | undefined,
  isPrivate?: boolean
): string;

/**
 * Formats percentage value safely
 * Returns "Private" if value is invalid and node is private
 * Never returns standalone "%" without a number
 */
export function formatPercentage(
  value: number | null | undefined,
  isPrivate?: boolean
): string;

/**
 * Checks if coordinates are valid (not [0,0] or null)
 */
export function hasValidCoordinates(
  coordinates: [number, number] | null | undefined
): boolean;

/**
 * Filters nodes to only those with valid coordinates for map display
 */
export function filterNodesWithValidCoordinates<T extends { coordinates: [number, number] }>(
  nodes: T[]
): T[];

/**
 * Aggregates nodes by location for map display
 * Groups nodes with same city/country combination
 */
export function aggregateNodesByLocation(
  nodes: PNodeMetrics[]
): { lat: number; lng: number; label: string; count: number }[];
```

### 2. Updated Node Detail Page Components

The `NodeDetailPage` component will be updated to use the utility functions:

```typescript
// Storage Card - handles private node display
function StorageCard({ node }: { node: PNodeDetailedMetrics }) {
  const isPrivate = isPrivateNode(node);
  const hasStorageData = node.storage.capacity > 0 || node.storage.used > 0;
  
  if (!hasStorageData) {
    return <EmptyStorageCard />;
  }
  
  return (
    <Card>
      <StorageHeader />
      <StorageMetrics 
        used={formatBytes(node.storage.used, isPrivate)}
        capacity={formatBytes(node.storage.capacity, isPrivate)}
        percentage={formatPercentage(
          node.storage.capacity > 0 
            ? (node.storage.used / node.storage.capacity) * 100 
            : null,
          isPrivate
        )}
      />
      <StorageBar percentage={...} isPrivate={isPrivate} />
    </Card>
  );
}

// Stat Card - handles missing metrics
function StatCard({ 
  icon, 
  label, 
  value, 
  isPrivate 
}: StatCardProps) {
  const displayValue = value === "Private" 
    ? <span className="text-orange-400">Private</span>
    : value;
  
  return (
    <Card>
      <Icon>{icon}</Icon>
      <Value>{displayValue}</Value>
      <Label>{label}</Label>
    </Card>
  );
}
```

### 3. Map Component Updates

The `MapPageClient` will filter invalid coordinates before rendering:

```typescript
interface MapPageClientProps {
  nodes: PNodeMetrics[];
  // ... other props
}

export function MapPageClient({ nodes, ...props }: MapPageClientProps) {
  // Filter nodes with valid coordinates
  const validNodes = filterNodesWithValidCoordinates(nodes);
  
  // Aggregate by location
  const locations = aggregateNodesByLocation(validNodes);
  
  // Filter out "Unknown, Unknown" locations
  const displayLocations = locations.filter(
    l => l.label !== "Unknown, Unknown"
  );
  
  return (
    <WorldMap locations={displayLocations} />
  );
}
```

## Data Models

### Existing Types (from `lib/xandeum-rpc.ts`)

```typescript
interface PNodeMetrics {
  pubkey: string;
  gossipAddress: string;
  status: "Active" | "Delinquent" | "Offline";
  isPublic?: boolean;  // Key field for private detection
  storage: {
    used: number;      // 0 for private nodes
    capacity: number;  // May have value even for private
  };
  storageUsagePercent?: number;  // undefined for private
  uptimeSeconds?: number;        // 0 or undefined for private
  coordinates: [number, number]; // [0, 0] if unknown
  // ... other fields
}

interface PNodeDetailedMetrics extends PNodeMetrics {
  hardware: {
    cpuCores: number;
    memoryUsed: number;  // May be derived, not real for private
    // ...
  };
  network: {
    inboundTraffic: number;
    outboundTraffic: number;
    peersConnected: number;
    // ...
  };
}
```

### Private Node Detection Logic

A node is considered "private" when:
1. `isPublic === false` (explicit flag from API)
2. OR `uptimeSeconds === 0` AND `storage.used === 0` (implicit detection)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Private Node Metrics Display

*For any* private node with missing metrics (CPU, memory, uptime, packets), the formatted display value should be "Private" and never contain broken values like standalone "%", "NaN", "undefined", or "null".

**Validates: Requirements 1.1, 1.2, 1.4, 1.5, 2.3, 5.4**

### Property 2: Storage Display Consistency

*For any* private node, the storage display should show the committed capacity (if available) with a "Private" usage indicator, and the percentage bar should either show "Private" or be hidden—never display a broken percentage.

**Validates: Requirements 1.3, 2.1, 2.3**

### Property 3: Map Coordinate Filtering

*For any* set of nodes, the map component should exclude nodes with coordinates [0, 0] and properly aggregate remaining nodes by their city/country location.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Utility Function Consistency

*For any* numeric value (including null, undefined, 0, NaN), the formatting utility functions should return a valid display string that never contains "NaN", "undefined", or "null" as literal text.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 5: Node List Filter Correctness

*For any* filter combination (public/private, online/offline), the filtered node list should contain exactly the nodes matching all active filter criteria.

**Validates: Requirements 4.2, 4.4**

## Error Handling

### Missing Data Scenarios

| Scenario | Handling |
|----------|----------|
| `isPublic === undefined` | Treat as private (conservative) |
| `storage.used === 0` on private node | Display "Private" |
| `storage.capacity === 0` | Display "Storage data not available" |
| `uptimeSeconds === 0` on private node | Display "Private" |
| `coordinates === [0, 0]` | Exclude from map, show "Unknown" in detail |
| API returns null/undefined | Use fallback values, never crash |

### UI Fallback States

```typescript
// Never display these values in UI
const INVALID_DISPLAY_VALUES = ['NaN', 'undefined', 'null', 'Infinity', '%'];

function sanitizeDisplayValue(value: string): string {
  if (INVALID_DISPLAY_VALUES.some(invalid => value.includes(invalid))) {
    return 'N/A';
  }
  return value;
}
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Utility function edge cases**:
   - `formatBytes(0, true)` → "Private"
   - `formatBytes(0, false)` → "0 B"
   - `formatUptime(null, true)` → "Private"
   - `formatPercentage(NaN, false)` → "N/A"

2. **Private node detection**:
   - Node with `isPublic: false` → detected as private
   - Node with `isPublic: undefined` and zero metrics → detected as private

3. **Coordinate validation**:
   - `[0, 0]` → invalid
   - `[37.7749, -122.4194]` → valid
   - `null` → invalid

### Property-Based Tests

Property-based tests will use **fast-check** library to verify universal properties across many generated inputs. Each test should run minimum 100 iterations.

1. **Property 1 Test**: Generate random private nodes with various missing metric combinations, verify output never contains invalid strings.

2. **Property 2 Test**: Generate random storage values (including edge cases), verify percentage display is always valid.

3. **Property 3 Test**: Generate random node sets with various coordinate values, verify filtering and aggregation correctness.

4. **Property 4 Test**: Generate random numeric inputs (including null, undefined, NaN, Infinity), verify utility functions never return invalid strings.

5. **Property 5 Test**: Generate random node lists and filter combinations, verify filter results match expected criteria.

### Test Configuration

```typescript
// vitest.config.ts - ensure fast-check is available
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Property tests need more time due to many iterations
    testTimeout: 30000,
  },
});
```

### Test File Structure

```
lib/
  node-utils.ts
  node-utils.test.ts          # Unit tests
  node-utils.property.test.ts # Property-based tests
components/
  map-page-client.tsx
  map-page-client.test.ts     # Component tests
```
