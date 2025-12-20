# Requirements Document

## Introduction

This feature improves how pNodes are displayed in the Xandeum Intelligence Platform, with specific focus on handling private nodes that have missing or incomplete data, and ensuring accurate location display on the map. Currently, private nodes display broken UI elements (empty percentages, dashes for missing values) and location data may not be properly geocoded or displayed.

## Glossary

- **pNode**: Physical node hardware infrastructure in the Xandeum storage network
- **Private_Node**: A pNode that does not expose detailed metrics publicly (CPU, memory, storage usage hidden)
- **Public_Node**: A pNode that exposes all metrics publicly
- **Node_Detail_Page**: The page displaying individual node information at `/nodes/[publicKey]`
- **Map_Component**: The world map visualization showing node geographic distribution
- **Gossip_Network**: The peer-to-peer network through which nodes communicate and share data
- **Coordinates**: Geographic latitude and longitude values for node location

## Requirements

### Requirement 1: Private Node Data Display

**User Story:** As a user, I want private nodes to display gracefully with clear indicators, so that I understand which data is unavailable rather than seeing broken UI elements.

#### Acceptance Criteria

1. WHEN a private node has missing CPU data, THE Node_Detail_Page SHALL display "Private" instead of empty or broken percentage values
2. WHEN a private node has missing memory data, THE Node_Detail_Page SHALL display "Private" instead of empty or broken percentage values
3. WHEN a private node has missing storage usage data, THE Node_Detail_Page SHALL display "Private" or "N/A" with appropriate styling
4. WHEN a private node has zero uptime seconds, THE Node_Detail_Page SHALL display "Private" instead of "—"
5. WHEN a private node has zero packets data, THE Node_Detail_Page SHALL display "Private" instead of "0"
6. THE Node_Detail_Page SHALL visually distinguish private nodes from public nodes with clear labeling

### Requirement 2: Storage Display for Private Nodes

**User Story:** As a user, I want to see storage information for private nodes when available, so that I can understand their contribution to the network.

#### Acceptance Criteria

1. WHEN a private node has committed storage capacity but no usage data, THE Node_Detail_Page SHALL display the committed capacity with "Usage: Private" indicator
2. WHEN a private node has zero storage values, THE Node_Detail_Page SHALL display "Storage data not available" message
3. THE Node_Detail_Page SHALL NOT display broken percentage bars (e.g., "%" without a number) for private nodes

### Requirement 3: Node Location Accuracy

**User Story:** As a user, I want to see accurate node locations on the map, so that I can understand the geographic distribution of the network.

#### Acceptance Criteria

1. WHEN a node has valid coordinates, THE Map_Component SHALL display a marker at the correct geographic position
2. WHEN a node has coordinates of [0, 0], THE Map_Component SHALL exclude it from the map display
3. WHEN a node has city and country data, THE Map_Component SHALL use this for location grouping and display
4. THE Map_Component SHALL aggregate nodes by location for cleaner visualization
5. WHEN hovering over a location marker, THE Map_Component SHALL display the count and location name

### Requirement 4: Node List Display Improvements

**User Story:** As a user, I want the node list to clearly show which nodes are private, so that I can quickly identify node types.

#### Acceptance Criteria

1. THE Node_List SHALL display a "Private" or "Public" badge for each node
2. WHEN a private node has missing metrics, THE Node_List SHALL display "—" or "Private" instead of broken values
3. THE Node_List SHALL sort nodes with complete data higher than nodes with missing data by default
4. WHEN filtering nodes, THE Node_List SHALL allow filtering by public/private status

### Requirement 5: Graceful Data Handling

**User Story:** As a developer, I want consistent data handling utilities, so that missing data is handled uniformly across all components.

#### Acceptance Criteria

1. THE Dashboard SHALL provide utility functions for formatting potentially missing numeric values
2. THE Dashboard SHALL provide utility functions for detecting private node status based on data availability
3. WHEN any metric value is null, undefined, or zero where unexpected, THE Dashboard SHALL apply consistent fallback display logic
4. THE Dashboard SHALL NOT display NaN, undefined, or null values in the UI

