/**
 * MemoraOS API Service
 * Connects the React frontend to the Flask backend (localhost:5000).
 * Falls back to mock data when backend is unavailable.
 */

const API_BASE = 'http://localhost:5000/api';

// ============================================================
// Types
// ============================================================

export interface BackendNode {
    id: string;
    type: string;
    label: string;
    name: string;
    summary: string;
    timestamp: string;
    event_type: string;
    layer: string;
    source: string;
    notifications?: number;
    entities?: Record<string, string[]>;
    action_items?: string[];
    sentiment?: string;
    context_tags?: string[];
}

export interface BackendEdge {
    source: string;
    target: string;
    relation: string;
}

export interface GraphResponse {
    nodes: BackendNode[];
    edges: BackendEdge[];
}

export interface CategorySummary {
    name: string;
    event_count: number;
    executive_summary: {
        key_active_items: string[];
        recent_changes: string[];
        people_involved: string[];
        projects: string[];
        technologies: string[];
    };
    timeline: Array<{
        timestamp: string;
        event_type: string;
        primary_entity: string;
        summary: string;
        sentiment: string;
        action_items: string[];
    }>;
}

export interface DashboardCard {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    status: string;
    timestamp: string;
    tags: string[];
    source_event_type: string;
}

export interface DashboardResponse {
    cards: DashboardCard[];
    stats: {
        total_events: number;
        total_tasks: number;
        total_people: number;
        categories: string[];
    };
}

export interface ChatResponse {
    role: string;
    content: string;
    timestamp: string;
}

// ============================================================
// API Functions
// ============================================================

async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`[API] Backend unavailable at ${url}, using fallback data`);
        return fallback;
    }
}

/**
 * Fetch the full graph (nodes + edges) from backend.
 */
export async function fetchGraph(): Promise<GraphResponse> {
    const result = await fetchWithFallback<GraphResponse>(
        `${API_BASE}/graph`,
        { nodes: [], edges: [] }
    );
    console.log('[API] fetchGraph result:', {
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
        sampleNode: result.nodes[0],
    });
    return result;
}

/**
 * Fetch category summaries for the context panel.
 * Optionally filter by category name.
 */
export async function fetchCategories(name?: string): Promise<CategorySummary[]> {
    const url = name
        ? `${API_BASE}/graph/categories?name=${encodeURIComponent(name)}`
        : `${API_BASE}/graph/categories`;

    const data = await fetchWithFallback<{ categories: CategorySummary[] }>(
        url,
        { categories: [] }
    );
    return data.categories;
}

/**
 * Fetch dashboard cards (tasks, commitments, calendar items).
 */
export async function fetchDashboard(): Promise<DashboardResponse> {
    const result = await fetchWithFallback<DashboardResponse>(
        `${API_BASE}/dashboard`,
        { cards: [], stats: { total_events: 0, total_tasks: 0, total_people: 0, categories: [] } }
    );
    console.log('[API] fetchDashboard result:', {
        cardCount: result.cards.length,
        stats: result.stats,
    });
    return result;
}

/**
 * Fetch all trace events.
 */
export async function fetchTrace(): Promise<any[]> {
    const data = await fetchWithFallback<{ traces: any[] }>(
        `${API_BASE}/trace`,
        { traces: [] }
    );
    return data.traces;
}

/**
 * Send a chat message to the ReflectAgent backend.
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
            signal: AbortSignal.timeout(30000), // 30s timeout for LLM
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('[API] Chat error:', error);
        return {
            role: 'assistant',
            content: 'Backend is not available. Please ensure the MemoraOS server is running on port 5000.',
            timestamp: new Date().toISOString(),
        };
    }
}

/**
 * Check if the backend is available.
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
        return response.ok;
    } catch {
        return false;
    }
}
