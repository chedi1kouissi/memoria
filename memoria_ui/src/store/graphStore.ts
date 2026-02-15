import { create } from 'zustand';
import type { NavItem } from '../types';

interface GraphState {
  selectedNodeId: string | null;
  zoomLevel: number;
  activeNav: NavItem;
  searchQuery: string;
  isSearching: boolean;
  focusedCluster: string | null;
  // Orbital mechanics & cinematic states
  isExpanded: boolean;
  isOrbiting: boolean;
  hasScrolledOnce: boolean;
  selectedCategory: string | null;
  dashboardView: boolean;
  setSelectedNode: (id: string | null) => void;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setActiveNav: (nav: NavItem) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  setFocusedCluster: (id: string | null) => void;
  // Orbital mechanics & cinematic actions
  setExpanded: (expanded: boolean) => void;
  setOrbiting: (orbiting: boolean) => void;
  setHasScrolled: (scrolled: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
  setDashboardView: (view: boolean) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  selectedNodeId: null,
  zoomLevel: 1,
  activeNav: 'memory-graph',
  searchQuery: '',
  isSearching: false,
  focusedCluster: null,
  // Orbital mechanics initial state
  isExpanded: false,
  isOrbiting: false,
  hasScrolledOnce: false,
  selectedCategory: null,
  dashboardView: false,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setZoomLevel: (level) => set({ zoomLevel: Math.max(0.3, Math.min(3, level)) }),
  zoomIn: () => set((state) => ({ zoomLevel: Math.min(3, state.zoomLevel + 0.2) })),
  zoomOut: () => set((state) => ({ zoomLevel: Math.max(0.3, state.zoomLevel - 0.2) })),
  resetZoom: () => set({ zoomLevel: 1, focusedCluster: null }),
  setActiveNav: (nav) => set({ activeNav: nav }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setFocusedCluster: (id) => set({ focusedCluster: id }),
  // Orbital mechanics actions
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setOrbiting: (orbiting) => set({ isOrbiting: orbiting }),
  setHasScrolled: (scrolled) => set({ hasScrolledOnce: scrolled }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setDashboardView: (view) => set({ dashboardView: view }),
}));
