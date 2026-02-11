import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Input,
  Select,
  Space,
  Tag,
  Button,
  message,
  Typography,
  InputNumber,
  Row,
  Col
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { api } from '../../../../configs/axios-custom';

const { Text } = Typography;
const { Option } = Select;

interface QuestionSelectorModalProps {
  visible: boolean;
  examId: string;
  sectionId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface Question {
  id: string;
  content: string;
  questionType: string;
  difficulty?: { id: string; name: string };
  category?: { id: string; name: string };
  createdAt: string;
}

const QuestionSelectorModal: React.FC<QuestionSelectorModalProps> = ({
  visible,
  examId,
  sectionId,
  onCancel,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [defaultPoint, setDefaultPoint] = useState(1.0);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [difficultyId, setDifficultyId] = useState<string | undefined>();
  const [questionType, setQuestionType] = useState<string | undefined>();

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Categories & Difficulties (for filters)
  const [categories, setCategories] = useState<any[]>([]);
  const [difficulties, setDifficulties] = useState<any[]>([]);

  // Load questions
  const loadQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/api/questions', {
        params: {
          pageIndex: page,
          pageSize: pagination.pageSize,
          keyword,
          categoryId,
          difficultyId,
          questionType,
          isActive: true
        }
      });

      const data = res.data?.data || res.data;
      setQuestions(data.items || data);
      setPagination({
        ...pagination,
        current: page,
        total: data.totalCount || data.length
      });
    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      // Load categories
      const catRes = await api.get('/api/categories', {
        params: { pageSize: 100 }
      });
      setCategories(catRes.data?.data?.items || []);

      // Load difficulties
      const diffRes = await api.get('/api/difficulties', {
        params: { pageSize: 100 }
      });
      setDifficulties(diffRes.data?.data?.items || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadQuestions(1);
      loadFilterOptions();
    }
  }, [visible]);

  // Handle search
  const handleSearch = () => {
    loadQuestions(1);
  };

  // Handle add questions
  const handleAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 câu hỏi!');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(
        `/api/exams/${examId}/sections/${sectionId}/questions`,
        {
          questionIds: selectedQuestionIds,
          defaultPoint
        }
      );

      message.success(`Đã thêm ${selectedQuestionIds.length} câu hỏi!`);
      setSelectedQuestionIds([]);
      onSuccess();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Thêm câu hỏi thất bại!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      render: (text: string) => (
        <div
          dangerouslySetInnerHTML={{ __html: text?.substring(0, 200) || 'Chưa có nội dung' }}
          style={{ 
            maxWidth: 400, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        />
      )
    },
    {
      title: 'Loại',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 120,
      render: (type: string) => <Tag color="blue">{type || 'N/A'}</Tag>
    },
    {
      title: 'Chủ đề',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: any) => (
        <Tag color="green">{category?.name || 'N/A'}</Tag>
      )
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: any) => (
        <Tag color="orange">{difficulty?.name || 'N/A'}</Tag>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedQuestionIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedQuestionIds(selectedRowKeys as string[]);
    }
  };

  return (
    <Modal
      title="Chọn câu hỏi từ ngân hàng"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Space key="footer-space">
          <Text>Đã chọn: <strong>{selectedQuestionIds.length}</strong> câu</Text>
          <InputNumber
            min={0.1}
            step={0.5}
            value={defaultPoint}
            onChange={(value) => setDefaultPoint(value || 1)}
            placeholder="Điểm mặc định"
            addonBefore="Điểm:"
            style={{ width: 150 }}
          />
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleAddQuestions}
            disabled={selectedQuestionIds.length === 0}
          >
            Thêm vào đề thi
          </Button>
        </Space>
      ]}
    >
      {/* Filters */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo nội dung..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="Chủ đề"
              style={{ width: '100%' }}
              allowClear
              value={categoryId}
              onChange={setCategoryId}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <Select
              placeholder="Độ khó"
              style={{ width: '100%' }}
              allowClear
              value={difficultyId}
              onChange={setDifficultyId}
            >
              {difficulties.map((diff) => (
                <Option key={diff.id} value={diff.id}>
                  {diff.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Loại câu hỏi"
              style={{ width: '100%' }}
              allowClear
              value={questionType}
              onChange={setQuestionType}
            >
              <Option value="SingleChoice">Single Choice</Option>
              <Option value="MultipleChoice">Multiple Choice</Option>
              <Option value="FillBlank">Fill Blank</Option>
              <Option value="Essay">Essay</Option>
            </Select>
          </Col>
          <Col span={2}>
            <Button type="primary" onClick={handleSearch} block>
              Tìm
            </Button>
          </Col>
        </Row>
      </Space>

      {/* Table */}
      <Table
        rowKey="id"
        dataSource={questions}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          ...pagination,
          onChange: (page) => loadQuestions(page),
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} câu hỏi`
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default QuestionSelectorModal;