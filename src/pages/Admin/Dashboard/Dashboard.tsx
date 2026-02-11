import React from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, List, Button } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ScheduleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./Dashboard.scss";

const Dashboard: React.FC = () => {
  const kpiItems = [
    {
      title: "Người dùng mới",
      value: 1245,
      change: 12.3,
      trend: "up",
      icon: <UserOutlined />,
      color: "#2563eb",
    },
    {
      title: "Bài test đã làm",
      value: 3289,
      change: 3.7,
      trend: "up",
      icon: <ScheduleOutlined />,
      color: "#16a34a",
    },
    {
      title: "Tỉ lệ hoàn thành",
      value: 68,
      suffix: "%",
      change: -1.9,
      trend: "down",
      icon: <CheckCircleOutlined />,
      color: "#059669",
    },
    {
      title: "Báo cáo/Góp ý",
      value: 37,
      change: 5.2,
      trend: "up",
      icon: <ExclamationCircleOutlined />,
      color: "#f59e0b",
    },
  ];

  const recentActivities = [
    { id: 1, user: "Nguyễn Văn A", action: "Hoàn thành Full Test #12", time: "5 phút trước", status: "success" },
    { id: 2, user: "Trần Thị B", action: "Bắt đầu bài Reading", time: "12 phút trước", status: "info" },
    { id: 3, user: "Lê Văn C", action: "Báo lỗi câu 45 - Part 5", time: "30 phút trước", status: "warning" },
    { id: 4, user: "Phạm D", action: "Đăng ký tài khoản mới", time: "1 giờ trước", status: "success" },
  ];

  const trafficSources = [
    { key: "search", label: "Tìm kiếm", value: 52, color: "#3b82f6" },
    { key: "social", label: "Mạng xã hội", value: 28, color: "#8b5cf6" },
    { key: "direct", label: "Truy cập trực tiếp", value: 15, color: "#10b981" },
    { key: "referral", label: "Giới thiệu", value: 5, color: "#f59e0b" },
  ];

  const usersColumns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Bài đã làm", dataIndex: "tests", key: "tests" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "active" ? "green" : s === "pending" ? "gold" : "default"}>
          {s === "active" ? "Hoạt động" : s === "pending" ? "Chờ xác thực" : "Khác"}
        </Tag>
      ),
    },
  ];

  const usersData = [
    { key: 1, name: "Nguyễn Văn A", email: "a@example.com", tests: 14, status: "active" },
    { key: 2, name: "Trần Thị B", email: "b@example.com", tests: 7, status: "pending" },
    { key: 3, name: "Lê Văn C", email: "c@example.com", tests: 21, status: "active" },
    { key: 4, name: "Phạm D", email: "d@example.com", tests: 5, status: "active" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hệ thống, người dùng và hoạt động gần đây</p>
        </div>
        <div className="header-actions">
          <Button type="primary">Tạo thông báo</Button>
          <Button>Xuất báo cáo</Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {kpiItems.map((k) => (
          <Col xs={24} sm={12} md={12} lg={6} key={k.title}>
            <Card className="kpi-card">
              <div className="kpi-icon" style={{ background: k.color + '20', color: k.color }}>
                {k.icon}
              </div>
              <div className="kpi-content">
                <div className="kpi-title">{k.title}</div>
                <div className="kpi-value">
                  <Statistic
                    value={k.value}
                    suffix={k.suffix}
                    valueStyle={{ fontSize: 28 }}
                  />
                </div>
                <div className={`kpi-trend ${k.trend}`}>
                  {k.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span>{k.change}% so với tuần trước</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<span className={`activity ${item.status}`}>{item.action}</span>}
                    description={<span>{item.user} · {item.time}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Nguồn truy cập">
            <div className="traffic">
              {trafficSources.map((s) => (
                <div className="traffic-row" key={s.key}>
                  <div className="traffic-label">
                    <span className="dot" style={{ background: s.color }} />
                    {s.label}
                  </div>
                  <div className="traffic-progress">
                    <Progress percent={s.value} size="small" showInfo />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Người dùng mới / nổi bật">
            <Table
              columns={usersColumns as any}
              dataSource={usersData}
              pagination={{ pageSize: 5 }}
              rowKey="key"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;


