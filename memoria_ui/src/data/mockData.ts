/**
 * Mock Data - Minimal Fallback
 * 
 * This file now returns empty data structures.
 * The frontend fetches real data from the Flask backend.
 * These empty fallbacks prevent crashes if the backend is offline.
 */

import type { GraphNodeData, GraphEdge, ClusterCard, IngestEntry, CategoryNode, ExecutiveSummary, TimelineEntry, DashboardCard } from '../types';

// Empty fallbacks - real data comes from backend API
export const graphNodes: GraphNodeData[] = [];
export const categoryNodes: CategoryNode[] = [];
export const graphEdges: GraphEdge[] = [];
export const executiveSummaries: ExecutiveSummary[] = [];
export const timelineEntries: TimelineEntry[] = [];
export const dashboardCards: DashboardCard[] = [];
export const clusterCards: ClusterCard[] = [];
export const ingestEntries: IngestEntry[] = [];
