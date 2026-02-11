
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