// stores/useSidebarStore.ts
import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  collapseSidebar: () => set({ isCollapsed: true }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
}));