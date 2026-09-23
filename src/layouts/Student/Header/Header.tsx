import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Drawer,
  Dropdown,
  Badge,
  Avatar,
  Input,
  Space,
  Typography,
  notification,
  Tag,
  Menu,
  Divider
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';

import './Header.scss'; // Link tới file SCSS mới
import { api } from '../../../configs/axios-custom';
import { useAuthStore } from '../../../stores/store';

const { Header } = Layout;
const { Title, Text } = Typography;

// ... (Các Interfaces NotificationItem giữ nguyên) ...
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'test' | 'course' | 'reminder' | 'achievement';
}

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const logout = useAuthStore((state: any) => state.logout);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false); // Thêm state cho Focus

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'New Test Available', message: 'December TOEIC Full Test is now available', time: '5 mins ago', read: false, type: 'test' },
  ]);

  // Hiệu ứng kính mờ khi cuộn chuột
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check đăng nhập (Giữ nguyên logic của ông)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserStr = localStorage.getItem("user");
    if (token && storedUserStr) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(storedUserStr));
      } catch (e) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Menu Dropdown của User (Đã rút gọn)
  const userMenuItems = [
    { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
    { key: 'settings', label: 'Account Settings', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.clear();
      logout();
      setIsLoggedIn(false);
      setUser(null);
      notification.success({ message: 'Logged out successfully' });
      navigate("/login");
    } else {
      navigate(`/${key}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Header className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          
          {/* 1. LOGO */}
          <div className="header-logo" onClick={() => navigate('/home')}>
            <div className="logo-mark">T</div>
            <div className="logo-text">
              <strong>TOEIC Master</strong>
              <span>EDTECH PLATFORM</span>
            </div>
          </div>

          {/* 2. NAVIGATION (Dạng Tab bo tròn xịn xò) */}
          <nav className="header-nav desktop-only">
            {/* Tối ưu: Dùng NavLink hoặc logic active đơn giản thay vì Menu Antd xổ ra 1 đống */}
            {[
              { path: '/home', label: 'Home' },
              { path: '/full-test', label: 'Mock Test' },
              { path: '/practice/list', label: 'Practice' },
              { path: '/vocabulary', label: 'Vocabulary' }
            ].map((nav) => (
              <div 
                key={nav.path}
                className={`nav-item ${location.pathname.includes(nav.path) ? 'active' : ''}`}
                onClick={() => navigate(nav.path)}
              >
                {nav.label}
              </div>
            ))}
          </nav>

          {/* 3. UTILITIES (Phải) */}
          <div className="header-utils">
            
            {/* A. Search Bar (Có hiệu ứng nở ra khi click) */}
            <div className={`search-box desktop-only ${searchFocused ? 'focused' : ''}`}>
              <SearchOutlined className="search-icon" />
              <Input 
                placeholder="Search tests, lessons..." 
                bordered={false}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Icon Search cho Mobile */}
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              className="mobile-only btn-icon"
              onClick={() => setSearchVisible(true)} 
            />

            {isLoggedIn ? (
              <>
                {/* Removed Premium button */}

                {/* C. Chuông thông báo */}
                <Dropdown trigger={['click']} menu={{ items: [{key: '1', label: 'No notifications'}] }}>
                  <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                    <button className="btn-icon noti-btn">
                      <BellOutlined />
                    </button>
                  </Badge>
                </Dropdown>

                {/* D. Avatar User (Gọn gàng) */}
                <Dropdown 
                  menu={{ items: userMenuItems as any, onClick: handleUserMenuClick }} 
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <div className="user-profile">
                    <Avatar src={user?.avatar} icon={<UserOutlined />} className="avatar-img" />
                    <DownOutlined className="arrow-down" />
                  </div>
                </Dropdown>
              </>
            ) : (
              <Space className="auth-buttons">
                <Button type="text" onClick={() => navigate('/login')} className="login-text">
                  Login
                </Button>
                <Button type="primary" onClick={() => navigate('/register')} className="register-btn">
                  Register
                </Button>
              </Space>
            )}

            {/* Removed Hamburger menu */}
          </div>
        </div>

        {/* Removed Mobile Menu Drawer */}
        
      </Header>
    </>
  );
};

export default AppHeader;