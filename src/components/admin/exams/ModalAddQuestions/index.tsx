import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Table, Input, Tag, Button, Space, Typography,
  Spin, Empty, Badge, Tooltip, Collapse, Divider, Alert,
  Checkbox
} from 'antd';
import {
  SearchOutlined, PlusOutlined, CheckOutlined,
  SoundOutlined, PictureOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { ExamSectionDto } from '../../../../pages/Admin/Exams/exam.types';

const { Text } = Typography;
const { Panel } = Collapse;

// ============================================================
// TYPES
// ============================================================
export interface QuestionSelectItem {
  id: string;
  content: string | null;
  questionType: string;
  difficultyName: string | null;
  categoryId: string;
  hasAudio: boolean;
  hasImage: boolean;
  isGroup: boolean;
  // nếu là group
  groupTitle?: string;
  groupContent?: string;
  subQuestions?: SubQuestion[];
}

interface SubQuestion {
  id: string;
  content: string;
  orderIndex: number;
}

interface AddQuestionToSectionModalProps {
  open: boolean;
  section: ExamSectionDto | null;  // section đang được thêm
  examId: string;
  // IDs câu hỏi đã có trong section (để disable tích lại)
  existingQuestionIds: string[];
  onClose: () => void;
  onSuccess: () => void;                        // reload exam sau khi thêm
  fetchQuestions: (
    categoryId: string,
    keyword?: string
  ) => Promise<QuestionSelectItem[]>;
  addQuestionsToSection: (
    examId: string,
    sectionId: string,
    categoryId: string,
    questionIds: string[]
  ) => Promise<void>;
}

// ============================================================
// COMPONENT
// ============================================================
const AddQuestionToSectionModal: React.FC<AddQuestionToSectionModalProps> = ({
  open,
  section,
  examId,
  existingQuestionIds,
  onClose,
  onSuccess,
  fetchQuestions,
  addQuestionsToSection,
}) => {
  const [questions, setQuestions] = useState<QuestionSelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Load questions khi mở modal hoặc đổi section ────────────
  const load = useCallback(async (kw = '') => {
    if (!section?.categoryId) return;
    setLoading(true);
    try {
      const data = await fetchQuestions(section.categoryId, kw);
      console.log("data", data)
      setQuestions(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [section?.categoryId, fetchQuestions]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setKeyword('');
      load();
    }
  }, [open, load]);

  // ── Search debounce ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => load(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  // ── Toggle chọn ─────────────────────────────────────────────
  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };


  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!section || selectedIds.length === 0) return;

    setSubmitting(true);
    try {
      await addQuestionsToSection(
        examId,
        section.id,
        section.categoryId,
        selectedIds
      );

      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const isAlreadyAdded = (id: string) => existingQuestionIds.includes(id);
  const isSelected = (id: string) => selectedIds.includes(id);

  // ── Split data ───────────────────────────────────────────────
  const singles = questions.filter(q => !q.isGroup);
  const groups = questions.filter(q => q.isGroup);


  // ── Select All helpers ───────────────────────────────────────
  const selectableIds = (list: QuestionSelectItem[]) =>
    list.filter(q => !isAlreadyAdded(q.id)).map(q => q.id);

  const isAllSelected = (list: QuestionSelectItem[]) => {
    const ids = selectableIds(list);
    return ids.length > 0 && ids.every(id => selectedIds.includes(id));
  };

  const isIndeterminate = (list: QuestionSelectItem[]) => {
    const ids = selectableIds(list);
    const selected = ids.filter(id => selectedIds.includes(id));
    return selected.length > 0 && selected.length < ids.length;
  };

  const toggleAll = (list: QuestionSelectItem[]) => {
    const ids = selectableIds(list);
    if (isAllSelected(list)) {
      // Bỏ chọn tất cả trong group này
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      // Chọn tất cả chưa được chọn
      setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    }
  };


  // ============================================================
  // COLUMNS cho single questions
  // ============================================================
  const singleColumns = [
    {
      title: '',
      width: 48,
      render: (_: any, record: QuestionSelectItem) => {
        const added = isAlreadyAdded(record.id);
        const selected = isSelected(record.id);
        return (
          <Button
            size="small"
            type={selected ? 'primary' : 'default'}
            shape="circle"
            icon={added ? <CheckOutlined /> : selected ? <CheckOutlined /> : <PlusOutlined />}
            disabled={added}
            onClick={() => toggle(record.id)}
            style={added ? { background: '#f0f0f0', borderColor: '#d9d9d9' } : undefined}
          />
        );
      }
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      render: (text: string | null, record: QuestionSelectItem) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 420, display: 'block' }}>
            {text || <Text type="secondary" italic>Câu hỏi không có text (Audio/Image)</Text>}
          </Text>
          <Space size={4}>
            {record.hasAudio && (
              <Tag icon={<SoundOutlined />} color="blue" style={{ fontSize: 11 }}>Audio</Tag>
            )}
            {record.hasImage && (
              <Tag icon={<PictureOutlined />} color="purple" style={{ fontSize: 11 }}>Image</Tag>
            )}
          </Space>
        </Space>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'questionType',
      width: 110,
      render: (t: string) => <Tag color="cyan">{t}</Tag>
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficultyName',
      width: 90,
      render: (d: string | null) =>
        d ? <Tag color="orange">{d}</Tag> : <Text type="secondary">-</Text>
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Thêm câu hỏi vào section</span>
          {section && <Tag color="purple">{section.instructions ?? `Section ${section.orderIndex}`}</Tag>}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={860}
      styles={{ body: { padding: '16px 24px', maxHeight: '72vh', overflowY: 'auto' } }}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text type="secondary">
            Đã chọn: <Text strong style={{ color: '#1677ff' }}>{selectedIds.length}</Text> câu hỏi
          </Text>
          <Space>
            <Button onClick={onClose}>Huỷ</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={selectedIds.length === 0}
              loading={submitting}
              onClick={handleSubmit}
            >
              Thêm {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} vào section
            </Button>
          </Space>
        </Space>
      }
    >
      {/* Search + Select All tổng */}
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Tìm theo nội dung câu hỏi..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          allowClear
        />
      </Space.Compact>
      {questions.length > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
          <Checkbox
            checked={isAllSelected(questions)}
            indeterminate={isIndeterminate(questions)}
            onChange={() => toggleAll(questions)}
            disabled={selectableIds(questions).length === 0}
          >
            <Text strong>Chọn tất cả</Text>
            <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
              ({selectableIds(questions).length} câu có thể chọn)
            </Text>
          </Checkbox>
          {selectedIds.length > 0 && (
            <Button
              type="link"
              size="small"
              danger
              style={{ marginLeft: 16, padding: 0 }}
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn tất cả
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : questions.length === 0 ? (
        <Empty description="Không có câu hỏi nào cho phần thi này" />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>

          {/* ── SINGLE QUESTIONS ── */}
          {singles.length > 0 && (
            <div>
              <Divider orientation="left" style={{ margin: '0 0 12px 0' }}>
                <Space size={12}>
                  <Badge count={singles.length} color="#1677ff" offset={[6, 0]}>
                    <Text strong style={{ paddingRight: 16 }}>Câu hỏi đơn</Text>
                  </Badge>
                  <Checkbox
                    checked={isAllSelected(singles)}
                    indeterminate={isIndeterminate(singles)}
                    onChange={() => toggleAll(singles)}
                    disabled={selectableIds(singles).length === 0}
                  >
                    <Text style={{ fontSize: 12 }}>
                      Chọn tất cả ({selectableIds(singles).length})
                    </Text>
                  </Checkbox>
                </Space>
              </Divider>
              <Table
                dataSource={singles}
                rowKey="id"
                columns={singleColumns}
                pagination={{ pageSize: 8, size: 'small', showSizeChanger: false }}
                size="small"
                // Highlight row đã chọn
                rowClassName={(record) => {
                  if (isAlreadyAdded(record.id)) return 'row-already-added';
                  if (isSelected(record.id)) return 'row-selected';
                  return '';
                }}
              />
            </div>
          )}

          {/* ── GROUP QUESTIONS ── */}
          {groups.length > 0 && (
            <div>
              <Divider orientation="left" style={{ margin: '0 0 12px 0' }}>
                <Space size={12}>
                  <Badge count={groups.length} color="#722ed1" offset={[6, 0]}>
                    <Text strong style={{ paddingRight: 16 }}>Câu hỏi nhóm</Text>
                  </Badge>
                  <Checkbox
                    checked={isAllSelected(groups)}
                    indeterminate={isIndeterminate(groups)}
                    onChange={() => toggleAll(groups)}
                    disabled={selectableIds(groups).length === 0}
                  >
                    <Text style={{ fontSize: 12 }}>
                      Chọn tất cả ({selectableIds(groups).length})
                    </Text>
                  </Checkbox>
                </Space>
              </Divider>
              <Collapse size="small">
                {groups.map(group => {
                  const added = isAlreadyAdded(group.id);
                  const selected = isSelected(group.id);
                  return (
                    <Panel
                      key={group.id}
                      style={
                        selected ? { background: '#e6f4ff', borderColor: '#91caff' } :
                          added ? { background: '#f5f5f5' } : {}
                      }
                      header={
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space size={8}>
                            <Button
                              size="small"
                              type={selected ? 'primary' : 'default'}
                              shape="circle"
                              icon={added ? <CheckOutlined /> : selected ? <CheckOutlined /> : <PlusOutlined />}
                              disabled={added}
                              onClick={e => { e.stopPropagation(); toggle(group.id); }}
                            />
                            <Text
                              ellipsis
                              style={{ maxWidth: 500 }}
                              type={added ? 'secondary' : undefined}
                            >
                              {group.groupTitle || group.groupContent?.substring(0, 80) + '...'}
                            </Text>
                          </Space>
                          <Space size={4}>
                            {group.hasAudio && <Tag icon={<SoundOutlined />} color="blue" style={{ fontSize: 11 }}>Audio</Tag>}
                            {group.hasImage && <Tag icon={<PictureOutlined />} color="purple" style={{ fontSize: 11 }}>Image</Tag>}
                            <Tag>{group.subQuestions?.length ?? 0} câu</Tag>
                            {added && <Tag color="success">Đã thêm</Tag>}
                          </Space>
                        </Space>
                      }
                    >
                      {/* Sub questions preview */}
                      {group.subQuestions && group.subQuestions.length > 0 ? (
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          {group.subQuestions.map(sub => (
                            <div key={sub.id} style={{ padding: '4px 8px', background: '#fafafa', borderRadius: 4 }}>
                              <Text style={{ fontSize: 13 }}>
                                <Text type="secondary">{sub.orderIndex}. </Text>
                                {sub.content}
                              </Text>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary" italic>Không có câu hỏi con</Text>
                      )}
                    </Panel>
                  );
                })}
              </Collapse>
            </div>
          )}

          {/* Câu đã có trong section */}
          {existingQuestionIds.length > 0 && (
            <Alert
              type="info"
              showIcon
              message={`${existingQuestionIds.length} câu hỏi đã có trong section này (không thể chọn lại)`}
              style={{ marginTop: 8 }}
            />
          )}
        </Space>
      )}

      {/* Row highlight styles */}
      <style>{`
        .row-selected td { background: #e6f4ff !important; }
        .row-already-added td { background: #f5f5f5 !important; opacity: 0.7; }
      `}</style>
    </Modal>
  );
};

export default AddQuestionToSectionModal;

