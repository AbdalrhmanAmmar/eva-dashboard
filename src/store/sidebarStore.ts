import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isHidden: boolean;
  toggleCollapse: () => void;
  toggleVisibility: () => void;
  hideSidebar: () => void;
  showSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isHidden: false,
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  toggleVisibility: () => set((s) => ({ isHidden: !s.isHidden })),
  hideSidebar: () => set({ isHidden: true }),
  showSidebar: () => set({ isHidden: false }),
}));
