# Implementation Plan: PNode Display Improvements

## Overview

This plan implements graceful handling of private pNode data display and improves map location accuracy. The implementation follows a bottom-up approach: utility functions first, then component updates, then testing.

## Tasks

- [x] 1. Create node utility functions module
  - [x] 1.1 Create `lib/node-utils.ts` with core utility functions
    - Implement `isPrivateNode()` detection function
    - Implement `formatBytes()` with private node handling
    - Implement `formatUptime()` with private node handling
    - Implement `formatPercentage()` with private node handling
    - Implement `formatMetricValue()` generic formatter
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.2 Add coordinate utility functions
    - Implement `hasValidCoordinates()` validation
    - Implement `filterNodesWithValidCoordinates()` filter
    - Implement `aggregateNodesByLocation()` aggregation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.3 Write property test for utility functions
    - **Property 4: Utility Function Consistency**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 2. Update Node Detail Page for private nodes
  - [x] 2.1 Update storage card component
    - Import and use utility functions
    - Handle missing storage usage with "Private" indicator
    - Handle zero storage with "Storage data not available" message
    - Fix percentage bar to never show broken values
    - _Requirements: 1.3, 2.1, 2.2, 2.3_

  - [x] 2.2 Update stat cards for private node metrics
    - Update uptime display to show "Private" for zero values on private nodes
    - Update any other metric displays that may show broken values
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 2.3 Write property test for private node display
    - **Property 1: Private Node Metrics Display**
    - **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 2.3, 5.4**

  - [ ]* 2.4 Write property test for storage display
    - **Property 2: Storage Display Consistency**
    - **Validates: Requirements 1.3, 2.1, 2.3**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update Map Component for location accuracy
  - [x] 4.1 Update map page to filter invalid coordinates
    - Import coordinate utility functions
    - Filter out nodes with [0, 0] coordinates before display
    - Update location aggregation to use utility function
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for map coordinate filtering
    - **Property 3: Map Coordinate Filtering**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 5. Update Node List Page
  - [x] 5.1 Ensure node list handles missing metrics gracefully
    - Verify public/private badges display correctly (already implemented)
    - Ensure any displayed metrics use utility functions
    - _Requirements: 4.1, 4.2_

  - [ ]* 5.2 Write property test for node list filtering
    - **Property 5: Node List Filter Correctness**
    - **Validates: Requirements 4.2, 4.4**

- [ ] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The utility functions module is the foundation - complete it first before updating components
