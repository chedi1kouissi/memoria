import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { GraphNodeData, GraphEdge } from '../types';
import { useGraphStore } from '../store/graphStore';

interface GraphEdgesProps {
  nodes: GraphNodeData[];
  edges: GraphEdge[];
  highlightedIds: Set<string>;
  isSearching: boolean;
}

export default function GraphEdges({ nodes, edges, highlightedIds, isSearching }: GraphEdgesProps) {
  const selectedCategory = useGraphStore((s) => s.selectedCategory);

  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach((node) => {
      positions.set(node.id, { x: node.x, y: node.y });
    });
    return positions;
  }, [nodes]);

  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        {/* Gradient for energy flow effect */}
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(165, 125, 85, 0)" />
          <stop offset="50%" stopColor="rgba(165, 125, 85, 0.4)" />
          <stop offset="100%" stopColor="rgba(165, 125, 85, 0)" />
        </linearGradient>

        {/* Animated gradient for selected edge */}
        <linearGradient id="selectedEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(45, 70, 53, 0.2)" />
          <stop offset="50%" stopColor="rgba(45, 70, 53, 0.8)" />
          <stop offset="100%" stopColor="rgba(45, 70, 53, 0.2)" />
        </linearGradient>

        {/* Filter for glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edges.map((edge, index) => {
        const sourcePos = nodePositions.get(edge.source);
        const targetPos = nodePositions.get(edge.target);

        if (!sourcePos || !targetPos) return null;

        const x1 = sourcePos.x;
        const y1 = sourcePos.y;
        const x2 = targetPos.x;
        const y2 = targetPos.y;

        const isHighlighted =
          isSearching &&
          highlightedIds.has(edge.source) &&
          highlightedIds.has(edge.target);

        const isSelected = selectedCategory === edge.target && edge.source === 'you';
        const isDimmed = selectedCategory !== null && !isSelected;

        // Calculate midpoint for energy flow animation
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={`${edge.source}-${edge.target}`}>
            {/* Main edge line */}
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isSelected ? '#2d4635' : isHighlighted ? '#a0522d' : '#e8e6e1'}
              strokeWidth={isSelected ? 2 : isHighlighted ? 1.5 : 1}
              opacity={isDimmed ? 0.2 : isHighlighted || isSelected ? 1 : 0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.2,
                delay: index * 0.1,
                ease: [0.2, 0, 0, 1],
              }}
              filter={isSelected ? 'url(#glow)' : undefined}
            />

            {/* Energy flow particles (only on active/highlighted edges) */}
            {!isDimmed && (
              <>
                <motion.circle
                  r="2"
                  fill={isSelected ? '#2d4635' : '#a0522d'}
                  opacity="0.6"
                  initial={{ cx: x1, cy: y1 }}
                  animate={{
                    cx: [x1, midX, x2],
                    cy: [y1, midY, y2],
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.circle
                  r="1.5"
                  fill={isSelected ? '#2d4635' : '#a0522d'}
                  opacity="0.4"
                  initial={{ cx: x1, cy: y1 }}
                  animate={{
                    cx: [x1, midX, x2],
                    cy: [y1, midY, y2],
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.3 + 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </>
            )}

            {/* Glow effect on hover/selection */}
            {isSelected && (
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(45, 70, 53, 0.2)"
                strokeWidth="8"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </g>
        );
      })}
    </motion.svg>
  );
}
