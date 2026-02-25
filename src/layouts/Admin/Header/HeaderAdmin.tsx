import React, { useEffect, useRef, useState } from "react";
import { 
  Avatar, 
  Dropdown, 
  Layout, 
  Modal, 
  Popover, 
  Spin, 
  Tooltip, 
  Badge,
  Button,
  Divider,
  type MenuProps 
} from "antd";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthStore } from "../../../stores/store";
import { useNavigate } from "react-router-dom";
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined, 
  BellOutlined,
  SearchOutlined,
  DashboardOutlined,
  SunOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import Profile from "../../../components/student/Profile/Profile";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faBell, 
  faMoon,
  faSun,
  faPalette,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import "./HeaderAdmin.scss";

const { Header } = Layout;

interface HeaderAdminProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ collapsed, onCollapse }) => {
  const { theme: currentTheme, setTheme } = useTheme();
  const logout = useAuthStore((state: any) => state.logout);
  const userStore = useAuthStore((state) => state.user);
  const [loading] = useState(false);
  const [isModalProfileVisible, setIsModalProfileVisible] = useState(false);
  const [isModalLogoutVisible, setIsModalLogoutVisible] = useState(false);
  const [isThemePickerVisible, setIsThemePickerVisible] = useState(false);
  const [activeColor, setActiveColor] = useState(currentTheme || "default");
  const [user, setUser] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Báo cáo mới', message: 'Báo cáo tháng 12 đã sẵn sàng', time: '5 phút trước', read: false },
    { id: 2, title: 'Cập nhật hệ thống', message: 'Phiên bản mới v2.1 đã có', time: '1 giờ trước', read: false },
    { id: 3, title: 'Người dùng mới', message: 'Đã có 15 người đăng ký mới', time: '2 giờ trước', read: true },
  ]);
  const modalRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(userStore?.fullname ?? userStore?.username ?? "Admin");
  }, [userStore]);

  // Đóng Popover khi click ra ngoài
  useEffect(() => {
    const handleBodyClick = (e: any) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsThemePickerVisible(false);
      }
    };
    if (isThemePickerVisible) {
      document.addEventListener("click", handleBodyClick);
    }
    return () => document.removeEventListener("click", handleBodyClick);
  }, [isThemePickerVisible]);

  const handleLogoutConfirm = () => {
    localStorage.clear();
    logout();
    navigate("/login");
    setIsModalLogoutVisible(false);
  };

  const handleThemeChange = (theme: string) => {
    setActiveColor(theme);
    setTheme(theme);
    setIsThemePickerVisible(false);
  };

  const toggleThemePicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsThemePickerVisible(!isThemePickerVisible);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(noti => 
      noti.id === id ? { ...noti, read: true } : noti
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(noti => ({ ...noti, read: true })));
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <FontAwesomeIcon icon={faUser} />,
      label: "Hồ sơ cá nhân",
      onClick: () => setIsModalProfileVisible(true),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
      onClick: () => navigate("/admin/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: "Đăng xuất",
      onClick: () => setIsModalLogoutVisible(true),
    },
  ];

  const themeOptions = [
    { key: "default", color: "#1890ff", label: "Xanh mặc định", icon: "🔵" },
    { key: "green", color: "#52c41a", label: "Xanh lá", icon: "🟢" },
    { key: "orange", color: "#fa8c16", label: "Cam", icon: "🟠" },
    { key: "purple", color: "#722ed1", label: "Tím", icon: "🟣" },
    { key: "red", color: "#f5222d", label: "Đỏ", icon: "🔴" },
    { key: "dark", color: "#001529", label: "Tối", icon: "⚫" },
  ];

  const themeContent = (
    <div className="theme-picker" ref={modalRef}>
      <div className="theme-picker-header">
        <h4>Chọn giao diện</h4>
        <p>Chọn màu sắc yêu thích của bạn</p>
      </div>
      <Divider style={{ margin: "12px 0" }} />
      <div className="theme-colors">
        {themeOptions.map((theme) => (
          <Tooltip title={theme.label} key={theme.key}>
            <div
              className={`theme-color-item ${activeColor === theme.key ? "active" : ""}`}
              onClick={() => handleThemeChange(theme.key)}
              style={{ backgroundColor: theme.color }}
            >
              {activeColor === theme.key && <div className="checkmark">✓</div>}
            </div>
          </Tooltip>
        ))}
      </div>
      <Divider style={{ margin: "12px 0" }} />
      <div className="theme-modes">
        <Button 
          type={currentTheme === "light" ? "primary" : "default"}
          icon={<SunOutlined />}
          onClick={() => handleThemeChange("light")}
          style={{ marginRight: 8 }}
        >
          Sáng
        </Button>
        <Button 
          type={currentTheme === "dark" ? "primary" : "default"}
          icon={<MoonOutlined />}
          onClick={() => handleThemeChange("dark")}
        >
          Tối
        </Button>
      </div>
    </div>
  );

  const notificationContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Thông báo</h4>
        <Button type="link" size="small" onClick={markAllNotificationsAsRead}>
          Đánh dấu đã đọc
        </Button>
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <div 
              key={noti.id} 
              className={`notification-item ${!noti.read ? "unread" : ""}`}
              onClick={() => markNotificationAsRead(noti.id)}
            >
              <div className="notification-dot" />
              <div className="notification-content">
                <div className="notification-title">{noti.title}</div>
                <div className="notification-message">{noti.message}</div>
                <div className="notification-time">{noti.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <BellOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
            <p>Không có thông báo mới</p>
          </div>
        )}
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <Button type="link" block onClick={() => navigate("/admin/notifications")}>
        Xem tất cả thông báo
      </Button>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Header className="header-admin">
        <div className="header-left">
          {onCollapse && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onCollapse}
              className="collapse-btn"
            />
          )}
          <div className="header-brand" onClick={() => navigate("/admin/dashboard")}>
            <div className="brand-logo">
              <DashboardOutlined style={{ fontSize: 24 }} />
            </div>
            <div className="brand-text">
              <h2 className="brand-title">TOEIC Admin</h2>
              <span className="brand-subtitle">Quản trị hệ thống</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <SearchOutlined className="search-icon" />
            <input 
              type="text" 
              className="search-input"
              placeholder="Tìm kiếm người dùng, khóa học, bài test..."
            />
          </div>
        </div>

        <div className="header-right">
          {/* Quick Actions */}
          <Tooltip title="Tìm kiếm">
            <Button 
              type="text" 
              icon={<SearchOutlined />}
              className="header-action-btn mobile-search"
              onClick={() => console.log("Search clicked")}
            />
          </Tooltip>

          {/* Help Button */}
          <Tooltip title="Trợ giúp">
            <Button 
              type="text" 
              icon={<QuestionCircleOutlined />}
              className="header-action-btn"
              onClick={() => navigate("/admin/help")}
            />
          </Tooltip>

          {/* Notifications */}
          <Popover 
            content={notificationContent} 
            trigger="click" 
            placement="bottomRight"
            overlayClassName="notification-popover"
          >
            <Badge count={unreadCount} size="small" className="notification-badge">
              <Button 
                type="text" 
                icon={<BellOutlined />}
                className="header-action-btn"
              />
            </Badge>
          </Popover>

          {/* Theme Picker */}
          <Popover 
            content={themeContent} 
            trigger="click"
            open={isThemePickerVisible}
            onOpenChange={setIsThemePickerVisible}
            placement="bottomRight"
          >
            <Tooltip title="Thay đổi giao diện">
              <Button 
                type="text" 
                icon={<FontAwesomeIcon icon={faPalette} />}
                className="header-action-btn theme-btn"
                onClick={toggleThemePicker}
              />
            </Tooltip>
          </Popover>

          {/* User Profile */}
          <Dropdown 
            menu={{ items: userMenuItems }} 
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="header-user">
              <div className="user-avatar-container">
                <Avatar 
                  size="large"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                {/* {userStore?.status === "online" && (
                  <span className="online-status" />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user}</div>
                <div className="user-role">
                  {userStore?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </div> */}
              </div>
            </div>
          </Dropdown>
        </div>

        <Spin spinning={loading} fullscreen />
      </Header>

      {/* Logout Modal */}
      <Modal
        className="modal-logout"
        title={<><LogoutOutlined style={{ marginRight: 8 }} /> Xác nhận đăng xuất</>}
        open={isModalLogoutVisible}
        onOk={handleLogoutConfirm}
        onCancel={() => setIsModalLogoutVisible(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="logout-confirm-content">
          <div className="logout-icon">
            <LogoutOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
          </div>
          <h3>Bạn có chắc chắn muốn đăng xuất?</h3>
          <p>Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống quản trị.</p>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Profile
        openModalFromOutside={isModalProfileVisible}
        setIsModalProfileVisible={setIsModalProfileVisible}
        handleCancel={() => setIsModalProfileVisible(false)}
        setUser={setUser}
      />
    </>
  );
};

export default HeaderAdmin;