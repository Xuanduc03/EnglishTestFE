// src/pages/Admin/Permission/index.tsx

import { Tag, Typography } from "antd";
import { KeyOutlined, AppstoreOutlined } from "@ant-design/icons";
import { PermissionService } from "./permission.service";
import type { PermissionDto } from "./permission.type";
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage";

const { Text } = Typography;

// Hàm helper sinh màu cho Module (cho đẹp)
const getModuleColor = (moduleName?: string) => {
  switch (moduleName?.toLowerCase()) {
    case 'users': return 'blue';
    case 'roles': return 'cyan';
    case 'products': return 'green';
    case 'orders': return 'gold';
    case 'system': return 'red';
    default: return 'geekblue';
  }
};

const PermissionPage = () => {
  return (
    <CrudPage<PermissionDto>
      config={{
        subtitle: "Danh sách các quyền trong hệ thống",
        createButtonText: "Thêm quyền mới",
        service: PermissionService,
        viewMode: "table",

        // 1. STATS
        stats: (data: any[]) => {
          // Gom nhóm để đếm số lượng module
          const uniqueModules = new Set(data.map((p: any) => p.module)).size;
          return [
            {
              title: "Tổng số quyền",
              value: data.length,
              icon: <KeyOutlined />,
              color: "blue"
            },
            {
              title: "Số lượng Module",
              value: uniqueModules,
              icon: <AppstoreOutlined />,
              color: "purple"
            }
          ]
        },

        // 2. FILTERS
        filters: [
          // Filter theo Module (Backend có hỗ trợ property này)
          {
            name: "module", // Khớp với prop 'Module' trong GetPermissionsQuery
            type: "input",  // Hoặc select nếu bạn hardcode list modules,
            width: "120px",
            placeholder: "Nhập tên Module (VD: Users)..." 
          }
        ],

        // 3. TABLE CONFIG
        tableConfig: {
          rowKey: "id",
          columns: [
            {
              title: "Tên quyền (Name)",
              dataIndex: "name",
              width: 200,
              sorter: true,
              render: (name: string) => <Text strong>{name}</Text>
            },
            {
              title: "Module",
              dataIndex: "module",
              width: 150,
              sorter: true, // Backend có OrderBy Module
              render: (module: string) => (
                <Tag color={getModuleColor(module)}>{module || 'Common'}</Tag>
              )
            },
            {
              title: "Mô tả",
              dataIndex: "description",
              width: 300,
              render: (desc: string) => <Text type="secondary">{desc || '---'}</Text>
            }
          ]
        },

        // 4. FORM CONFIG
        formFields: [
          {
            name: "module",
            label: "Module (Nhóm)",
            type: "input", // Hoặc autocomplete nếu muốn gợi ý module cũ
            rules: [{ required: true, message: "Vui lòng nhập Module" }]
          },
          {
            name: "name",
            label: "Mã quyền (Code)",
            type: "input",
            rules: [{ required: true, message: "Vui lòng nhập tên quyền" }]
          },
          {
            name: "description",
            label: "Mô tả chi tiết",
            type: "textarea"
          }
        ],

        // 5. DETAIL CONFIG
        auditFields: [
            { name: "id", label: "ID", type: "text" }
            // Permission thường ít field audit như createdAt, updatedAt trừ khi Entity có
        ]
      }}
    />
  );
};

export default PermissionPage;