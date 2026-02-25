import React from "react";
import { Tag, Typography, Space, Button, Form, InputNumber, Row, Col, Card, Badge } from "antd";
import { 
  FileTextOutlined, 
  OrderedListOutlined, 
  PlusOutlined, 
  MinusCircleOutlined,
  ReadOutlined,
  SoundOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

// Services & Types
import { ScoreTableService } from "./scoreTable.service";
// Shared Component
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage";
import type { ScoreTableListItem } from "./scoreTable.types";
import { ExamService } from "../Exams/exams.service";
import { categorieservice } from "../Categories/category.service";

const { Text } = Typography;

// =============================================================================
// SUB-COMPONENT: Xử lý nhập liệu danh sách Rule (Dynamic Form List)
// =============================================================================
const ScoreRuleInput = ({ value = [], onChange }: any) => {
  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}>
      <Form.List name="conversionRules" initialValue={value}>
        {(fields, { add, remove }) => (
          <>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: 5 }}>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, 'correctAnswers']}
                      rules={[{ required: true, message: 'Nhập số câu' }]}
                      noStyle
                    >
                      <InputNumber 
                        placeholder="Số câu đúng" 
                        style={{ width: '100%' }} 
                        min={0} 
                        addonBefore="Câu"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>→</Col>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, 'score']}
                      rules={[{ required: true, message: 'Nhập điểm' }]}
                      noStyle
                    >
                      <InputNumber 
                        placeholder="Điểm số" 
                        style={{ width: '100%' }} 
                        min={0}
                        addonAfter="Điểm"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined 
                      onClick={() => remove(name)} 
                      style={{ color: 'red', cursor: 'pointer' }} 
                    />
                  </Col>
                </Row>
              ))}
            </div>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
              Thêm quy tắc đổi điểm
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// =============================================================================
// MAIN PAGE
// =============================================================================
const ScoreTablePage = () => {

  return (
    <CrudPage<ScoreTableListItem>
      config={{
        title: "Bảng quy đổi điểm",
        subtitle: "Cấu hình thang điểm cho từng phần thi (Reading/Listening)",
        createButtonText: "Tạo bảng điểm",
        service: ScoreTableService,
        viewMode: "table",

        // 1. THỐNG KÊ
        stats: (data: ScoreTableListItem[]) => [
          {
            title: "Tổng bảng điểm",
            value: data.length,
            icon: <FileTextOutlined />,
            color: "#6366f1"
          },
          {
            title: "Listening",
            value: data.filter(x => x.categoryName === 'Listening').length,
            icon: <SoundOutlined />,
            color: "#faad14"
          },
          {
            title: "Reading",
            value: data.filter(x => x.categoryName === 'Reading').length,
            icon: <ReadOutlined />,
            color: "#1890ff"
          }
        ],

        // 2. BỘ LỌC
        filters: [
          {
            name: "keyword",
            type: "input",
            placeholder: "Tìm theo tên đề thi...",
            width: "300px"
          },
          {
            name: "examId",
            type: "select",
            placeholder: "Lọc theo Đề thi",
            // api: ExamService.getSelect, // API lấy danh sách đề thi (Label/Value)
            width: "250px"
          },
          {
            name: "categoryId",
            type: "select",
            placeholder: "Kỹ năng",
            width: "150px"
          }
        ],

        // 3. TABLE
        tableConfig: {
          rowKey: "id",
          columns: [
            {
              title: "Đề thi áp dụng",
              dataIndex: "examTitle",
              width: 300,
              render: (text) => <Text strong>{text}</Text>
            },
            {
              title: "Kỹ năng",
              dataIndex: "categoryName", // Đã map từ backend
              width: 150,
              render: (name) => {
                let color = 'default';
                let icon = null;
                if (name === 'Listening') { color = 'orange'; icon = <SoundOutlined />; }
                if (name === 'Reading') { color = 'blue'; icon = <ReadOutlined />; }
                
                return (
                  <Tag icon={icon} color={color} style={{ padding: '4px 10px', fontSize: 13 }}>
                    {name}
                  </Tag>
                );
              }
            },
            {
              title: "Số lượng quy tắc",
              dataIndex: "totalRules",
              width: 150,
              align: 'center',
              render: (count) => (
                <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
              )
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              width: 150,
              render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---")
            }
          ]
        },

        // 4. FORM CREATE/EDIT
        formFields: [
          { 
            name: "examId", 
            label: "Chọn Đề thi", 
            type: "select", 
            rules: [{ required: true, message: "Vui lòng chọn đề thi" }] 
          },
          { 
            name: "categoryId", 
            label: "Kỹ năng (Category)", 
            type: "select", 
            rules: [{ required: true, message: "Vui lòng chọn kỹ năng" }] 
          },
          
          // Field đặc biệt: Danh sách quy đổi
          // Lưu ý: CrudPage cần hỗ trợ type 'custom' hoặc 'component', 
          // nếu không thì dùng renderInput (tùy implementation của bạn)
          {
            name: "conversionRules",
            label: "Bảng quy đổi điểm",
            type: "custom", // Hoặc 'component' tùy CrudPage của bạn định nghĩa
            rules: [{ required: true, message: "Phải có ít nhất 1 quy tắc" }],
            // Component render custom input list ta đã viết ở trên
            renderInput: (props: any) => <ScoreRuleInput {...props} /> 
          }
        ],

        // 5. VIEW DETAIL (READ ONLY)
        auditFields: [
            { name: 'createdAt', label: 'Ngày tạo', type: 'date' },
            { name: 'updatedAt', label: 'Cập nhật', type: 'date' },
            {
                name: 'conversionRules',
                label: 'Chi tiết quy đổi',
                // Render list dạng tag khi view detail
                render: (rules: any[]) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                        {rules?.map((r, idx) => (
                            <Tag key={idx}>{r.correctAnswers} câu = <b>{r.score}đ</b></Tag>
                        ))}
                    </div>
                )
            }
        ]
      }}
    />
  );
};

export default ScoreTablePage;