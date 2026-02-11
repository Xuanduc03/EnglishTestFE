import { KeyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import RolePage from "../Roles";
import PermissionPage from "../permission";
import Title from "antd/es/typography/Title";
import { Tabs } from "antd";

const RolePermissionMananger = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'roles';

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key });
    };

    // Cấu hình các Tabs
    const items = [
        {
            key: 'roles',
            label: (
                <span>
                    <SafetyCertificateOutlined />
                    Quản lý Vai trò
                </span>
            ),
            children: <RolePage />, // Nhúng nguyên trang Role vào đây
        },
        {
            key: 'permissions',
            label: (
                <span>
                    <KeyOutlined />
                    Quản lý Quyền hạn
                </span>
            ),
            children: <PermissionPage />, // Nhúng nguyên trang Permission vào đây
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            {/* Tiêu đề chung (Giống screenshot "QUẢN LÝ DANH MỤC...") */}
            <div style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0, textTransform: 'uppercase', color: '#1e3a8a' }}>
                    QUẢN LÝ PHÂN QUYỀN HỆ THỐNG
                </Title>
                <span style={{ color: '#888' }}>Cấu hình vai trò người dùng và danh sách quyền hạn truy cập</span>
            </div>

            {/* Component Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card" // Hoặc bỏ dòng này nếu muốn kiểu gạch chân (line)
                items={items}
                destroyInactiveTabPane={true} // Tùy chọn: Hủy DOM tab kia khi chuyển tab để nhẹ máy
            />
        </div>
    );
}

export default RolePermissionMananger;