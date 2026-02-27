import React from "react";
import { Tag, Badge, Typography, Button, Tooltip, Space, Popconfirm } from "antd";
import {
  FileTextOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { CrudPage } from "../../../components/shared/crud/components/page/CrudPage";
import dayjs from "dayjs";
import { ExamService } from "./exams.service";
import { message } from "antd";
import { ExamCategory, ExamLevel, ExamScope, ExamStatus, ExamType } from "./exam.types";

const { Text } = Typography;

const ExamPage = () => {
  const navigate = useNavigate();

  // Chuyển sang màn soạn cấu trúc
  const handleConfigureStructure = (record: any) => {
    console.log('Navigating to:', `/admin/exams/${record.id}/structure`);
    console.log('Record ID:', record.id);
    navigate(`/admin/exams/${record.id}/structure`);
  };

  // Xem trước đề thi
  const handlePreview = (record: any) => {
    navigate(`/admin/exams/${record.id}/preview`);
  };

  // Nhân bản đề thi
  const handleDuplicate = async (record: any) => {
    try {
      const newCode = `${record.code}-COPY-${Date.now()}`;
      const newTitle = `${record.title} (Copy)`;

      await ExamService.duplicate(record.id, newCode, newTitle);
      message.success('Nhân bản đề thi thành công!');
      window.location.reload(); // Reload để cập nhật danh sách
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Nhân bản thất bại!');
    }
  };

  // Publish đề thi
  const handlePublish = async (record: any) => {
    try {
      await ExamService.publish(record.id);
      message.success('Đã xuất bản đề thi!');
      window.location.reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xuất bản thất bại!');
    }
  };

  // Tạm ngưng đề thi
  const handleSuspend = async (record: any) => {
    try {
      await ExamService.changeStatus(record.id, 3, 'Tạm ngưng từ trang quản lý');
      message.success('Đã tạm ngưng đề thi!');
      window.location.reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tạm ngưng thất bại!');
    }
  };

  return (
    <CrudPage
      config={{
        // --- THÔNG TIN CHUNG ---
        title: "Quản lý Đề thi",
        subtitle: "Danh sách và cấu hình các bộ đề thi (TOEIC / IELTS)",
        createButtonText: "Tạo đề thi mới",
        service: ExamService,
        viewMode: "table",

        // --- THỐNG KÊ ---
        stats: (data: any) => [
          {
            title: "Tổng số đề",
            value: data.length,
            icon: <FileTextOutlined />,
            color: "#6366f1"
          },
          {
            title: "Đã xuất bản",
            value: data.filter((x: any) => x.status === 'Published' || x.status === 2).length,
            icon: <CheckCircleOutlined />,
            color: "#10b981"
          },
          {
            title: "Bản nháp",
            value: data.filter((x: any) => x.status === 'Draft' || x.status === 0).length,
            icon: <SyncOutlined />,
            color: "#faad14"
          },
          {
            title: "Tạm ngưng",
            value: data.filter((x: any) => x.status === 'Suspended' || x.status === 3).length,
            icon: <ClockCircleOutlined />,
            color: "#ff4d4f"
          }
        ],

        // --- BỘ LỌC ---
        filters: [
          {
            width: "350px",
            name: "keyword",
            type: "input",
            placeholder: "Tìm theo tên hoặc mã đề..."
          },
          {
            width: "160px",
            name: "status",
            type: "select",
            placeholder: "Trạng thái",
            options: [
              { label: 'Tất cả', value: 'all' },
              { label: 'Bản nháp', value: 'Draft' },
              { label: 'Chờ duyệt', value: 'PendingReview' },
              { label: 'Đã xuất bản', value: 'Published' },
              { label: 'Tạm ngưng', value: 'Suspended' },
              { label: 'Lưu trữ', value: 'Archived' },
            ]
          }
        ],

        // --- CẤU HÌNH BẢNG ---
        tableConfig: {
          rowKey: "id",
          columns: [
            {
              title: "Mã đề",
              dataIndex: "code",
              width: 140,
              fixed: 'left',
              render: (text: string) => (
                <Tag color="geekblue" style={{ fontWeight: 600 }}>
                  {text}
                </Tag>
              )
            },
            {
              title: "Tên đề thi",
              dataIndex: "title",
              width: 300,
              render: (text: string, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong>{text}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.description?.substring(0, 60) || 'Chưa có mô tả'}
                  </Text>
                </div>
              )
            },
            {
              title: "Phân loại",
              dataIndex: "category",
              width: 120,
              render: (category: string, record: any) => (
                <div>
                  <Tag color="purple">{category || 'N/A'}</Tag>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                    {record.scope || 'N/A'}
                  </div>
                </div>
              )
            },
            {
              title: "Thời gian",
              dataIndex: "duration",
              width: 110,
              align: 'center',
              render: (min: number) => (
                <Tag icon={<ClockCircleOutlined />}>{min} phút</Tag>
              )
            },
            {
              title: "Số câu",
              dataIndex: "questionCount",
              width: 90,
              align: 'center',
              render: (count: number) => (
                <Badge
                  count={count}
                  showZero
                  color={count > 0 ? "#108ee9" : "#d9d9d9"}
                  overflowCount={999}
                />
              )
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 130,
              render: (status: string | number) => {
                // BE trả về string ("Draft") hoặc số (0) đều handle được
                const statusMap: Record<string | number, { color: string; text: string; badgeStatus: any }> = {
                  0: { color: 'default', text: 'Bản nháp', badgeStatus: 'default' },
                  'Draft': { color: 'default', text: 'Bản nháp', badgeStatus: 'default' },
                  1: { color: 'processing', text: 'Chờ duyệt', badgeStatus: 'processing' },
                  'PendingReview': { color: 'processing', text: 'Chờ duyệt', badgeStatus: 'processing' },
                  2: { color: 'success', text: 'Đã xuất bản', badgeStatus: 'success' },
                  'Published': { color: 'success', text: 'Đã xuất bản', badgeStatus: 'success' },
                  3: { color: 'warning', text: 'Tạm ngưng', badgeStatus: 'warning' },
                  'Suspended': { color: 'warning', text: 'Tạm ngưng', badgeStatus: 'warning' },
                  99: { color: 'error', text: 'Lưu trữ', badgeStatus: 'error' },
                  'Archived': { color: 'error', text: 'Lưu trữ', badgeStatus: 'error' },
                };
                const config = statusMap[status] ?? statusMap['Draft'];
                return <Badge status={config.badgeStatus} text={config.text} />;
              }
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              width: 120,
              render: (date: string) =>
                date ? dayjs(date).format("DD/MM/YYYY") : "---"
            },
            {
              title: "Thao tác",
              key: "actions",
              width: 200,
              fixed: 'right',
              render: (_: any, record: any) => (
                <Space size="small">
                  {/* Nút Soạn cấu trúc */}
                  <Tooltip title="Soạn cấu trúc đề thi">
                    <Button
                      type="primary"
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfigureStructure(record);
                      }}
                    >
                      Cấu trúc
                    </Button>
                  </Tooltip>

                  {/* Nút thay đổi trạng thái - theo BE state machine */}
                  {(record.status === 'Draft' || record.status === 0) && (
                    <Popconfirm
                      title="Xuất bản đề thi?"
                      description="Đề thi sẽ hiển thị cho học viên"
                      onConfirm={() => handlePublish(record)}
                      okText="Xuất bản"
                      cancelText="Hủy"
                    >
                      <Button
                        type="default"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#52c41a', borderColor: '#52c41a' }}
                      >
                        Xuất bản
                      </Button>
                    </Popconfirm>
                  )}
                  {(record.status === 'Suspended' || record.status === 3) && (
                    <Popconfirm
                      title="Mở lại đề thi?"
                      description="Đề thi sẽ hiển thị lại cho học viên"
                      onConfirm={() => handlePublish(record)}
                      okText="Mở lại"
                      cancelText="Hủy"
                    >
                      <Button
                        type="default"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#1677ff', borderColor: '#1677ff' }}
                      >
                        Mở lại
                      </Button>
                    </Popconfirm>
                  )}
                  {(record.status === 'Published' || record.status === 2) && (
                    <Popconfirm
                      title="Tạm ngưng đề thi?"
                      description="Học viên sẽ không thể vào thi mới"
                      onConfirm={() => handleSuspend(record)}
                      okText="Tạm ngưng"
                      cancelText="Hủy"
                    >
                      <Button
                        type="default"
                        size="small"
                        danger
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ngưng
                      </Button>
                    </Popconfirm>
                  )}

                  {/* Nút Nhân bản */}
                  <Tooltip title="Nhân bản đề thi">
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(record);
                      }}
                    />
                  </Tooltip>

                  {/* Nút Xem trước */}
                  <Tooltip title="Xem trước">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(record);
                      }}
                    />
                  </Tooltip>
                </Space>
              )
            }
          ]
        },

        // --- FORM TẠO / SỬA ---
        formFields: [
          {
            name: "code",
            label: "Mã đề thi",
            type: "input",
            rules: [{ required: true, message: "Bắt buộc nhập mã" }],
            placeholder: "VD: TOEIC-2024-01"
          },
          {
            name: "title",
            label: "Tên đề thi",
            type: "input",
            rules: [{ required: true, message: "Bắt buộc nhập tên" }],
            placeholder: "VD: TOEIC Full Test 2024"
          },
          {
            name: "description",
            label: "Mô tả",
            type: "textarea",
            placeholder: "Mô tả ngắn về đề thi..."
          },
          {
            name: "duration",
            label: "Thời gian (phút)",
            type: "number",
            rules: [{ required: true }],
            defaultValue: 120
          },
          {
            name: "totalScore",
            label: "Tổng điểm",
            type: "number",
            defaultValue: 990
          },
          {
            name: "type",
            label: "Loại kỳ thi",
            type: "select",
            rules: [{ required: true }],
            options: [
              { label: 'TOEIC', value: ExamType.TOEIC },
              { label: 'IELTS', value: ExamType.IELTS },
              { label: 'TOEFL', value: ExamType.TOEFL },
              { label: 'SAT', value: ExamType.SAT },
              { label: 'Other', value: ExamType.Other },
            ],
            defaultValue: ExamType.TOEIC
          },
          {
            name: "category",
            label: "Loại đề thi",
            type: "select",
            rules: [{ required: true }],
            options: [
              { label: 'Full Test', value: ExamCategory.FullTest },
              { label: 'Skill Test', value: ExamCategory.SkillTest },
              { label: 'Part Test', value: ExamCategory.PartTest },
              { label: 'Mini Test', value: ExamCategory.MiniTest },
              { label: 'Diagnostic Test', value: ExamCategory.DiagnosticTest },
              { label: 'Assignment Test', value: ExamCategory.AssignmentTest },
            ],
            defaultValue: ExamCategory.FullTest
          },
          {
            name: "scope",
            label: "Phạm vi",
            type: "select",
            rules: [{ required: true }],
            options: [
              { label: 'Full', value: ExamScope.Full },
              { label: 'Listening Only', value: ExamScope.ListeningOnly },
              { label: 'Reading Only', value: ExamScope.ReadingOnly },
              { label: 'Writing Only', value: ExamScope.WritingOnly },
              { label: 'Speaking Only', value: ExamScope.SpeakingOnly },
              { label: 'Part 1 Only', value: ExamScope.Part1Only },
              { label: 'Part 2 Only', value: ExamScope.Part2Only },
              { label: 'Part 3 Only', value: ExamScope.Part3Only },
              { label: 'Part 4 Only', value: ExamScope.Part4Only },
              { label: 'Part 5 Only', value: ExamScope.Part5Only },
              { label: 'Part 6 Only', value: ExamScope.Part6Only },
              { label: 'Part 7 Only', value: ExamScope.Part7Only },
              { label: 'Part 5 & 6', value: ExamScope.Part5And6 },
              { label: 'Part 3 & 4', value: ExamScope.Part3And4 },
              { label: 'Part 1 & 2', value: ExamScope.Part1And2 },
            ],
            defaultValue: ExamScope.Full
          },
          {
            name: "level",
            label: "Mức độ",
            type: "select",
            options: [
              { label: 'Practice', value: ExamLevel.Practice },
              { label: 'Mock Test', value: ExamLevel.MockTest },
              { label: 'Assignment', value: ExamLevel.Assignment },
              { label: 'Mid Term', value: ExamLevel.MidTerm },
              { label: 'Final Exam', value: ExamLevel.FinalExam },
              { label: 'Placement', value: ExamLevel.Placement },
              { label: 'Real Exam', value: ExamLevel.RealExam },
            ],
            defaultValue: ExamLevel.Practice
          },
          {
            name: "status",
            label: "Trạng thái",
            type: "select",
            options: [
              { label: 'Bản nháp', value: ExamStatus.Draft },
              { label: 'Chờ duyệt', value: ExamStatus.PendingReview },
              { label: 'Đã xuất bản', value: ExamStatus.Published },
              { label: 'Tạm ngưng', value: ExamStatus.Suspended },
              { label: 'Lưu trữ', value: ExamStatus.Archived },
            ],
            defaultValue: ExamStatus.Draft
          }
        ]
      }}
    />
  );
};

export default ExamPage;