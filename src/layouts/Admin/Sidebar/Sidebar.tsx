import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Divider } from 'antd';
import type { MenuProps } from 'antd';
import { useSidebarStore } from '../../../stores/sidebar/sidebar';
import "./Sidebar.scss";
export type MenuItem = Required<MenuProps>['items'][number];
const { Sider } = Layout;

interface SidebarProps {
  selectedMenu: MenuItem[];
  collapsed?: boolean;
  onCollapse?: () => void;
  mobile?: boolean;
}

export const SideBar: React.FC<SidebarProps> = ({ 
  selectedMenu, 
  collapsed = false,
  onCollapse,
  mobile = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const setSelectedKeys = useSidebarStore((state) => state.setSelectedKeys);

  // update selected keys when location changes
  useEffect(() => {
    setSelectedKeys([location.pathname]);
  }, [location.pathname, setSelectedKeys]);

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (mobile && onCollapse) {
      onCollapse();
    }
  };

  // Calculate selected keys and open keys 
  const { selectedKeys, defaultOpenKeys } = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const openKeys = pathSegments.length > 0 ? [`/${pathSegments[0]}`] : [];

    return {
      selectedKeys: [location.pathname],
      defaultOpenKeys: openKeys,
    };
  }, [location.pathname]);


  return (
    <Sider
      width={260}
      collapsedWidth={80}
      collapsible={!mobile}
      collapsed={mobile ? false : collapsed}
      onCollapse={mobile ? undefined : onCollapse}
      className={`admin-sidebar ${mobile ? 'mobile-sidebar' : ''} ${collapsed ? 'collapsed' : ''}`}
      theme="dark"
      breakpoint="lg"
    >
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className={`sidebar-logo ${collapsed ? 'logo-collapsed' : ''}`}>
          {collapsed ? (
            <div className="logo-mini">
              <div className="logo-icon">TM</div>
            </div>
          ) : (
            <div className="logo-full">
              <div className="logo-icon">TM</div>
              <div className="logo-text">
                <h3 className="logo-title">TOEIC Master</h3>
                <span className="logo-subtitle">Admin System</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats (only when expanded) */}
      {!collapsed && (
        <div className="sidebar-stats">
          <div className="stat-item">
            <div className="stat-value">1,245</div>
            <div className="stat-label">Người dùng</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">356</div>
            <div className="stat-label">Khóa học</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">89%</div>
            <div className="stat-label">Hoạt động</div>
          </div>
        </div>
      )}

      <Divider className="sidebar-divider" />

      {/* Menu */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        items={selectedMenu}
        onClick={handleMenuClick}
        className="sidebar-menu"
        expandIcon={collapsed ? null : undefined}
      />


    </Sider>
  );
};