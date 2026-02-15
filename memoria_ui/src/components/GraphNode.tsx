import { motion } from 'framer-motion';
import type { GraphNodeData } from '../types';
import { useGraphStore } from '../store/graphStore';
import { categoryNodes } from '../data/mockData';

interface GraphNodeProps {
  node: GraphNodeData;
  isHighlighted: boolean;
  isDimmed: boolean;
  onCategoryHover?: (categoryId: string | null) => void;
}

export default function GraphNode({ node, isHighlighted, isDimmed, onCategoryHover }: GraphNodeProps) {
  const setSelectedNode = useGraphStore((s) => s.setSelectedNode);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const setSelectedCategory = useGraphStore((s) => s.setSelectedCategory);
  const selectedCategory = useGraphStore((s) => s.selectedCategory);
  const setExpanded = useGraphStore((s) => s.setExpanded);
  const setOrbiting = useGraphStore((s) => s.setOrbiting);

  const isSelected = selectedNodeId === node.id || selectedCategory === node.id;

  const diameter = node.size * 2;

  // Check if this category has notifications
  const categoryData = categoryNodes.find((c) => c.id === node.id);
  const hasNotifications = categoryData?.hasNotifications;
  const notificationCount = categoryData?.notificationCount || 0;

  // Handle click on "You" node - collapse everything
  const handleCentralClick = () => {
    setExpanded(false);
    setOrbiting(false);
    setSelectedCategory(null);
    setSelectedNode(null);
  };

  // Handle click on category node
  const handleCategoryClick = () => {
    setSelectedCategory(node.id);
    setSelectedNode(node.id);
    setOrbiting(false); // Pause orbital motion
  };

  if (node.type === 'central') {
    return (
      <motion.div
        className="absolute z-10 cursor-pointer group"
        style={{
          left: `calc(50% + ${node.x}px)`,
          top: `calc(50% + ${node.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: isHighlighted ? 1.1 : 1,
          opacity: isDimmed ? 0.3 : 1,
        }}
        transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
        onClick={handleCentralClick}
      >
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{
            width: 160,
            height: 160,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(165, 125, 85, 0.4) 0%, transparent 70%)',
          }}
        />

        {/* Orbiting micro-particles */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-sienna/40"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * 70,
                  Math.cos(((angle + 360) * Math.PI) / 180) * 70,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * 70,
                  Math.sin(((angle + 360) * Math.PI) / 180) * 70,
                ],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}

        <div
          className="rounded-full border border-forest/30 flex items-center justify-center bg-white shadow-xs transition-all duration-700 group-hover:shadow-xl group-hover:border-forest/50"
          style={{ width: 128, height: 128 }}
        >
          <div className="w-24 h-24 rounded-full border border-forest/10 flex items-center justify-center text-xl tracking-[0.2em] font-light text-forest">
            {node.label}
          </div>
        </div>
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-forest/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 128, height: 128 }}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute group"
      style={{
        left: `calc(50% + ${node.x}px)`,
        top: `calc(50% + ${node.y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isHighlighted ? 1.15 : isDimmed ? 0.85 : isSelected ? 1.08 : 1,
        opacity: isDimmed ? 0.2 : 1,
        z: isSelected ? 20 : 0,
      }}
      transition={{
        duration: 0.7,
        ease: [0.2, 0, 0, 1],
        delay: node.id ? categoryNodes.findIndex((c) => c.id === node.id) * 0.08 : 0,
      }}
      onMouseEnter={() => onCategoryHover?.(node.id)}
      onMouseLeave={() => onCategoryHover?.(null)}
    >
      <motion.div
        className={`rounded-full flex flex-col items-center justify-center cursor-pointer p-4 text-center bg-white border transition-all duration-500 relative ${isSelected || isHighlighted
            ? 'border-forest shadow-lg'
            : 'border-border hover:border-forest hover:-translate-y-0.5'
          }`}
        style={{ width: diameter, height: diameter }}
        onClick={handleCategoryClick}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      >
        <span className="material-symbols-outlined text-forest opacity-60 mb-1">
          {node.icon}
        </span>
        <span className="font-sans text-[10px] tracking-tighter text-text-muted group-hover:text-forest uppercase leading-tight">
          {node.label}
        </span>

        {/* Notification alert dot */}
        {hasNotifications && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sienna flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-[8px] text-white font-sans font-medium">
              {notificationCount}
            </span>
          </motion.div>
        )}
      </motion.div>

      {isHighlighted && (
        <motion.div
          className="absolute rounded-full border border-forest/30 pointer-events-none"
          style={{
            width: diameter + 12,
            height: diameter + 12,
            left: -6,
            top: -6,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}
