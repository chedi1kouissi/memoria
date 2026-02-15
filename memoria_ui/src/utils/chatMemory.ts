// Memory caching system for chatbot
// Handles short-term (session) and long-term (persistent) memory

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    metadata?: {
        tokens?: number;
        model?: string;
        temperature?: number;
    };
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
    metadata?: {
        totalTokens?: number;
        messageCount?: number;
    };
}

export interface MemoryContext {
    shortTerm: Message[]; // Current session messages
    longTerm: ChatSession[]; // All historical sessions
    currentSessionId: string | null;
}

class ChatMemoryManager {
    private static STORAGE_KEY = 'cognitive-chat-memory';
    private static SHORT_TERM_KEY = 'cognitive-chat-session';
    private static MAX_SHORT_TERM = 50; // Keep last 50 messages in short-term
    private static MAX_SESSIONS = 100; // Keep last 100 sessions

    // ===== SHORT-TERM MEMORY (Current Session) =====

    static getShortTermMemory(): Message[] {
        try {
            const stored = sessionStorage.getItem(this.SHORT_TERM_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load short-term memory:', error);
            return [];
        }
    }

    static addToShortTerm(message: Message): void {
        const memory = this.getShortTermMemory();
        memory.push(message);

        // Trim if exceeds max
        if (memory.length > this.MAX_SHORT_TERM) {
            memory.splice(0, memory.length - this.MAX_SHORT_TERM);
        }

        sessionStorage.setItem(this.SHORT_TERM_KEY, JSON.stringify(memory));
    }

    static clearShortTerm(): void {
        sessionStorage.removeItem(this.SHORT_TERM_KEY);
    }

    // ===== LONG-TERM MEMORY (Persistent Sessions) =====

    static getLongTermMemory(): ChatSession[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load long-term memory:', error);
            return [];
        }
    }

    static saveLongTermMemory(sessions: ChatSession[]): void {
        try {
            // Trim if exceeds max sessions
            if (sessions.length > this.MAX_SESSIONS) {
                sessions = sessions.slice(-this.MAX_SESSIONS);
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error('Failed to save long-term memory:', error);
        }
    }

    static createSession(title?: string): ChatSession {
        const session: ChatSession = {
            id: this.generateId(),
            title: title || `Chat ${new Date().toLocaleString()}`,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: {
                totalTokens: 0,
                messageCount: 0,
            },
        };
        return session;
    }

    static saveSession(session: ChatSession): void {
        const sessions = this.getLongTermMemory();
        const index = sessions.findIndex((s) => s.id === session.id);

        session.updatedAt = Date.now();
        session.metadata = {
            totalTokens: session.metadata?.totalTokens || 0,
            messageCount: session.messages.length,
        };

        if (index >= 0) {
            sessions[index] = session;
        } else {
            sessions.push(session);
        }

        this.saveLongTermMemory(sessions);
    }

    static getSession(sessionId: string): ChatSession | null {
        const sessions = this.getLongTermMemory();
        return sessions.find((s) => s.id === sessionId) || null;
    }

    static deleteSession(sessionId: string): void {
        const sessions = this.getLongTermMemory();
        const filtered = sessions.filter((s) => s.id !== sessionId);
        this.saveLongTermMemory(filtered);
    }

    static getAllSessions(): ChatSession[] {
        return this.getLongTermMemory().sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // ===== UTILITY METHODS =====

    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    static exportMemory(): string {
        const data = {
            longTerm: this.getLongTermMemory(),
            shortTerm: this.getShortTermMemory(),
            exportedAt: Date.now(),
        };
        return JSON.stringify(data, null, 2);
    }

    static importMemory(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            if (data.longTerm) {
                this.saveLongTermMemory(data.longTerm);
            }
            if (data.shortTerm) {
                sessionStorage.setItem(this.SHORT_TERM_KEY, JSON.stringify(data.shortTerm));
            }
            return true;
        } catch (error) {
            console.error('Failed to import memory:', error);
            return false;
        }
    }

    static clearAllMemory(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.SHORT_TERM_KEY);
    }
}

export default ChatMemoryManager;
