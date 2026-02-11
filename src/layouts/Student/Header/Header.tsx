import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Dropdown,
  Badge,
  Avatar,
  Input,
  Space,
  Tooltip,
  Divider,
  Typography,
  notification,
  Progress,
  Tag,
  type MenuProps
} from "antd";
import {
  useNavigate,
  useLocation,
  Link
} from "react-router-dom";
import {
  HomeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  BookOutlined,
  FireOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
  PlusOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import './Header.scss';
import { api } from '../../../configs/axios-custom';
import { useAuthStore } from '../../../stores/store';

const { Header } = Layout;
const { Title, Text } = Typography;

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
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const logout = useAuthStore((state: any) => state.logout);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Bài test mới', message: 'TOEIC Full Test tháng 12 đã có', time: '5 phút trước', read: false, type: 'test' },
    { id: 2, title: 'Thành tích mới', message: 'Bạn đã đạt huy hiệu Học liên tục 7 ngày', time: '1 giờ trước', read: false, type: 'achievement' },
    { id: 3, title: 'Nhắc nhở', message: 'Còn 2 ngày đến hạn làm bài kiểm tra định kỳ', time: '2 giờ trước', read: true, type: 'reminder' },
  ]);

  // Kiểm tra scroll để thay đổi style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserProfile = async (userId: string) => {
    try {
      const response = await api.get(`/api/students/${userId}`);

      if (response.data?.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserStr = localStorage.getItem("user");
    if (token && storedUserStr) {
      setIsLoggedIn(true);

      try {
        const storedUser = JSON.parse(storedUserStr);

        setUser(storedUser);

        if (storedUser.userId) {
          getUserProfile(storedUser.userId);
        }
      } catch (e) {
        console.error("Lỗi parse user data", e);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const menuItems = [
    {
      key: "/",
      label: "Trang chủ",
      icon: <HomeOutlined />,
      children: [
        { key: "/", label: "Dashboard" },
        { key: "/learning-path", label: "Lộ trình học" },
        { key: "/achievements", label: "Thành tích" },
      ]
    },
    {
      key: "tests",
      label: "Thi thử",
      icon: <FileTextOutlined />,
      children: [
        { key: "/full-test", label: "Full Test TOEIC" },
        { key: "/mini-test", label: "Mini Test 30 phút" },
        { key: "/part-test", label: "Thi theo Part" },
        { key: "/ielts-test", label: "IELTS Mock Test" },
      ]
    },
    {
      key: "/practice",
      label: "Luyện tập",
      icon: <PlayCircleOutlined />,
      children: [
        { key: "/practice/listening", label: "Listening Practice" },
        { key: "/practice/reading", label: "Reading Practice" },
        { key: "/practice/grammar", label: "Grammar Practice" },
        { key: "/practice/vocabulary", label: "Vocabulary Practice" },
      ]
    },
    {
      key: "courses",
      label: "Khóa học",
      icon: <BookOutlined />,
      children: [
        { key: "/courses/toeic", label: "TOEIC Courses" },
        { key: "/courses/ielts", label: "IELTS Courses" },
        { key: "/courses/speaking", label: "Speaking Master" },
        { key: "/courses/writing", label: "Writing Pro" },
      ]
    },
    {
      key: "/vocabulary",
      label: "Từ vựng",
      icon: <FireOutlined />,
      children: [
        { key: "/vocabulary/flashcard", label: "Flashcards" },
        { key: "/vocabulary/practice", label: "Practice Games" },
        { key: "/vocabulary/topics", label: "Theo Chủ Đề" },
        { key: "/vocabulary/ielts", label: "IELTS Vocabulary" },
      ]
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />
    },
    {
      key: 'my-learning',
      label: 'Thống kê học tập',
      icon: <TrophyOutlined />
    },
    {
      key: 'schedule',
      label: 'Lịch học',
      icon: <CalendarOutlined />
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />
    },
    {
      key: 'help',
      label: 'Trợ giúp',
      icon: <QuestionCircleOutlined />
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true
    },
  ];

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(noti =>
        noti.id === id ? { ...noti, read: true } : noti
      )
    );
  };

  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Title level={5}>Thông báo</Title>
        <Button type="link" size="small">Đánh dấu đã đọc tất cả</Button>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className="notification-list">
        {notifications.map(noti => (
          <div
            key={noti.id}
            className={`notification-item ${!noti.read ? 'unread' : ''}`}
            onClick={() => markAsRead(noti.id)}
          >
            <div className="notification-icon">
              {noti.type === 'test' && <FileTextOutlined style={{ color: '#3b82f6' }} />}
              {noti.type === 'achievement' && <TrophyOutlined style={{ color: '#f59e0b' }} />}
              {noti.type === 'reminder' && <ClockCircleOutlined style={{ color: '#10b981' }} />}
            </div>
            <div className="notification-content">
              <h4>{noti.title}</h4>
              <p>{noti.message}</p>
              <span className="notification-time">{noti.time}</span>
            </div>
          </div>
        ))}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <Button type="link" block onClick={() => navigate('/notifications')}>
        Xem tất cả thông báo
      </Button>
    </div>
  );


  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.clear();
      logout();
      setIsLoggedIn(false);
      setUser(null);
        notification.success({
        message: 'Đăng xuất thành công',
        description: 'Bạn đã đăng xuất khỏi hệ thống'
      });
      navigate("/login");
    } else {
      navigate(`/${key}`);
    }
  };

  const mobileMenu = (
    <Menu
      mode="vertical"
      selectedKeys={[location.pathname]}
      onClick={({ key }) => {
        navigate(key);
        setMobileMenuVisible(false);
      }}
      items={[
        ...menuItems.map(item => ({
          key: item.key,
          label: item.label,
          icon: item.icon,
        })),
        { type: 'divider' },
        { key: '/about', label: 'Về chúng tôi', icon: <QuestionCircleOutlined /> },
        { key: '/pricing', label: 'Bảng giá', icon: <TrophyOutlined /> },
        { key: '/contact', label: 'Liên hệ', icon: <MessageOutlined /> },
      ]}
    />
  );

  return (
    <>
      <Header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
        {/* Desktop Header */}
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section" onClick={() => navigate('/home')}>
            <div className="logo">
              <span className="logo-icon">📚</span>
              <div className="logo-text">
                <Title level={4} className="logo-title">TOEIC Master</Title>
                <Text type="secondary" className="logo-subtitle">IELTS & TOEIC Practice</Text>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="nav-section">
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              onClick={({ key }) => navigate(key)}
              items={menuItems.map(item => ({
                key: item.key,
                label: item.label,
                icon: item.icon,
                children: item.children,
              }))}
              className="main-menu"
            />
          </div>

          {/* Right Actions */}
          <div className="actions-section">
            {/* Search Button (Mobile) */}
            <Tooltip title="Tìm kiếm">
              <Button
                type="text"
                icon={<SearchOutlined />}
                className="mobile-search-btn"
                onClick={() => setSearchVisible(true)}
              />
            </Tooltip>

            {/* Search Bar (Desktop) */}
            <div className="search-bar">
              <Input
                placeholder="Tìm kiếm khóa học, bài test..."
                prefix={<SearchOutlined />}
                className="search-input"
                allowClear
              />
            </div>

            {isLoggedIn ? (
              <>
                {/* Create Button */}
                <Tooltip title="Tạo mới">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="create-btn"
                    onClick={() => navigate('/create-test')}
                  >
                    Tạo Test
                  </Button>
                </Tooltip>

                {/* Notifications */}
                <Dropdown
                  placement="bottomRight"
                  trigger={['click']}
                  overlayClassName="notification-dropdown-container"
                  dropdownRender={() => notificationMenu}
                >
                  <span>
                    <Badge count={unreadCount} size="small">
                      <Button
                        type="text"
                        icon={<BellOutlined />}
                        className="notification-btn"
                      />
                    </Badge>
                  </span>
                </Dropdown>

                {/* User Profile */}
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: handleUserMenuClick,
                  }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <span>
                    <div className="user-profile">
                      <Avatar
                        src={user?.avatar}
                        icon={<UserOutlined />}
                        size="large"
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <Text strong className="user-name">{user?.name}</Text>
                        <div className="user-stats">
                          <span className="stat-item">
                            <FireOutlined /> {user?.streak} ngày
                          </span>
                          <span className="stat-item">
                            <TrophyOutlined /> {user?.points} điểm
                          </span>
                        </div>
                      </div>
                      <DownOutlined className="dropdown-arrow" />
                    </div>
                  </span>
                </Dropdown>
              </>
            ) : (
              <Space className="auth-buttons">
                <Button
                  type="text"
                  className="login-btn"
                  onClick={handleLogin}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  className="register-btn"
                  onClick={handleRegister}
                >
                  Đăng ký miễn phí
                </Button>
              </Space>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-btn"
              onClick={() => setMobileMenuVisible(true)}
            />
          </div>
        </div>

        {/* Mobile Search Drawer */}
        <Drawer
          title="Tìm kiếm"
          placement="top"
          onClose={() => setSearchVisible(false)}
          open={searchVisible}
          height={200}
        >
          <Input
            placeholder="Tìm kiếm khóa học, bài test, từ vựng..."
            prefix={<SearchOutlined />}
            size="large"
            autoFocus
          />
          <div className="search-suggestions">
            <Text type="secondary">Gợi ý tìm kiếm:</Text>
            <Space wrap className="suggestions-tags">
              <Tag onClick={() => navigate('/full-test')}>TOEIC Full Test</Tag>
              <Tag onClick={() => navigate('/vocabulary')}>Từ vựng TOEIC</Tag>
              <Tag onClick={() => navigate('/practice/listening')}>Luyện nghe</Tag>
              <Tag onClick={() => navigate('/courses')}>Khóa học IELTS</Tag>
            </Space>
          </div>
        </Drawer>

        {/* Mobile Menu Drawer */}
        <Drawer
          title={
            <div className="drawer-header">
              {isLoggedIn ? (
                <div className="drawer-user">
                  <Avatar src={user?.avatar} size={48} />
                  <div className="drawer-user-info">
                    <Title level={5}>{user?.name}</Title>
                    <Text type="secondary">Premium Member</Text>
                  </div>
                </div>
              ) : (
                <div className="drawer-auth">
                  <Title level={4}>TOEIC Master</Title>
                  <Space>
                    <Button onClick={handleLogin}>Đăng nhập</Button>
                    <Button type="primary" onClick={handleRegister}>Đăng ký</Button>
                  </Space>
                </div>
              )}
            </div>
          }
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={300}
        >
          {mobileMenu}
        </Drawer>
      </Header>


    </>
  );
};

export default AppHeader;