import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, Typography, Spin, message,
  Descriptions, Tag, Collapse, Empty, Modal, Form,
  Input, InputNumber, Table, Popconfirm, Select, Checkbox
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import { ExamService } from './exams.service';
import type { ExamDetailDto, ExamSectionDto } from './exam.types';
import { toast } from 'react-toastify';
import { categorieservice } from '../Categories/category.service';
import { questionService } from '../../../components/admin/questions/components/Question.service';
import AddQuestionToSectionModal, { type QuestionSelectItem } from '../../../components/admin/exams/ModalAddQuestions';
import ConfirmModal from '../../../components/shared/modal/ConfirmModal';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// ── Helper: group câu hỏi theo groupId ──────────────────────
const groupQuestions = (questions: any[]) => {
  const grouped = new Map<string, any[]>();
  const singles: any[] = [];
  questions.forEach(q => {
    if (q.groupId) {
      if (!grouped.has(q.groupId)) grouped.set(q.groupId, []);
      grouped.get(q.groupId)!.push(q);
    } else {
      singles.push(q);
    }
  });
  return { grouped, singles };
};

// Thêm helper function
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};


// ── Question columns (dùng lại cho cả group-child và single) ─
const makeColumns = (onDelete: (id: string) => void, showDifficulty = true) => [
  {
    title: 'STT',
    dataIndex: 'orderIndex',
    width: 60,
    render: (i: number) => <Tag>{i}</Tag>,
  },
  {
    title: 'Nội dung',
    dataIndex: 'contentPreview',
    render: (text: string) => (
      <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 400, display: 'block' }}>
        <span dangerouslySetInnerHTML={{ __html: text || 'Chưa có nội dung' }} />
      </Text>
    ),
  },
  {
    title: 'Loại',
    dataIndex: 'questionType',
    width: 120,
    render: (t: string) => <Tag color="cyan">{t}</Tag>,
  },
  ...(showDifficulty ? [{
    title: 'Độ khó',
    dataIndex: 'difficultyName',
    width: 100,
    render: (n: string) => n ? <Tag color="orange">{n}</Tag> : <Text type="secondary">—</Text>,
  }] : []),
  {
    title: 'Điểm',
    dataIndex: 'point',
    width: 70,
    render: (p: number) => <Text strong>{p}</Text>,
  },
  {
    title: '',
    key: 'actions',
    width: 80,
    render: (_: any, record: any) => (
      <Popconfirm
        title="Xóa câu hỏi?"
        onConfirm={() => onDelete(record.id)}
        okText="Xóa" cancelText="Hủy"
      >
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  },
];

// ── SectionQuestions component ───────────────────────────────
const SectionQuestions: React.FC<{
  sectionId: string;
  questions: any[];
  selectedKeys: React.Key[];
  onSelectionChange: (keys: React.Key[]) => void;
  onDelete: (examQuestionId: string) => void;
}> = ({ sectionId, questions, selectedKeys, onSelectionChange, onDelete }) => {
  const { grouped, singles } = groupQuestions(questions);
  const columns = makeColumns(onDelete);
  const columnsNoD = makeColumns(onDelete, false);

  const toggleGroupSelect = (children: any[], checked: boolean) => {
    const ids = children.map(c => c.id);
    if (checked) {
      onSelectionChange([...new Set([...selectedKeys, ...ids])]);
    } else {
      onSelectionChange(selectedKeys.filter(k => !ids.includes(k)));
    }
  };

  return (
    <div>
      {/* ── Câu hỏi nhóm ── */}
      {Array.from(grouped.entries()).map(([groupId, children], gIdx) => {
        const allSelected = children.every(c => selectedKeys.includes(c.id));
        const someSelected = children.some(c => selectedKeys.includes(c.id));
        return (
          <div key={groupId} style={{
            marginBottom: 12,
            border: '1px solid #d3adf7',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {/* Group header */}
            <div style={{
              background: '#f9f0ff',
              padding: '8px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #d3adf7',
            }}>
              <Space>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={e => toggleGroupSelect(children, e.target.checked)}
                />
                <Tag color="purple">Nhóm {gIdx + 1}</Tag>
                <Tag>{children.length} câu</Tag>
                <Text type="secondary" style={{ fontSize: 12, maxWidth: 500 }} ellipsis>
                   {stripHtml(children[0]?.groupContentPreview || `Group ID: ${groupId.slice(0, 8)}...`)}
                </Text>
              </Space>
              {/* Xóa cả nhóm */}
              <Popconfirm
                title={`Xóa ${children.length} câu hỏi trong nhóm này?`}
                onConfirm={async () => {
                  for (const c of children) await onDelete(c.id);
                }}
                okText="Xóa" cancelText="Hủy"
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Xóa nhóm
                </Button>
              </Popconfirm>
            </div>

            {/* Children table */}
            <Table
              dataSource={children}
              rowKey="id"
              pagination={false}
              size="small"
              showHeader={false}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                onChange: onSelectionChange,
              }}
              columns={columnsNoD}
              rowClassName={r => selectedKeys.includes(r.id) ? 'row-selected' : ''}
            />
          </div>
        );
      })}

      {/* ── Câu hỏi đơn ── */}
      {singles.length > 0 && (
        <Table
          dataSource={singles}
          rowKey="id"
          pagination={false}
          size="small"
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: onSelectionChange,
          }}
          columns={columns}
          rowClassName={r => selectedKeys.includes(r.id) ? 'row-selected' : ''}
        />
      )}

      {questions.length === 0 && (
        <Empty description="Chưa có câu hỏi nào" style={{ padding: 24 }} />
      )}

      <style>{`
        .row-selected td { background: #e6f4ff !important; }
      `}</style>
    </div>
  );
};

// ── Main Page
const ExamStructurePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamDetailDto | null>(null);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<ExamSectionDto | null>(null);
  const [form] = Form.useForm();
  const [selectedQuestionKeys, setSelectedQuestionKeys] = useState<Record<string, React.Key[]>>({});
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; content: React.ReactNode; onOk: () => void;
  }>({ open: false, title: '', content: '', onOk: () => { } });

  const loadExam = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ExamService.getById(id);
      setExam(data);
    } catch {
      toast.error('Không thể tải thông tin đề thi!');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (codeType = 'skill') => {
    try {
      const res = await categorieservice.getSelectCategory(codeType);
      if (res) setCategories(res);
    } catch { }
  };

  const fetchQuestions = async (
    categoryId: string, keyword?: string
  ): Promise<QuestionSelectItem[]> => {
    const res = await questionService.getHierarchy({
      page: 1, pageSize: 50, categoryId,
      ...(keyword ? { keyword } : {}),
    });
    return (res.items ?? []).map((item: any) => {
      if (item.itemType === 'group') {
        return {
          id: item.groupId,
          content: item.groupContent ?? null,
          questionType: 'Group',
          difficultyName: null,
          categoryId: item.categoryId,
          hasAudio: item.children?.some((c: any) => c.hasAudio) ?? false,
          hasImage: item.children?.some((c: any) => c.hasImage) ?? false,
          isGroup: true,
          groupContent: item.groupContent,
          subQuestions: item.children?.map((c: any) => ({
            id: c.id, content: c.content ?? '', orderIndex: c.orderIndex,
          })) ?? [],
        };
      }
      return {
        id: item.id, content: item.content ?? null,
        questionType: item.questionType, difficultyName: item.difficultyName ?? null,
        categoryId: item.categoryId, hasAudio: false, hasImage: false, isGroup: false,
      };
    });
  };

  const addQuestionsToSection = async (
    examId: string, sectionId: string, categoryId: string, ids: string[]
  ) => {
    await ExamService.addQuestionsToSection(examId, sectionId, {
      examId, sectionId, categoryId, questionIds: ids, defaultPoint: 1,
    });
  };

  useEffect(() => { loadExam(); loadCategories(); }, [id]);

  const openSectionModal = (section?: any) => {
    setEditingSection(section);
    if (section) form.setFieldsValue(section);
    else {
      form.resetFields();
      form.setFieldsValue({ orderIndex: (exam?.sections?.length || 0) + 1 });
    }
    setSectionModalVisible(true);
  };

  const handleSaveSection = async (values: any) => {
    if (!id) return;
    try {
      if (editingSection) {
        await ExamService.updateSection(editingSection.id, values);
        message.success('Cập nhật section thành công!');
      } else {
        await ExamService.addSection(id, { examId: id, ...values });
        message.success('Thêm section thành công!');
      }
      setSectionModalVisible(false);
      loadExam();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lưu section thất bại!');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!id) return;
    try {
      await ExamService.deleteSection(id, sectionId);
      message.success('Xóa section thành công!');
      loadExam();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xóa section thất bại!');
    }
  };

  const handleDeleteQuestion = async (examQuestionId: string) => {
    if (!id) return;
    try {
      await ExamService.removeQuestion(id, examQuestionId);
      message.success('Xóa câu hỏi thành công!');
      loadExam();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xóa câu hỏi thất bại!');
    }
  };

  const handleBulkDelete = (sectionId: string, examQuestionIds: string[]) => {
    if (!examQuestionIds.length) return;
    setConfirmModal({
      open: true,
      title: 'Xóa nhiều câu hỏi',
      content: `Bạn có chắc muốn xóa ${examQuestionIds.length} câu hỏi đã chọn?`,
      onOk: async () => {
        try {
          await ExamService.bulkDeleteQuestions(id!, examQuestionIds);
          message.success(`Đã xóa ${examQuestionIds.length} câu hỏi`);
          setSelectedQuestionKeys(prev => ({ ...prev, [sectionId]: [] }));
          loadExam();
        } catch {
          message.error('Xóa thất bại!');
        } finally {
          setConfirmModal(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  if (!exam) return <Empty description="Không tìm thấy đề thi" />;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/exams')}>
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>Cấu trúc đề thi: {exam.title}</Title>
              <Tag color={exam.status === 'Published' ? 'success' : 'default'}>{exam.status}</Tag>
            </Space>
          </div>
          <Descriptions column={4} size="small">
            <Descriptions.Item label="Mã đề"><Tag color="blue">{exam.code}</Tag></Descriptions.Item>
            <Descriptions.Item label="Thời gian">{exam.duration} phút</Descriptions.Item>
            <Descriptions.Item label="Tổng điểm">{exam.totalScore}</Descriptions.Item>
            <Descriptions.Item label="Số câu"><Tag color="green">{exam.questionCount} câu</Tag></Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {/* Sections */}
      <Card
        title="Danh sách Sections"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openSectionModal()}>
            Thêm Section
          </Button>
        }
      >
        {exam.sections && exam.sections.length > 0 ? (
          <Collapse accordion>
            {exam.sections.map(section => {
              const selectedKeys = selectedQuestionKeys[section.id] || [];
              return (
                <Panel
                  key={section.id}
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Tag color="purple">Section {section.orderIndex}</Tag>
                        <Text strong>{section.name}</Text>
                        <Text type="secondary">({section.questions.length} câu)</Text>
                      </Space>
                      <Space onClick={e => e.stopPropagation()}>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openSectionModal(section)}>Sửa</Button>
                        <Popconfirm
                          title="Xóa section?" description="Tất cả câu hỏi trong section sẽ bị xóa"
                          onConfirm={() => handleDeleteSection(section.id)} okText="Xóa" cancelText="Hủy"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
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

                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {selectedKeys.length > 0 && (
                        <Button danger icon={<DeleteOutlined />}
                          onClick={() => handleBulkDelete(section.id, selectedKeys as string[])}>
                          Xóa {selectedKeys.length} câu hỏi đã chọn
                        </Button>
                      )}
                    </div>
                    <Button type="dashed" icon={<PlusOutlined />}
                      onClick={() => { setTargetSection(section); setQuestionModalOpen(true); }}>
                      Thêm câu hỏi
                    </Button>
                  </div>

                  {/* ✅ Tree view thay Table flat */}
                  <SectionQuestions
                    sectionId={section.id}
                    questions={section.questions}
                    selectedKeys={selectedKeys}
                    onSelectionChange={keys =>
                      setSelectedQuestionKeys(prev => ({ ...prev, [section.id]: keys }))
                    }
                    onDelete={handleDeleteQuestion}
                  />
                </Panel>
              );
            })}
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
        okText="Lưu" cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveSection}>
          <Form.Item name="categoryId" label="Loại phần thi" rules={[{ required: true }]}>
            <Select options={categories} placeholder="Chọn phần thi" showSearch optionFilterProp="children" />
          </Form.Item>
          <Form.Item name="instructions" label="Hướng dẫn">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="orderIndex" label="Thứ tự" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="timeLimit" label="Giới hạn thời gian (phút)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <AddQuestionToSectionModal
        open={questionModalOpen}
        section={targetSection}
        examId={id!}
        existingQuestionIds={targetSection?.questions.map(q => q.questionId) ?? []}
        onClose={() => setQuestionModalOpen(false)}
        onSuccess={loadExam}
        fetchQuestions={fetchQuestions}
        addQuestionsToSection={addQuestionsToSection}
      />

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        content={confirmModal.content}
        okText="Xóa" cancelText="Hủy"
        onOk={confirmModal.onOk}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ExamStructurePage;