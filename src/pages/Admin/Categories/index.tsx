import { useEffect, useMemo, useState } from "react"
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage"
import type { CategoryDto } from "./category.config"
import { categorieservice } from "./category.service"
import { AppstoreOutlined, CheckCircleOutlined, CloseCircleOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons"
import { Badge, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useCategoryRoot } from "./category.hook"

const { Text } = Typography;

// 1. Thêm Interface Props
interface CategoryManagerProps {
  presetCodeType?: string; // Ví dụ: 'EXAM_TYPE', 'TOPIC'...
  pageTitle?: string;      // Ví dụ: 'Quản lý Loại kỳ thi'
}

const CategoryManager = ({ presetCodeType, pageTitle }: CategoryManagerProps) => {
  const isPreset = !!presetCodeType;
  const { rootId, loading } = useCategoryRoot(presetCodeType);


  const serviceConfig = useMemo(() => ({
    ...categorieservice,

    getAll: (params: any) => categorieservice.getAll({
      ...params,
      ...(isPreset && rootId ? { parentId: rootId, codeType: presetCodeType } : {})
    }),
    // ghi đè create
    create: async (formData: any) => {
      // Nếu đang ở màn con (Preset) và đã có ID cha
      if (isPreset && rootId) {
        const payload = {
          ...formData,              // Dữ liệu từ Form (Code, Name, IsActive...)
          codeType: presetCodeType, // Bơm thêm: 'EXAM_TYPE'
          parentId: rootId        // Bơm thêm: ID của cha
        };

        return await categorieservice.create(payload);
      }
      return await categorieservice.create(formData);
    },

    update: async (id: string | number, formData: any) => {
      if (isPreset && rootId) {
        return await categorieservice.update(id, {
          ...formData,
          codeType: presetCodeType,
          parentId: rootId
        });
      }
      return await categorieservice.update(id, formData);
    }

  }), [rootId, isPreset, presetCodeType]);

  if (loading) {
    return <div className="flex justify-center h-96"><Spin /></div>;
  }
  if (isPreset && !rootId) {
    return (
        <div className="p-8 text-center">
            <Typography.Text type="danger">
                Chưa tìm thấy danh mục gốc cho loại: <strong>{presetCodeType}</strong>.
            </Typography.Text>
            <br />
            <Typography.Text type="secondary">
                Vui lòng kiểm tra lại Database hoặc tạo danh mục cha có CodeType="{presetCodeType}" và ParentId=null.
            </Typography.Text>
        </div>
    );
}

  return (
    <CrudPage<CategoryDto>
      key={rootId || "root"}
      config={{
        title: pageTitle || "Quản lý danh mục hệ thống",
        subtitle: isPreset
          ? `Đang quản lý: ${presetCodeType}`
          : "Quản lý tất cả danh mục",
        createButtonText: "Tạo danh mục",
        service: serviceConfig,
        viewMode: "table",

        // 1. thống kê 
        stats: isPreset ? undefined : (data: any) => [
          {
            title: "Tổng danh mục",
            value: data.length,
            icon: <AppstoreOutlined />,
            color: "#6366f1",
            description: "Tất cả danh mục"
          },
          {
            title: "Đang hoạt động",
            value: data.filter((c: any) => c.isActive === true).length,
            icon: <CheckCircleOutlined />,
            color: "#10b981",
            description: "Danh mục active"
          },
          {
            title: "Ngừng hoạt động",
            value: data.filter((c: any) => c.isActive === false).length,
            icon: <CloseCircleOutlined />,
            color: "#ef4444",
            description: "Danh mục inactive"
          },
          {
            title: "Danh mục cha",
            value: data.filter((c: any) => !c.parentId).length,
            icon: <FolderOutlined />,
            color: "#f59e0b",
            description: "Root categories"
          },
          {
            title: "Danh mục con",
            value: data.filter((c: any) => c.parentId).length,
            icon: <FileOutlined />,
            color: "#8b5cf6",
            description: "Child categories"
          }
        ],

        // 2. filter 
        filters: [
          {
            name: "keyword",
            width: "200px",
            type: "input",
            placeholder: "Tìm theo tên, mã..."
          },
          {
            name: "status",
            type: "select",
            width: "200px",
            placeholder: "Trạng thái",
            options: [
              { label: "Hoạt động", value: true },
              { label: "Ngừng hoạt động", value: false }
            ]
          },
          {
            name: 'createAt',
            type: 'rangeDate',
            placeholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
            width: '260px'
          }
        ],


        // 3. TABLE CONFIG
        tableConfig: {
          rowKey: "id",
          columns: [
            {
              title: "Mã (Code)",
              dataIndex: "code",
              width: 150,
              render: (code: string) => code ? <Tag>{code}</Tag> : <Text type="secondary">---</Text>
            },
            {
              title: "Tên danh mục",
              dataIndex: "name",
              width: 250,
              sorter: true,
              render: (name: string, record: any) => (
                <div>
                  <Text strong>{name}</Text>

                </div>
              )
            },
            ...(isPreset ? [] : [{
              title: "Loại",
              dataIndex: "codeType",
              width: 150,
              render: (t: string) => <Tag color="geekblue">{t}</Tag>
            }]),

            ...(isPreset ? [] : [{
              title: "Số danh mục con",
              dataIndex: "childrenCount",
              width: 120,
              render: (count: number) => (
                <Badge count={count} showZero />
              )
            }]),
            {
              title: "Mô tả",
              dataIndex: "description",
              width: 300,
              render: (desc: string) => (
                desc ? <Text>{desc}</Text> : <Text type="secondary">---</Text>
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
              width: 120,
              render: (status: boolean) => (
                <Badge status={status ? "success" : "error"} text={status ? "Hoạt động" : "Không hoạt động"} />
              )
            }
          ]
        },

        // 4. FORM CONFIG (Create/Update)
        formFields: [
          {
            name: "codeType",
            label: "Loại danh mục",
            type: "input",
            hidden: isPreset,
            initialValue: presetCodeType,
            rules: [{ required: true, message: "Chọn loại danh mục" }],
          },


          // C. Các field nhập liệu bình thường
          {
            name: "code",
            label: "Mã",
            type: "input",
            rules: [{ required: true, message: "Nhập mã" }]
          },
          {
            name: "name",
            label: "Tên hiển thị",
            type: "input",
            rules: [{ required: true, message: "Nhập tên" }]
          },
          {
            name: "description",
            label: "Mô tả",
            type: "textarea"
          },

          {
            name: "parentId",
            label: "Danh mục cha",
            type: isPreset ? "hidden" : "select",
            hidden: isPreset,
            initialValue: rootId,
            api: isPreset ? undefined : categorieservice.getSelectCategory,
          },
          {
            name: "isActive",
            label: "Kích hoạt",
            type: "switch",
            initialValue: true
          }
        ],

        // 5. DETAIL CONFIG (Audit Fields)
        auditFields: [
          { name: "id", label: "ID", type: "text" },
          { name: "parentId", label: "Parent ID", type: "text" },
          { name: "childrenCount", label: "Số lượng con", type: "text", render: (v) => <Tag color="geekblue">{v} items</Tag> },
          { name: "createdAt", label: "Ngày tạo", type: "date" },
          { name: "updatedAt", label: "Cập nhật", type: "date" },
        ]
      }}
    />
  )
};

export default CategoryManager;