
export interface MenuItem {
  key: string;
   icon?: React.ReactNode; 
  children?: MenuItem[];
  label: string;
  type?: string;
  disabled?: boolean;
  onClick?: () => void;
}

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