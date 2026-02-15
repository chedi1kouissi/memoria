import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardCards as mockCards } from '../data/mockData';
import { fetchDashboard } from '../utils/apiService';
import type { DashboardCard } from '../types';

export default function Dashboard() {
    const [cards, setCards] = useState<DashboardCard[]>(mockCards);
    const [stats, setStats] = useState<{ total_events: number; total_tasks: number; total_people: number; categories: string[] } | null>(null);

    // Fetch real dashboard data from backend
    useEffect(() => {
        fetchDashboard().then((data) => {
            if (data.cards.length > 0) {
                setCards(data.cards.map((c) => ({
                    id: c.id,
                    type: c.type as DashboardCard['type'],
                    title: c.title,
                    description: c.description,
                    timestamp: c.timestamp,
                    priority: c.priority as DashboardCard['priority'],
                    status: c.status as DashboardCard['status'],
                    tags: c.tags,
                })));
                setStats(data.stats);
            }
        });
    }, []);
    return (
        <motion.div
            className="flex-1 relative bg-panel overflow-auto p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Page Header */}
            <div className="mb-12">
                <h1 className="text-4xl text-forest italic mb-2">Dashboard</h1>
                <p className="font-sans text-text-muted">
                    Your cognitive memory at a glance
                </p>
            </div>

            {/* Polaroid-style Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        className="group"
                        initial={{ opacity: 0, y: 20, rotate: 0 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            rotate: index % 3 === 0 ? -2 : index % 3 === 1 ? 1 : -1,
                        }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.2, 0, 0, 1],
                        }}
                        whileHover={{
                            y: -8,
                            rotate: 0,
                            transition: { duration: 0.3 },
                        }}
                    >
                        {/* Pin/String visual element */}
                        <div className="flex justify-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-sienna/40 shadow-sm" />
                            <div
                                className="w-0.5 h-4 bg-gradient-to-b from-sienna/20 to-transparent absolute"
                                style={{ top: 0 }}
                            />
                        </div>

                        {/* Polaroid Card */}
                        <div className="bg-white p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-border relative">
                            {/* Subtle tape effect on top corners */}
                            <div className="absolute -top-2 -left-2 w-12 h-6 bg-white/60 border border-border/40 rotate-45 opacity-40" />
                            <div className="absolute -top-2 -right-2 w-12 h-6 bg-white/60 border border-border/40 -rotate-45 opacity-40" />

                            {/* Card Type Badge */}
                            <div className="mb-4 flex items-center justify-between">
                                <span
                                    className={`font-sans text-[10px] uppercase tracking-wider px-2 py-1 rounded ${card.type === 'task'
                                        ? 'bg-forest/10 text-forest'
                                        : card.type === 'calendar'
                                            ? 'bg-sienna/10 text-sienna'
                                            : card.type === 'notification'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-purple-50 text-purple-600'
                                        }`}
                                >
                                    {card.type}
                                </span>

                                {/* Priority Indicator */}
                                {card.priority && (
                                    <div className="flex items-center gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-3 rounded-full ${card.priority === 'high'
                                                    ? i < 3
                                                        ? 'bg-sienna'
                                                        : 'bg-border'
                                                    : card.priority === 'medium'
                                                        ? i < 2
                                                            ? 'bg-sienna/60'
                                                            : 'bg-border'
                                                        : i < 1
                                                            ? 'bg-sienna/30'
                                                            : 'bg-border'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <h3 className="text-lg text-forest font-medium mb-2 group-hover:text-sienna transition-colors">
                                {card.title}
                            </h3>

                            {card.description && (
                                <p className="font-sans text-sm text-text-muted mb-4 leading-relaxed">
                                    {card.description}
                                </p>
                            )}

                            {/* Timestamp */}
                            {card.timestamp && (
                                <div className="flex items-center gap-2 font-sans text-xs text-text-muted mb-3">
                                    <span className="material-symbols-outlined !text-[14px]">
                                        schedule
                                    </span>
                                    <span>{card.timestamp}</span>
                                </div>
                            )}

                            {/* Tags */}
                            {card.tags && card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {card.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="font-sans text-[10px] px-2 py-0.5 bg-creme text-text-muted rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Status Indicator (bottom right) */}
                            {card.status && (
                                <div className="absolute bottom-4 right-4">
                                    <div
                                        className={`w-2 h-2 rounded-full ${card.status === 'completed'
                                            ? 'bg-green-500'
                                            : card.status === 'active'
                                                ? 'bg-sienna'
                                                : 'bg-border'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Kanban Section */}
            <div className="mt-16 max-w-7xl">
                <h2 className="text-2xl text-forest italic mb-8">Task Board</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pending Column */}
                    <div className="bg-white/40 backdrop-blur-sm border border-border p-6 rounded">
                        <h3 className="font-sans text-sm uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-border" />
                            Pending
                        </h3>
                        <div className="space-y-3">
                            {cards
                                .filter((card) => card.status === 'pending')
                                .map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-white p-3 border border-border rounded cursor-pointer hover:border-forest transition-colors"
                                    >
                                        <p className="font-sans text-sm text-text-main font-medium">
                                            {card.title}
                                        </p>
                                        {card.timestamp && (
                                            <p className="font-sans text-xs text-text-muted mt-1">
                                                {card.timestamp}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Active Column */}
                    <div className="bg-white/40 backdrop-blur-sm border border-border p-6 rounded">
                        <h3 className="font-sans text-sm uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-sienna" />
                            Active
                        </h3>
                        <div className="space-y-3">
                            {cards
                                .filter((card) => card.status === 'active')
                                .map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-white p-3 border border-sienna/30 rounded cursor-pointer hover:border-sienna transition-colors"
                                    >
                                        <p className="font-sans text-sm text-text-main font-medium">
                                            {card.title}
                                        </p>
                                        {card.timestamp && (
                                            <p className="font-sans text-xs text-text-muted mt-1">
                                                {card.timestamp}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="bg-white/40 backdrop-blur-sm border border-border p-6 rounded">
                        <h3 className="font-sans text-sm uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Completed
                        </h3>
                        <div className="space-y-3">
                            {cards
                                .filter((card) => card.status === 'completed')
                                .map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-white p-3 border border-border rounded opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                                    >
                                        <p className="font-sans text-sm text-text-main font-medium line-through">
                                            {card.title}
                                        </p>
                                        {card.timestamp && (
                                            <p className="font-sans text-xs text-text-muted mt-1">
                                                {card.timestamp}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
