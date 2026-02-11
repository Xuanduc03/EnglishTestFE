import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Spin,
  message,
  Descriptions,
  Tag,
  Collapse,
  Empty,
  Modal,
  Form,
  Input,
  InputNumber,
  Table,
  Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { ExamService } from './exams.service';
import type { ExamDetailDto, ExamSectionDto, CreateExamSectionDto } from './exam.types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ExamStructurePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamDetailDto | null>(null);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [form] = Form.useForm();

  // Load exam detail
  const loadExam = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await ExamService.getById(id);
      setExam(data);
    } catch (error: any) {
      message.error('Không thể tải thông tin đề thi!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [id]);

  useEffect(() => {
    
  }, [category]);

  // Mở modal thêm/sửa section
  const openSectionModal = (section?: any) => {
    setEditingSection(section);
    if (section) {
      form.setFieldsValue(section);
    } else {
      form.resetFields();
      form.setFieldsValue({
        orderIndex: (exam?.sections?.length || 0) + 1
      });
    }
    setSectionModalVisible(true);
  };

  // Lưu section
  const handleSaveSection = async (values: any) => {
    if (!id) return;

    try {
      if (editingSection) {
        // Update section
        await ExamService.updateSection(editingSection.id, values);
        message.success('Cập nhật section thành công!');
      } else {
        // Create new section
        await ExamService.addSection(id, {
          examId: id,
          ...values
        });
        message.success('Thêm section thành công!');
      }
      
      setSectionModalVisible(false);
      loadExam();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lưu section thất bại!');
    }
  };

  // Xóa section
  const handleDeleteSection = async (sectionId: string) => {
    if (!id) return;

    try {
      await ExamService.deleteSection(id, sectionId);
      message.success('Xóa section thành công!');
      loadExam();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa section thất bại!');
    }
  };

  // Xóa câu hỏi khỏi section
  const handleDeleteQuestion = async (examQuestionId: string) => {
    if (!id) return;

    try {
      await ExamService.removeQuestion(id, examQuestionId);
      message.success('Xóa câu hỏi thành công!');
      loadExam();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa câu hỏi thất bại!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!exam) {
    return <Empty description="Không tìm thấy đề thi" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/exams')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Cấu trúc đề thi: {exam.title}
              </Title>
              <Tag color={exam.status === 'Published' ? 'success' : 'default'}>
                {exam.status}
              </Tag>
            </Space>
          </div>

          <Descriptions column={4} size="small">
            <Descriptions.Item label="Mã đề">
              <Tag color="blue">{exam.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {exam.duration} phút
            </Descriptions.Item>
            <Descriptions.Item label="Tổng điểm">
              {exam.totalScore}
            </Descriptions.Item>
            <Descriptions.Item label="Số câu">
              <Tag color="green">{exam.questionCount} câu</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {/* Sections */}
      <Card 
        title="Danh sách Sections" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openSectionModal()}
          >
            Thêm Section
          </Button>
        }
      >
        {exam.sections && exam.sections.length > 0 ? (
          <Collapse accordion>
            {exam.sections.map((section) => (
              <Panel
                key={section.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Tag color="purple">Section {section.orderIndex}</Tag>
                      <Text strong>{section.name}</Text>
                      <Text type="secondary">({section.questions.length} câu)</Text>
                    </Space>
                    <Space onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openSectionModal(section)}
                      >
                        Sửa
                      </Button>
                      <Popconfirm
                        title="Xóa section?"
                        description="Tất cả câu hỏi trong section sẽ bị xóa"
                        onConfirm={() => handleDeleteSection(section.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                }
              >
                {section.instructions && (
                  <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    <Text type="secondary">{section.instructions}</Text>
                  </div>
                )}

                {/* Question List */}
                <Table
                  dataSource={section.questions}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'STT',
                      dataIndex: 'orderIndex',
                      width: 60,
                      render: (index: number) => <Tag>{index}</Tag>
                    },
                    {
                      title: 'Nội dung',
                      dataIndex: 'contentPreview',
                      render: (text: string) => (
                        <Text ellipsis style={{ maxWidth: 400 }}>
                          {text || 'Chưa có nội dung'}
                        </Text>
                      )
                    },
                    {
                      title: 'Loại',
                      dataIndex: 'questionType',
                      width: 120,
                      render: (type: string) => <Tag color="cyan">{type}</Tag>
                    },
                    {
                      title: 'Độ khó',
                      dataIndex: 'difficultyName',
                      width: 100,
                      render: (name: string) => <Tag color="orange">{name}</Tag>
                    },
                    {
                      title: 'Điểm',
                      dataIndex: 'point',
                      width: 80,
                      render: (point: number) => <Text strong>{point}</Text>
                    },
                    {
                      title: 'Thao tác',
                      key: 'actions',
                      width: 100,
                      render: (_: any, record: any) => (
                        <Popconfirm
                          title="Xóa câu hỏi?"
                          onConfirm={() => handleDeleteQuestion(record.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      )
                    }
                  ]}
                />

                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      // TODO: Open question selector modal
                      message.info('Tính năng chọn câu hỏi đang phát triển...');
                    }}
                  >
                    Thêm câu hỏi vào section này
                  </Button>
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description="Chưa có section nào. Hãy thêm section đầu tiên!" />
        )}
      </Card>

      {/* Section Modal */}
      <Modal
        title={editingSection ? 'Sửa Section' : 'Thêm Section Mới'}
        open={sectionModalVisible}
        onCancel={() => setSectionModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSection}
        >
          <Form.Item
            name="name"
            label="Tên Section"
            rules={[{ required: true, message: 'Vui lòng nhập tên section' }]}
          >
            <Input placeholder="VD: Listening Section" />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Hướng dẫn làm bài cho section này..."
            />
          </Form.Item>

          <Form.Item
            name="orderIndex"
            label="Thứ tự"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Giới hạn thời gian (phút)"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamStructurePage;