import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../store/graphStore';
import { executiveSummaries as mockSummaries, timelineEntries as mockTimeline } from '../data/mockData';
import { fetchCategories } from '../utils/apiService';
import type { ExecutiveSummary, TimelineEntry } from '../types';

export default function ContextPanel() {
  const selectedCategory = useGraphStore((s) => s.selectedCategory);
  const [backendSummary, setBackendSummary] = useState<ExecutiveSummary | null>(null);
  const [backendTimeline, setBackendTimeline] = useState<TimelineEntry[]>([]);

  // Fetch real data when category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setBackendSummary(null);
      setBackendTimeline([]);
      return;
    }

    // Try backend first
    const catName = selectedCategory.replace('category_', '');
    fetchCategories(catName).then((categories) => {
      if (categories.length > 0) {
        const cat = categories[0];
        setBackendSummary({
          categoryId: selectedCategory,
          categoryName: cat.name,
          summary: {
            activeItems: cat.executive_summary.key_active_items,
            recentChanges: cat.executive_summary.recent_changes,
            commitments: cat.executive_summary.people_involved.map((p) => `Involves ${p}`),
            extractedTasks: cat.executive_summary.projects.length > 0
              ? cat.executive_summary.projects.map((p) => `Project: ${p}`)
              : cat.executive_summary.technologies.map((t) => `Tech: ${t}`),
          },
        });
        setBackendTimeline(
          cat.timeline.map((t, i) => ({
            id: `bt_${i}`,
            categoryId: selectedCategory,
            title: t.primary_entity || t.summary.slice(0, 50),
            relativeTime: _relativeTime(t.timestamp),
            absoluteTime: _formatTime(t.timestamp),
            isUrgent: t.sentiment === 'negative',
            dueDate: t.action_items.length > 0 ? 'Has action items' : undefined,
            progress: t.action_items.length > 0 ? 50 : undefined,
          }))
        );
      }
    });
  }, [selectedCategory]);

  // Helper functions
  function _relativeTime(ts: string): string {
    try {
      const d = new Date(ts);
      const diff = Date.now() - d.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return ''; }
  }

  function _formatTime(ts: string): string {
    try {
      return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return ts; }
  }

  // Use backend data if available, otherwise mock
  const summary: ExecutiveSummary | undefined = backendSummary ||
    mockSummaries.find((s) => s.categoryId === selectedCategory);

  const timeline: TimelineEntry[] = backendTimeline.length > 0
    ? backendTimeline
    : mockTimeline.filter((t) => t.categoryId === selectedCategory);

  const isVisible = selectedCategory !== null && summary;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          className="w-80 h-full flex flex-col py-10 border-l border-border shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <div className="px-8 mb-8 flex justify-between items-end">
            <h2 className="text-2xl text-forest italic">{summary.categoryName}</h2>
            <button
              className="material-symbols-outlined text-text-muted cursor-pointer hover:text-forest transition-colors bg-transparent border-none p-0"
              onClick={() => useGraphStore.getState().setSelectedCategory(null)}
            >
              close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 space-y-8">
            {/* Executive Summary */}
            <div>
              <h3 className="font-sans text-xs uppercase tracking-wider text-text-muted mb-4">
                Executive Summary
              </h3>

              <div className="space-y-6">
                {/* Active Items */}
                {summary.summary.activeItems.length > 0 && (
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-wide text-forest/70 mb-2 font-medium">
                      Key Active Items
                    </h4>
                    <ul className="space-y-1.5">
                      {summary.summary.activeItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-sienna mt-0.5">
                            fiber_manual_record
                          </span>
                          <span className="font-sans text-sm text-text-main leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent Changes */}
                {summary.summary.recentChanges.length > 0 && (
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-wide text-forest/70 mb-2 font-medium">
                      Recent Changes
                    </h4>
                    <ul className="space-y-1.5">
                      {summary.summary.recentChanges.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-sienna mt-0.5">
                            trending_up
                          </span>
                          <span className="font-sans text-sm text-text-main leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commitments */}
                {summary.summary.commitments.length > 0 && (
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-wide text-forest/70 mb-2 font-medium">
                      Important Commitments
                    </h4>
                    <ul className="space-y-1.5">
                      {summary.summary.commitments.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-sienna mt-0.5">
                            event
                          </span>
                          <span className="font-sans text-sm text-text-main leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Tasks */}
                {summary.summary.extractedTasks.length > 0 && (
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-wide text-forest/70 mb-2 font-medium">
                      Extracted Tasks
                    </h4>
                    <ul className="space-y-1.5">
                      {summary.summary.extractedTasks.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-sienna mt-0.5">
                            check_circle
                          </span>
                          <span className="font-sans text-sm text-text-main leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            {timeline.length > 0 && (
              <div>
                <h3 className="font-sans text-xs uppercase tracking-wider text-text-muted mb-4">
                  Timeline
                </h3>

                <div className="space-y-4">
                  {timeline.map((entry) => (
                    <motion.div
                      key={entry.id}
                      className={`border-l-2 pl-4 pb-3 ${entry.isUrgent ? 'border-sienna' : 'border-border'
                        }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-sans text-sm text-text-main font-medium">
                          {entry.title}
                        </span>
                        {entry.isUrgent && (
                          <span className="material-symbols-outlined text-[14px] text-sienna">
                            priority_high
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-text-muted font-sans mb-2">
                        <span>{entry.relativeTime}</span>
                        <span>•</span>
                        <span>{entry.absoluteTime}</span>
                      </div>

                      {/* Progress bar for items with due dates */}
                      {entry.progress !== undefined && entry.dueDate && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-sans mb-1">
                            <span className="text-text-muted">Progress</span>
                            <span className="text-forest font-medium">{entry.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${entry.isUrgent ? 'bg-sienna' : 'bg-forest'
                                }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${entry.progress}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
