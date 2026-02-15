export type NodeType = 'central' | 'cluster' | 'sub-node';
export type NavItem = 'dashboard' | 'memory-graph' | 'actions' | 'ask-memory';
export type IngestType = 'DOCUMENT' | 'SCREENSHOT' | 'EMAIL' | 'NOTE';

export interface GraphNodeData {
  id: string;
  label: string;
  icon: string;
  type: NodeType;
  size: number;
  x: number;
  y: number;
  importance: number;
  clusterId?: string;
  children?: SubNodeData[];
}

export interface SubNodeData {
  id: string;
  label: string;
  offsetAngle: number;
  offsetDistance: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ClusterCard {
  id: string;
  title: string;
  priority?: string;
  progress: number;
  avatars?: string[];
  timeAgo?: string;
}

export interface IngestEntry {
  id: string;
  time: string;
  title: string;
  type?: IngestType;
  imageUrl?: string;
  isActive: boolean;
}

export interface CategoryNode extends GraphNodeData {
  angle: number;
  radius: number;
  angularVelocity: number;
  hasNotifications?: boolean;
  notificationCount?: number;
}

export interface ExecutiveSummary {
  categoryId: string;
  categoryName: string;
  summary: {
    activeItems: string[];
    recentChanges: string[];
    commitments: string[];
    extractedTasks: string[];
  };
}

export interface TimelineEntry {
  id: string;
  categoryId: string;
  title: string;
  relativeTime: string;
  absoluteTime: string;
  dueDate?: string;
  progress?: number;
  isUrgent?: boolean;
}

export interface DashboardCard {
  id: string;
  type: 'notification' | 'calendar' | 'commitment' | 'task';
  title: string;
  description?: string;
  timestamp?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'active' | 'completed';
  tags?: string[];
}
