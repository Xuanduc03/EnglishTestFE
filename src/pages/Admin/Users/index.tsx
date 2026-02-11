import { Tag, Avatar, Badge, Space, Typography } from "antd";
import { UserOutlined, ManOutlined, WomanOutlined, PhoneOutlined } from "@ant-design/icons";
import { UserService } from "./user.service";
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage";
import type { UserListDto } from "./user.type";
import { RoleService } from "../Roles/role.service";
import dayjs from "dayjs";


const { Text } = Typography;

const UserPage = () => {

  const countByRole = (data: UserListDto[], roleName: string) => {
    data.filter(u => u.roles.some(r => r.name === roleName)).length;
  };
  return (
    <CrudPage<UserListDto>
      config={{
        title: "Quản lý Người dùng",
        subtitle: "Danh sách tài khoản hệ thống",
        createButtonText: "Tạo tài khoản",
        service: UserService,
        viewMode: "table",

        // 1. THỐNG KÊ (Optional)
        stats: (data: any) => [
          {
            title: "Tổng người dùng",
            value: data.length,
            icon: <UserOutlined />,
            color: "#6366f1"
          },
          {
            title: "Giáo viên",
            value: countByRole(data, 'Teacher'),
            icon: <ManOutlined />,
            color: "#3b82f6"
          },
          {
            title: "Học viên",
            value: countByRole(data, 'Student'),
            icon: <WomanOutlined />,
            color: "#10b981"
          }
        ],

        // 2. BỘ LỌC TÌM KIẾM
        filters: [
          {
            width: "400px",
            name: "keyword",
            type: "input",
            placeholder: "Tìm theo tên, email, sđt..."
          },
          {
            width: "100px",
            name: "roleIds",
            type: "select",
            placeholder: "Lọc theo vai trò",
            api: RoleService.getSelectRole
          },
          {
            name: 'createdAt',
            type: 'rangeDate',
            placeholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
            width: '260px'
          }
        ],

        // 3. CẤU HÌNH BẢNG (TABLE)
        tableConfig: {
          rowKey: "id", // Quan trọng để nút Delete hoạt động
          columns: [
            {
              title: "Thông tin cá nhân",
              dataIndex: "username",
              sorter: true,
              width: 280,
              render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Avatar
                    size={40}
                    src={record.avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: record.isActive ? '#e6f7ff' : '#fff1f0', color: record.isActive ? '#1890ff' : '#f5222d' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong>{record.fullname || record.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                  </div>
                </div>
              )
            },
            {
              title: "Liên hệ",
              dataIndex: "phone",
              width: 150,
              render: (phone: string) => (
                phone ? <Space><PhoneOutlined /> {phone}</Space> : <Text type="secondary">---</Text>
              )
            },
            {
              title: "Vai trò",
              dataIndex: "roles",
              sorter: true,
              width: 150,
              render: (roles: any[]) => (
                <Space wrap>
                  {roles?.map((role) => (
                    <Tag key={role.id || role.name} color={role.name === 'Admin' ? 'red' : role.name === 'Teacher' ? 'blue' : 'green'}>
                      {role.name}
                    </Tag>
                  ))}
                </Space>
              )
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              width: 180,
              render: (date: string) => (
                <Text>{date ? dayjs(date).format("DD/MM/YYYY") : "---"}</Text>
              )
            },
            {
              title: "Trạng thái",
              dataIndex: "isActive",
              sorter: true,
              width: 120,
              render: (isActive: boolean) => (
                <Badge
                  status={isActive ? "success" : "error"}
                  text={isActive ? "Hoạt động" : "Đã khóa"}
                />
              )
            }
          ]
        },

        // 4. CẤU HÌNH FORM (THÊM / SỬA)
        formFields: [
          // Cột 1: Thông tin cơ bản
          { name: "fullname", label: "Họ và tên", type: "input", rules: [{ required: true, message: "Nhập họ tên" }] },
          { name: "email", label: "Email", type: "input", rules: [{ required: true, type: 'email' }] },
          { name: "password", label: "Mật khẩu", type: "input" },
          { name: "phone", label: "Số điện thoại", type: "input" },
          {
            name: "roleIds",
            label: "Vai trò",
            type: "select",
            api: RoleService.getSelectRole,
            rules: [{ required: true }]
          },
          { name: "isActive", label: "Trạng thái hoạt động", type: "switch" }
        ],

        auditFields: [
          { name: 'createdAt', label: 'Ngày tạo', type: 'date' },
          { name: 'updatedAt', label: 'Cập nhật lần cuối', type: 'date' },
          { name: 'lastLogin', label: 'Đăng nhập lần cuối', type: 'date' },

          // Field phức tạp: Permissions
          {
            name: 'permissions',
            label: 'Quyền hạn bổ sung',
            type: 'tag'
          },

          // Field có logic điều kiện: Failed Login
          {
            name: 'failedLoginAttempts',
            label: 'Cảnh báo đăng nhập',
            // Chỉ hiện nếu số lần > 0
            // Render màu mè
            render: (val) => <Tag color="red">{val} lần sai</Tag>
          }
        ]
      }}
    />
  );
};

export default UserPage;