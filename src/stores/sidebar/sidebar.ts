import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Định nghĩa types
export interface SidebarState {
  collapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
}

export interface SidebarActions {
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setSelectedKeys: (keys: string[]) => void;
  setOpenKeys: (keys: string[]) => void;
  resetSidebar: () => void;
}

export type SidebarStore = SidebarState & SidebarActions;

// Initial state
const initialState: SidebarState = {
  collapsed: false,
  selectedKeys: ['/'],
  openKeys: [],
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set collapsed state
      setCollapsed: (collapsed: boolean) => {
        set({ collapsed });
      },

      // Toggle collapsed state
      toggleCollapsed: () => {
        const { collapsed } = get();
        set({ collapsed: !collapsed });
        
        // Auto-close open keys when collapsing to avoid visual issues
        if (!collapsed) {
          set({ openKeys: [] });
        }
      },

      // Set selected menu keys
      setSelectedKeys: (selectedKeys: string[]) => {
        set({ selectedKeys });
      },

      // Set open submenu keys
      setOpenKeys: (openKeys: string[]) => {
        set({ openKeys });
      },

      // Reset to initial state
      resetSidebar: () => {
        set(initialState);
      },
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ 
        collapsed: state.collapsed,
      }),
    }
  )
);

// Export hooks selectors với proper types
export const useSidebarCollapsed = () => 
  useSidebarStore((state) => state.collapsed);

export const useSidebarActions = () => 
  useSidebarStore((state) => ({
    setCollapsed: state.setCollapsed,
    toggleCollapsed: state.toggleCollapsed,
    setSelectedKeys: state.setSelectedKeys,
    setOpenKeys: state.setOpenKeys,
    resetSidebar: state.resetSidebar,
  }));