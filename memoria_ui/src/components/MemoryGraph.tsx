import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../store/graphStore';
import { graphNodes as mockGraphNodes, categoryNodes as mockCategoryNodes, graphEdges as mockGraphEdges } from '../data/mockData';
import { useFirstScroll } from '../hooks/useFirstScroll';
import { useOrbitalAnimation } from '../hooks/useOrbitalAnimation';
import { fetchGraph } from '../utils/apiService';
import type { BackendNode } from '../utils/apiService';
import type { CategoryNode, GraphNodeData, GraphEdge } from '../types';
import GraphHeader from './GraphHeader';
import GraphNode from './GraphNode';
import GraphEdges from './GraphEdges';
import ZoomControls from './ZoomControls';

// Map backend category icons
const CATEGORY_ICONS: Record<string, string> = {
  work: 'work', finances: 'account_balance', travel: 'flight',
  social: 'groups', health: 'favorite', projects: 'rocket_launch',
  learning: 'school', reading: 'menu_book', ideas: 'lightbulb',
  wellness: 'spa', technology: 'memory', product_development: 'developer_board',
  general: 'category',
};

function backendToCategories(nodes: BackendNode[]): CategoryNode[] {
  const catNodes = nodes.filter((n) => n.type === 'CATEGORY');
  return catNodes.map((node, i) => ({
    id: node.id,
    label: node.name.toUpperCase(),
    icon: CATEGORY_ICONS[node.name.toLowerCase()] || CATEGORY_ICONS[node.id.replace('category_', '')] || 'category',
    type: 'cluster' as const,
    size: 42 + Math.random() * 6,
    x: 0,
    y: 0,
    importance: 0.8,
    angle: (360 / Math.max(catNodes.length, 1)) * i,
    radius: 280,
    angularVelocity: 0.00028 + Math.random() * 0.00004,
    hasNotifications: (node.notifications || 0) > 0,
    notificationCount: node.notifications || 0,
  }));
}

function backendToEdges(edges: { source: string; target: string; relation: string }[]): GraphEdge[] {
  return edges
    .filter((e) => e.relation === 'HAS_CATEGORY')
    .map((e) => ({ source: e.source, target: e.target }));
}

export default function MemoryGraph() {
  const zoomLevel = useGraphStore((s) => s.zoomLevel);
  const setZoomLevel = useGraphStore((s) => s.setZoomLevel);
  const searchQuery = useGraphStore((s) => s.searchQuery);
  const isSearching = useGraphStore((s) => s.isSearching);
  const isExpanded = useGraphStore((s) => s.isExpanded);
  const isOrbiting = useGraphStore((s) => s.isOrbiting);
  const setOrbiting = useGraphStore((s) => s.setOrbiting);
  const selectedCategory = useGraphStore((s) => s.selectedCategory);

  const containerRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Backend data state
  const [liveGraphNodes, setLiveGraphNodes] = useState<GraphNodeData[]>(mockGraphNodes);
  const [liveCategoryNodes, setLiveCategoryNodes] = useState<CategoryNode[]>(mockCategoryNodes);
  const [liveGraphEdges, setLiveGraphEdges] = useState<GraphEdge[]>(mockGraphEdges);
  const [backendConnected, setBackendConnected] = useState(false);

  // Fetch real graph data from backend
  useEffect(() => {
    let cancelled = false;
    fetchGraph().then((data) => {
      if (cancelled) return;
      if (data.nodes.length > 0) {
        const categories = backendToCategories(data.nodes);
        const edges = backendToEdges(data.edges);

        // Find central node
        const centralNode = data.nodes.find((n) => n.type === 'CENTRAL');
        if (centralNode) {
          setLiveGraphNodes([{
            id: centralNode.id,
            label: centralNode.label,
            icon: '',
            type: 'central', // Frontend expects lowercase
            size: 64,
            x: 0,
            y: 0,
            importance: 1,
          }]);
        }

        if (categories.length > 0) {
          setLiveCategoryNodes(categories);
          setLiveGraphEdges(edges.length > 0 ? edges : []);
          setBackendConnected(true);
        }
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Initialize first scroll detection
  useFirstScroll();

  // Get orbital positions for categories
  const orbitalPositions = useOrbitalAnimation(liveCategoryNodes, isOrbiting, isExpanded);

  // Pause orbiting when hovering or selecting a category
  useEffect(() => {
    if (hoveredCategory || selectedCategory) {
      setOrbiting(false);
    } else if (isExpanded) {
      setOrbiting(true);
    }
  }, [hoveredCategory, selectedCategory, isExpanded, setOrbiting]);

  // Create combined nodes array with updated positions
  const displayNodes = useMemo(() => {
    if (!isExpanded) {
      return liveGraphNodes;
    }

    const positionedCategories = liveCategoryNodes.map((cat) => {
      const pos = orbitalPositions.get(cat.id) || { x: 0, y: 0 };
      return {
        ...cat,
        x: pos.x,
        y: pos.y,
      };
    });

    return [...liveGraphNodes, ...positionedCategories];
  }, [isExpanded, orbitalPositions, liveGraphNodes, liveCategoryNodes]);

  const highlightedIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const query = searchQuery.toLowerCase();
    const matched = new Set<string>();
    matched.add('you');
    displayNodes.forEach((node) => {
      if (node.label.toLowerCase().includes(query)) {
        matched.add(node.id);
      }
    });
    return matched;
  }, [searchQuery, displayNodes]);

  // Removed zoom on scroll to avoid conflict with first-scroll expansion trigger
  // Zoom can still be controlled via keyboard shortcuts (+, -, 0)
  // or the zoom controls UI component

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panOffset };
    },
    [panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          setZoomLevel(zoomLevel + 0.2);
          break;
        case '-':
          setZoomLevel(zoomLevel - 0.2);
          break;
        case '0':
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel, setZoomLevel]);

  return (
    <main
      ref={containerRef}
      className="flex-1 relative bg-panel overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHxjfkQGLZQJMwRtrI24_faC6Bi_Bg-5BAAlACLmLX1tRxiDqJRjN5AEkyZ7JhycFwzY-A_XIYwg_WJ9fEbz8ha5HepitS_z0FleGD_Hk-T3opPDEMzMCHbhByP4vGfmZu2RFX8AH37mxj3uYYBSZ0C22267aJ-xM4mafvZCL-p65OIFrAjVP3IgKVwCHv6e4bzqnjohvnTaY3ZnxOHzlc8MYeYTCIG203UaYRJrW_MSToMqQ03lqWpPs2zOOxVi08SOuNkDeg43U')",
          backgroundSize: 'cover',
        }}
      />

      <GraphHeader />

      {/* Graph canvas */}
      <motion.div
        className="w-full h-full relative flex items-center justify-center"
        animate={{
          scale: zoomLevel,
          x: panOffset.x,
          y: panOffset.y,
        }}
        transition={{
          duration: isDragging ? 0 : 0.6,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <AnimatePresence>
          {isExpanded && (
            <GraphEdges
              nodes={displayNodes}
              edges={liveGraphEdges}
              highlightedIds={highlightedIds}
              isSearching={isSearching || searchQuery.length > 0}
            />
          )}
        </AnimatePresence>

        {displayNodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            isHighlighted={highlightedIds.size > 0 && highlightedIds.has(node.id)}
            isDimmed={
              (highlightedIds.size > 0 && !highlightedIds.has(node.id)) ||
              (selectedCategory !== null && node.id !== selectedCategory && node.id !== 'you')
            }
            onCategoryHover={setHoveredCategory}
          />
        ))}
      </motion.div>

      <ZoomControls />
    </main>
  );
}
