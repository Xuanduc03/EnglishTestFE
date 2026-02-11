// src/pages/Admin/Role/index.tsx

import { Tag, Typography, Space, Tooltip } from "antd";
import { SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";
import { RoleService } from "./role.service";
import type { RoleDto, Permission } from "./role.type";
import dayjs from "dayjs";
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage";

const { Text } = Typography;

const RolePage = () => {


  return (
    <CrudPage<RoleDto>
      config={{
        subtitle: "Cấu hình vai trò và phân quyền hệ thống",
        createButtonText: "Tạo vai trò",
        service: RoleService,
        viewMode: "table",

        // 1. STATS
        stats: (data: any[]) => [
          {
            title: "Tổng vai trò",
            value: data.length,
            icon: <SafetyCertificateOutlined />,
            color: "blue"
          }
        ],

        // 2. FILTERS
        filters: [
          {
            name: "keyword",
            width: "200px",
            type: "input",
            placeholder: "Tìm kiếm tên vai trò..."
          }
        ],

        // 3. TABLE CONFIG
        tableConfig: {
          rowKey: "id",
          columns: [
            {
              title: "Tên vai trò",
              dataIndex: "name",
              width: 200,
              sorter: true,
              render: (name: string, record: any) => (
                <div>
                  <Text strong style={{ fontSize: 15, color: '#1677ff' }}>{name}</Text>
                  {/* Mô tả hiển thị nhỏ bên dưới tên */}
                  {record.description && (
                     <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
                  )}
                </div>
              )
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              width: 150,
              render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "---"
            }
          ]
        },

        // 4. FORM CONFIG
        formFields: [
          {
            name: "name",
            label: "Tên vai trò",
            type: "input",
            rules: [{ required: true, message: "Vui lòng nhập tên vai trò" }]
          },
          {
            name: "description",
            label: "Mô tả",
            type: "textarea",
          },
          {
            name: "permissionIds", 
            label: "Phân quyền",
            type: "select",
            api: RoleService.getAllPermissions, 
            options: [],
          
          }
        ],

        // 5. DETAIL CONFIG (Audit Fields)
        auditFields: [
            { name: "id", label: "Role ID", type: "text" },
            { name: "createdAt", label: "Ngày tạo", type: "date" },
            { name: "updatedAt", label: "Cập nhật", type: "date" },
            
            // Hiển thị danh sách quyền trong màn hình chi tiết
            {
                name: "permissions",
                label: "Danh sách quyền",
                type: "tag", // Dùng type tag
                render: (permissions: Permission[]) => {
                    if (!permissions || permissions.length === 0) return <Text type="secondary">Chưa cấp quyền</Text>;
                    
                    // Group quyền theo Module cho dễ nhìn
                    const grouped = permissions.reduce((acc: any, curr) => {
                        const mod = curr.module || 'Other';
                        if (!acc[mod]) acc[mod] = [];
                        acc[mod].push(curr);
                        return acc;
                    }, {});

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {Object.keys(grouped).map(module => (
                                <div key={module}>
                                    <Tag color="cyan" style={{ marginBottom: 4 }}>{module}</Tag>
                                    <div>
                                        {grouped[module].map((p: any) => (
                                            <Tag key={p.id}>{p.name}</Tag>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }
            }
        ]
      }}
    />
  );
};

export default RolePage;