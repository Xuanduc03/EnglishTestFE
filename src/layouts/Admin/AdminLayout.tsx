import React, { useState, useEffect } from "react";
import { Layout, theme, Drawer } from "antd";
import HeaderAdmin from "./Header/HeaderAdmin";
import { SideBar } from "./Sidebar/Sidebar";
import { menuItems } from "./Sidebar/MenuItem";
import "./AdminLayout.scss";

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Tự động thu gọn sidebar trên mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const toggleCollapsed = () => {
    if (isMobile) {
      setMobileDrawerVisible(!mobileDrawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleDrawerClose = () => {
    setMobileDrawerVisible(false);
  };

  return (
    <Layout className="admin-layout" style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}
          style={{ width: collapsed ? 80 : 260 }}
        >
          <SideBar 
            selectedMenu={menuItems} 
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
          />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={handleDrawerClose}
          open={mobileDrawerVisible}
          width={260}
          bodyStyle={{ padding: 0 }}
          headerStyle={{ padding: "16px 24px" }}
        >
          <SideBar 
            selectedMenu={menuItems} 
            collapsed={false}
            onCollapse={handleDrawerClose}
            mobile
          />
        </Drawer>
      )}

      {/* Main Content */}
      <Layout 
        className={`main-content ${collapsed && !isMobile ? 'sidebar-collapsed' : ''}`}
        style={{ 
          marginLeft: !isMobile ? (collapsed ? 80 : 260) : 0,
          transition: "all 0.2s ease"
        }}
      >
        <HeaderAdmin 
          collapsed={collapsed && !isMobile}
          onCollapse={toggleCollapsed}
        />
        
        <Content className="content-wrapper">
          <div 
            className="content-container"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 280,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer (optional) */}
        <div className="admin-footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} TOEIC Master Admin. All rights reserved.</p>
            <div className="footer-links">
              <a href="/admin/privacy">Privacy Policy</a>
              <span className="divider">|</span>
              <a href="/admin/terms">Terms of Service</a>
              <span className="divider">|</span>
              <a href="/admin/help">Help Center</a>
            </div>
          </div>
        </div>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;