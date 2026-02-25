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
  Popconfirm,
  Select
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { ExamService } from './exams.service';
import type { ExamDetailDto, ExamSectionDto, CreateExamSectionDto } from './exam.types';
import { toast } from 'react-toastify';
import { categorieservice } from '../Categories/category.service';
import { questionService } from '../../../components/admin/questions/components/Question.service';
import AddQuestionToSectionModal, { type QuestionSelectItem } from '../../../components/admin/exams/ModalAddQuestions';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const ExamStructurePage: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamDetailDto | null>(null);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<ExamSectionDto | null>(null);
  const [form] = Form.useForm();

  // Load exam detail
  const loadExam = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ExamService.getById(id);
      setExam(data);
    } catch (error: any) {
      toast.error('Không thể tải thông tin đề thi!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (codeType = "skill") => {
    try {
      const resData = await categorieservice.getSelectCategory(codeType);
      if (!resData) return;
      setCategories(resData);
    } catch (error) {
      console.error("Lỗi khi load Categories:", error);
    }
  };

  // fetch Question
  const fetchQuestions = async (categoryId: string, keyword?: string): Promise<QuestionSelectItem[]> => {
    const res = await questionService.getAll({
      page: 1,
      pageSize: 50,
      categoryId: categoryId,
      ...(keyword ? { keyword } : {}),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const rawItems = res.items ?? [];

    return rawItems.map((item: any) => ({
      ...item, 
      hasAudio: item.hasAudio ?? false, // VD: item.audioUrl ? true : false
      hasImage: item.hasImage ?? false, // VD: item.imageUrl ? true : false
      isGroup: item.isGroup ?? false,   // VD: item.questionType === 'GROUP'
    }));
  }

  const addQuestionsToSection = async (
    examId: string,
    sectionId: string,
    categoryId: string,
    ids: string[]
  ) => {
    await ExamService.addQuestionsToSection(examId, sectionId, {
      examId,
      sectionId,
      categoryId,
      questionIds: ids,
      defaultPoint: 1
    });
  };

  useEffect(() => {
    loadExam();
    loadCategories();
  }, [id]);


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
                      setTargetSection(section);    // section đang xét
                      setQuestionModalOpen(true);
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
            name="categoryId" // Khớp với Command BE
            label="Loại phần thi"
            rules={[{ required: true, message: 'Vui lòng chọn loại phần thi' }]}
          >
            <Select
              value={categoryId}
              options={categories}
              placeholder="Chọn phần thi (VD: Listening Part 1...)"
              showSearch
              style={{ width: "100%" }}
              disabled={categories.length === 0}
              optionFilterProp="children"
            >
            </Select>
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



      {/* Render modal */}
      <AddQuestionToSectionModal
        open={questionModalOpen}
        section={targetSection}
        examId={id!}
        existingQuestionIds={
          targetSection?.questions.map(q => q.questionId) ?? []
        }
        onClose={() => setQuestionModalOpen(false)}
        onSuccess={loadExam}
        fetchQuestions={fetchQuestions}
        addQuestionsToSection={addQuestionsToSection}
      />
    </div>
  );
};

export default ExamStructurePage;