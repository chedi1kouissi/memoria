import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMemoryManager, { type Message, type ChatSession } from '../utils/chatMemory';
import AIService from '../utils/aiService';

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [showSessions, setShowSessions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load sessions and initialize
    useEffect(() => {
        const loadedSessions = ChatMemoryManager.getAllSessions();
        setSessions(loadedSessions);

        // Load short-term memory or create new session
        const shortTerm = ChatMemoryManager.getShortTermMemory();
        if (shortTerm.length > 0) {
            setMessages(shortTerm);
        } else {
            // Create new session
            const newSession = ChatMemoryManager.createSession();
            setCurrentSession(newSession);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save to short-term memory on every message update
    useEffect(() => {
        if (messages.length > 0) {
            ChatMemoryManager.clearShortTerm();
            messages.forEach((msg) => ChatMemoryManager.addToShortTerm(msg));
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: ChatMemoryManager.generateId(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call AI service (currently placeholder)
            const aiResponse = await AIService.sendMessage(messages, userMessage.content);
            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error('Failed to get AI response:', error);
            const errorMessage: Message = {
                id: ChatMemoryManager.generateId(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSaveSession = () => {
        if (messages.length === 0) return;

        const session: ChatSession = currentSession || ChatMemoryManager.createSession();
        session.messages = messages;
        ChatMemoryManager.saveSession(session);

        setSessions(ChatMemoryManager.getAllSessions());
        setCurrentSession(session);
    };

    const handleLoadSession = (session: ChatSession) => {
        setMessages(session.messages);
        setCurrentSession(session);
        setShowSessions(false);
        ChatMemoryManager.clearShortTerm();
        session.messages.forEach((msg) => ChatMemoryManager.addToShortTerm(msg));
    };

    const handleNewChat = () => {
        handleSaveSession(); // Save current chat first
        const newSession = ChatMemoryManager.createSession();
        setMessages([]);
        setCurrentSession(newSession);
        ChatMemoryManager.clearShortTerm();
    };

    const handleDeleteSession = (sessionId: string) => {
        ChatMemoryManager.deleteSession(sessionId);
        setSessions(ChatMemoryManager.getAllSessions());
    };

    const handleExportMemory = () => {
        const data = ChatMemoryManager.exportMemory();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-memory-${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="flex-1 flex flex-col relative bg-panel h-screen overflow-hidden">
            {/* Header */}
            <div className="border-b border-border bg-white/40 backdrop-blur-sm px-8 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl text-forest italic">Ask Memory</h1>
                        <p className="font-sans text-xs text-text-muted mt-1">
                            Chat with your cognitive memory
                            {currentSession && ` • Session: ${currentSession.title}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleNewChat}
                            className="font-sans text-sm px-4 py-2 border border-forest text-forest hover:bg-forest hover:text-white transition-colors cursor-pointer bg-transparent rounded flex items-center gap-2"
                            title="New Chat"
                        >
                            <span className="material-symbols-outlined !text-[18px]">add</span>
                            New
                        </button>
                        <button
                            onClick={handleSaveSession}
                            className="font-sans text-sm px-4 py-2 border border-border text-text-main hover:border-forest hover:text-forest transition-colors cursor-pointer bg-transparent rounded flex items-center gap-2"
                            title="Save Session"
                        >
                            <span className="material-symbols-outlined !text-[18px]">save</span>
                            Save
                        </button>
                        <button
                            onClick={() => setShowSessions(!showSessions)}
                            className="font-sans text-sm px-4 py-2 border border-border text-text-main hover:border-forest hover:text-forest transition-colors cursor-pointer bg-transparent rounded flex items-center gap-2"
                            title="History"
                        >
                            <span className="material-symbols-outlined !text-[18px]">history</span>
                            History
                        </button>
                        <button
                            onClick={handleExportMemory}
                            className="font-sans text-sm px-4 py-2 border border-border text-text-main hover:border-forest hover:text-forest transition-colors cursor-pointer bg-transparent rounded flex items-center gap-2"
                            title="Export"
                        >
                            <span className="material-symbols-outlined !text-[18px]">download</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-6xl text-forest/20 mb-4">
                                    chat_bubble
                                </span>
                                <h3 className="text-xl text-forest italic mb-2">Start a conversation</h3>
                                <p className="font-sans text-sm text-text-muted">
                                    Ask anything about your cognitive memory
                                </p>
                            </div>
                        )}

                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] ${message.role === 'user'
                                            ? 'bg-forest text-white'
                                            : 'bg-white border border-border text-text-main'
                                            } rounded-2xl px-5 py-3 shadow-sm`}
                                    >
                                        <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        <div
                                            className={`flex items-center gap-2 mt-2 text-[10px] ${message.role === 'user' ? 'text-white/60' : 'text-text-muted'
                                                }`}
                                        >
                                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                            {message.metadata?.tokens && (
                                                <>
                                                    <span>•</span>
                                                    <span>{message.metadata.tokens} tokens</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white border border-border rounded-2xl px-5 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 bg-forest/40 rounded-full"
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-sans text-xs text-text-muted">Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Session History Sidebar */}
                <AnimatePresence>
                    {showSessions && (
                        <motion.div
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-80 border-l border-border bg-white/40 backdrop-blur-sm overflow-y-auto shrink-0"
                        >
                            <div className="p-6">
                                <h3 className="font-sans text-sm uppercase tracking-wider text-text-muted mb-4">
                                    Chat History
                                </h3>
                                <div className="space-y-2">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="bg-white border border-border rounded p-3 hover:border-forest transition-colors cursor-pointer group"
                                        >
                                            <div
                                                className="flex items-start justify-between"
                                                onClick={() => handleLoadSession(session)}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-sans text-sm text-text-main font-medium mb-1">
                                                        {session.title}
                                                    </p>
                                                    <p className="font-sans text-xs text-text-muted">
                                                        {session.messages.length} messages •{' '}
                                                        {new Date(session.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity material-symbols-outlined !text-[16px] text-sienna hover:text-red-600 bg-transparent border-none cursor-pointer p-0"
                                                >
                                                    delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {sessions.length === 0 && (
                                        <p className="font-sans text-sm text-text-muted text-center py-8">
                                            No saved sessions yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-white/40 backdrop-blur-sm px-8 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask anything about your memory..."
                            className="w-full font-sans text-sm px-4 py-3 border border-border rounded-lg resize-none focus:outline-none focus:border-forest transition-colors bg-white"
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isTyping}
                        className={`px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer border-none ${input.trim() && !isTyping
                            ? 'bg-forest text-white hover:bg-forest/90'
                            : 'bg-border text-text-muted cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined !text-[20px]">send</span>
                    </button>
                </div>
                <p className="font-sans text-[10px] text-text-muted text-center mt-2">
                    Powered by MemoraOS ReflectAgent • Ensure backend server is running on port 5000
                </p>
            </div>
        </div>
    );
}
