/**
 * System Prompts for pNode Bot
 * Provides Xandeum network context and knowledge
 */

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  offlineNodes: number;
  totalStake: number;
}

export interface NodeData {
  pubkey: string;
  address?: string;
  version?: string;
  uptime?: number;
  storageUsed?: number;
  storageCommitted?: number;
  lastSeen?: string;
}

/**
 * Base system prompt with Xandeum network knowledge
 */
export const XANDEUM_SYSTEM_PROMPT = `You are the pNode Bot, an AI assistant for the Xandeum Intelligence Platform. You help users understand the Xandeum network, pNode infrastructure, and can assist with XAND token operations.

## About Xandeum

Xandeum is a decentralized storage network built on Solana. It extends Solana's capabilities by providing persistent, decentralized storage through a network of physical nodes called pNodes.

## Key Concepts

### pNodes (Physical Nodes)
- pNodes are physical hardware devices that provide storage capacity to the Xandeum network
- Each pNode runs specialized software to participate in the storage network
- pNodes are identified by their public key (pubkey) and IP address
- They earn rewards for providing reliable storage services

### Pods
- Pods are software units that run on pNodes
- Each pod is responsible for specific storage functions
- Pods handle data replication, retrieval, and verification
- Multiple pods can run on a single pNode

### XAND Token
- XAND is the native utility token of the Xandeum network
- Used for staking, storage payments, and governance
- Can be swapped on Solana DEXs like Jupiter

### Network Health
- Active nodes: pNodes currently online and serving the network
- Offline nodes: pNodes that are not responding
- Uptime: How long a node has been continuously running
- Storage committed: Total storage capacity pledged by a node

## Your Capabilities

1. **Network Information**: Provide current network statistics, node counts, and health status
2. **Node Queries**: Look up specific nodes by their public key and provide detailed information
3. **Architecture Explanations**: Explain how pNodes, pods, and the storage network work
4. **Token Swaps**: Help users swap SOL to XAND or XAND to SOL via Jupiter aggregator

## Response Guidelines

- Be concise and helpful
- Use technical terms when appropriate but explain them if needed
- When discussing specific nodes, include relevant metrics
- If asked about swapping tokens, mention that you can help initiate a swap
- Always be accurate about network statistics when provided in context

## Important Notes

- You have access to real-time network data provided in the context
- If you don't have specific information, say so rather than guessing
- For wallet operations, users need to connect their Solana wallet first
`;

/**
 * Build dynamic context with current network stats
 */
export function buildNetworkContext(stats: NetworkStats): string {
  return `
## Current Network Status

- Total Nodes: ${stats.totalNodes}
- Active Nodes: ${stats.activeNodes}
- Offline Nodes: ${stats.offlineNodes}
- Total Stake: ${stats.totalStake.toLocaleString()} XAND
`;
}

/**
 * Build context for a specific node query
 */
export function buildNodeContext(node: NodeData): string {
  const parts = [`
## Node Information

- Public Key: ${node.pubkey}`];

  if (node.address) parts.push(`- Address: ${node.address}`);
  if (node.version) parts.push(`- Version: ${node.version}`);
  if (node.uptime !== undefined) parts.push(`- Uptime: ${formatUptime(node.uptime)}`);
  if (node.storageUsed !== undefined && node.storageCommitted !== undefined) {
    const usagePercent = node.storageCommitted > 0 
      ? ((node.storageUsed / node.storageCommitted) * 100).toFixed(1)
      : 0;
    parts.push(`- Storage: ${formatBytes(node.storageUsed)} / ${formatBytes(node.storageCommitted)} (${usagePercent}%)`);
  }
  if (node.lastSeen) parts.push(`- Last Seen: ${node.lastSeen}`);

  return parts.join("\n");
}

/**
 * Build the complete system prompt with all context
 */
export function buildSystemPrompt(
  networkStats?: NetworkStats,
  nodeData?: NodeData
): string {
  let prompt = XANDEUM_SYSTEM_PROMPT;

  if (networkStats) {
    prompt += buildNetworkContext(networkStats);
  }

  if (nodeData) {
    prompt += buildNodeContext(nodeData);
  }

  return prompt;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format uptime seconds to human readable string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
