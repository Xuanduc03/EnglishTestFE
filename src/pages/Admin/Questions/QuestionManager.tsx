import { useState, useEffect } from 'react';
import {
  Layout,
  Modal,
  message,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Tooltip,
  Badge,
  Dropdown,
  Menu,
  DatePicker,
  Spin
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SyncOutlined,
  SettingOutlined,
  MoreOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { CrudHeader } from '../../../components/shared/crud/components/header/CrudHeader';
import { CategorySidebar } from '../../../components/admin/questions/components/CategorySidebar';
import './QuestionManager.scss';
import AddQuestionModal from '../../../components/admin/questions/AddQuestionModal/AddQuestionModal';
import { questionService } from '../../../components/admin/questions/components/Question.service';
import { toast } from 'react-toastify';
import type { QuestionGroupDetailDto, SingleQuestionDetailDto } from '../../../components/admin/questions/components/Quesion.config';
import { categorieservice } from '../Categories/category.service';
import type { SortOrder } from 'antd/es/table/interface';
import QuestionDetailModal from '../../../components/admin/questions/PreviewDetail/QuestionDetailModal';
import UploadQuestionModal from '../../../components/admin/questions/import/components/steps/UploadModal/UploadModal';
import type { PreviewZipResponse } from '../../../components/admin/questions/import/types/PreviewData.type';
import PreviewImportModal from '../../../components/admin/questions/import/components/steps/PreviewImport/PreviewImportModal';
import { ImportQuestionService } from '../../../components/admin/questions/import/services/ImportQuestion.service';


const { Search } = Input;
const { Option } = Select;
const { Sider } = Layout;
const { RangePicker } = DatePicker;

type EditingQuestion =
  | { type: 'single'; data: SingleQuestionDetailDto }
  | { type: 'group'; data: QuestionGroupDetailDto }
  | null;

const QuestionManager = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [selectedPartKey, setSelectedPartKey] = useState<string | null>(null);
  const [selectedPartTitle, setSelectedPartTitle] = useState<string>("Tổng quan");
  const [openAddQuestion, setOpenAddQuestion] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion>(null); // Lưu data câu hỏi cần sửa
  const [highlightQuestionId, setHighlightQuestionId] =
    useState<string | undefined>(undefined);

  const [previewData, setPreviewData] = useState<PreviewZipResponse | null>(null);
  const [openPreview, setOpenPreview] = useState(false);

  // Sorting
  const [difficulties, setDifficulties] = useState<Array<{ id: string; name: string }>>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [questionTypeFilter, setQuestionTypeFilter] = useState<string>('all');
  const [createFrom, setCreateFrom] = useState<string | null>(null);
  const [createTo, setCreateTo] = useState<string | null>(null);
  // Table & Pagination
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ========================================
  // DATA FETCHING
  // ========================================
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionService.getAll({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
        categoryId: selectedPartKey || undefined,
        difficultyId: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortField || undefined,
        sortOrder: sortOrder || undefined,
        questionType: questionTypeFilter !== 'all' ? questionTypeFilter : undefined,
        createFrom: createFrom || undefined,
        createTo: createTo || undefined,
      });

      setQuestions(res.items || []);
      setPagination({
        current: res.meta?.page || pagination.current,
        pageSize: res.meta?.pageSize || pagination.pageSize,
        total: res.meta?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      message.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };


  const loadData = async () => {
    try {
      setLoading(true);
      const res = await categorieservice.getSelectCategory();

      const difficultiesData = res
        .filter((x: any) => x.label.includes("(LEVEL)"))
        .map((x: any) => ({
          id: x.value,
          name: x.label.replace(" (LEVEL)", ""),
        }));

      setDifficulties(difficultiesData);
    } catch (err) {
      console.error("Load data failed:", err);
      toast.error("Không thể tải dữ liệu danh mục");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    fetchQuestions();
    loadData();
  }, [
    pagination.current,
    pagination.pageSize,
    selectedPartKey,
    difficultyFilter,
    statusFilter,
    sortField,
    sortOrder,
  ]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  // Handle category tree selection
  const handleSelectTree = (keys: any, info: any) => {
    if (keys.length > 0) {
      setSelectedPartKey(keys[0]);
      setSelectedPartTitle(info.node.title || "Danh mục");
      setPagination(prev => ({ ...prev, current: 1 }));
    } else {
      setSelectedPartKey(null);
      setSelectedPartTitle("Tổng quan");
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    // Trigger fetch via useEffect dependency
  };

  // Handle apply filters
  const handleFilter = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestions();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setDifficultyFilter('all');
    setStatusFilter('all');
    setQuestionTypeFilter('all');
    setSearchText('');
    setCreateFrom(null);
    setCreateTo(null);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle table change (pagination, sorter)
  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));

    // Xử lý sắp xếp
    if (sorter.field && sorter.order) {
      // Map Ant Design sorter field sang field của backend
      const fieldMap: Record<string, string> = {
        id: 'id',
        content: 'content',
        difficultyName: 'difficulty',
        createAt: 'createdAt',
      };

      const sortField = fieldMap[sorter.field] || sorter.field;
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';

      setSortField(sortField);
      setSortOrder(sortOrder);
    } else {
      // Reset về mặc định
      setSortField('createdAt');
      setSortOrder('desc');
    }
  };


  const handleView = async (record: any) => {
    try {
      setHighlightQuestionId(undefined);

      let data: any = null;

      if (record.groupId) {
        data = await questionService.getGroupQuestion(record.groupId);
        if (!data) throw new Error("Group not found");
        setHighlightQuestionId(record.id);
      } else {
        data = await questionService.getSingleQuestion(record.id);
        if (!data) throw new Error("Single not found");
      }

      setPreviewQuestion(data);
      setPreviewVisible(true);
    } catch (error) {
      console.error("handleView error:", error);
      setPreviewVisible(false);
    }
  };



  const handleEdit = async (record: any) => {
    try {
      message.loading({ content: 'Đang tải dữ liệu...', key: 'edit_load' });

      if (record.groupId) {
        // Lấy nhóm bằng groupId (không lấy bằng record.id!)
        const groupData = await questionService.getGroupQuestion(record.groupId);
        if (!groupData) {
          message.error('Không tải được nhóm để sửa');
          return;
        }
        setEditingQuestion({ type: 'group', data: groupData });
      } else {
        const singleData = await questionService.getSingleQuestion(record.id);
        if (!singleData) {
          message.error('Không tải được câu hỏi đơn để sửa');
          return;
        }
        setEditingQuestion({ type: 'single', data: singleData });
      }

      setOpenAddQuestion(true);
      message.success({ content: 'Đã tải dữ liệu xong', key: 'edit_load' });
    } catch (error) {
      console.error("handleEdit error:", error);
      message.error({ content: 'Lỗi khi tải câu hỏi', key: 'edit_load' });
    }
  };



  // Handle delete question
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa câu hỏi "${record.content}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await questionService.delete(record.id);
          toast.success('Đã xóa câu hỏi thành công');
          fetchQuestions();
        } catch (error) {
          toast.error('Không thể xóa câu hỏi');
        }
      }
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      message.loading({ content: 'Đang xuất dữ liệu...', key: 'export' });
      // await questionService.export({
      //   categoryId: selectedPartKey || undefined,
      //   difficultyId: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      // });
      message.success({ content: 'Xuất dữ liệu thành công', key: 'export' });
    } catch (error) {
      message.error({ content: 'Xuất dữ liệu thất bại', key: 'export' });
    }
  };

  // Handle import
  const handleOpenModalImport = () => {
    setOpenImportModal(true);
  };


  const handleSubmitImport = async () => {
    if (!zipFile || !previewData) {
      message.error("Không có file ZIP để import");
      return;
    }

    // Prevent double-submit
    if (importLoading) return;

    setImportLoading(true);
    const msgKey = 'import_' + Date.now();
    message.loading({ content: 'Đang import dữ liệu...', key: msgKey, duration: 0 });

    try {
      const response = await ImportQuestionService.importFileQuestion(zipFile);

      message.success({
        content: `Import thành công! ${response?.message || 'Câu hỏi đã được thêm vào hệ thống'}`,
        key: msgKey,
        duration: 3
      });

      // ✅ Reset import modals
      setOpenPreview(false);
      setPreviewData(null);
      setZipFile(null);
      setOpenImportModal(false);

      // ✅ Reload table after small delay to ensure data is saved
      setTimeout(() => {
        fetchQuestions();
      }, 500);

    } catch (error: any) {
      console.error('❌ Import error:', error);

      const errorMsg = error?.response?.data?.message
        || error?.message
        || 'Import thất bại, vui lòng kiểm tra lại file';

      message.error({
        content: errorMsg,
        key: msgKey,
        duration: 5
      });
    } finally {
      setImportLoading(false);
    }
  };



  //debug 


  // ========================================
  // TABLE COLUMNS
  // ========================================
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: true,
      ellipsis: true,
      sortDirections: ['ascend', 'descend'] as SortOrder[],
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="question-id">{text.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      sorter: true,
      sortDirections: ['ascend', 'descend'] as SortOrder[],
      render: (text: string, record: any) => (
        <div className="question-content">
          <div
            className="content-text"
            dangerouslySetInnerHTML={{ __html: text?.substring(0, 100) || 'N/A' }}
          />
          <div className="question-tags">
            {record.categoryName && <Tag color="blue">{record.categoryName}</Tag>}
            {record.tags?.map((tag: string, idx: number) => (
              <Tag key={idx} color="green">{tag}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficultyName',
      key: 'difficultyName',
      width: 120,
      sorter: true,
      sortDirections: ['ascend', 'descend'] as SortOrder[],
      render: (text: string, record: any) => {
        const colorMap: any = {
          'Easy': 'green',
          'Medium': 'orange',
          'Hard': 'red',
          'Dễ': 'green',
          'Trung bình': 'orange',
          'Khó': 'red'
        };
        const color = colorMap[text] || 'default';
        return <Tag color={color}>{text || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Loại',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 120,
      render: (text: string) => {
        const typeMap: any = {
          'SingleChoice': 'Một đáp án',
          'MultipleChoice': 'Nhiều đáp án',
          'TrueFalse': 'Đúng/Sai',
          'FillInTheBlank': 'Điền khuyết',
        };
        return <Tag>{typeMap[text] || text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Badge
          color={isActive ? 'green' : 'gray'}
          text={isActive ? 'Hoạt động' : 'Không hoạt động'}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 140,
      sorter: true,
      sortDirections: ['ascend', 'descend'] as SortOrder[],
      render: (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ========================================
  // MORE MENU
  // ========================================
  const moreMenu = (
    <Menu>
      <Menu.Item key="1" icon={<DownloadOutlined />} onClick={handleExport}>
        Xuất Excel
      </Menu.Item>
      <Menu.Item key="2" icon={<UploadOutlined />} onClick={handleOpenModalImport}>
        Import từ Excel
      </Menu.Item>
      <Menu.Item key="3" icon={<SyncOutlined />} onClick={fetchQuestions}>
        Làm mới
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<SettingOutlined />}>
        Cài đặt nâng cao
      </Menu.Item>
    </Menu>
  );

  // ========================================
  // RENDER
  // ========================================
  return (
    <Layout className="question-manager-layout">
      {/* Header */}
      <CrudHeader
        title="Quản lý Ngân hàng câu hỏi"
        subtitle="Thêm, sửa, xóa và quản lý câu hỏi TOEIC/IELTS"
        onRefresh={() => fetchQuestions()}
        onCreate={() => setOpenAddQuestion(true)}
        extra={<Button
          icon={<CloudUploadOutlined />}
          onClick={handleOpenModalImport}
        >
          Import Excel
        </Button>}
      />

      {/* Search & Filter Section */}
      <div className="search-filter-section">
        <div className="search__filter__container">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={8}>
              <Search
                placeholder="Tìm kiếm câu hỏi..."
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                style={{ width: "100%" }}
                placeholder="Chọn độ khó"
              >
                <Option value="all">Tất cả độ khó</Option>
                {difficulties.map((difficulty) => (
                  <Option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Lọc theo trạng thái"
                size="large"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Col>

            {/* Thêm Date Range Picker */}
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                size="large"
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates) {
                    setCreateFrom(dates[0]?.format('YYYY-MM-DD') || null);
                    setCreateTo(dates[1]?.format('YYYY-MM-DD') || null);
                  } else {
                    setCreateFrom(null);
                    setCreateTo(null);
                  }
                }}
              />
            </Col>
          </Row>
          <div className="filter-actions">
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleFilter}
              >
                Áp dụng bộ lọc
              </Button>
              <Button onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <Layout className="question__mangaer__content">
        {/* Sidebar - Category Tree */}
        <Sider
          width={300}
          theme="light"
          className="category-sidebar"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <CategorySidebar onSelect={handleSelectTree} />
        </Sider>

        {/* Right Content - Questions Table */}
        <Layout className="right-content">
          <div className="questions-table-section">
            <div className="question__table__container">
              <Card
                title={
                  <Space>
                    <span>Danh sách câu hỏi: {selectedPartTitle}</span>
                    {selectedPartKey && (
                      <Tag color="blue">{questions.length} câu hỏi</Tag>
                    )}
                  </Space>
                }
                extra={
                  <Space>
                    <Dropdown overlay={moreMenu} placement="bottomRight">
                      <Button icon={<MoreOutlined />} />
                    </Dropdown>
                  </Space>
                }
              >
                <Table
                  columns={columns}
                  dataSource={questions}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} câu hỏi`,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  onChange={handleTableChange}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: selectedPartKey
                      ? 'Chưa có câu hỏi nào trong danh mục này'
                      : 'Vui lòng chọn danh mục để xem câu hỏi'
                  }}
                />
              </Card>
            </div>
          </div>
        </Layout>
      </Layout>

      {/* Add/Edit Question Modal */}
      <AddQuestionModal
        open={openAddQuestion}
        editingQuestion={editingQuestion}
        initialCategoryId={
          editingQuestion
            ? editingQuestion.data.categoryId
            : selectedPartKey
        }
        onClose={() => {
          setOpenAddQuestion(false);
          setEditingQuestion(null);
        }}
        onSubmitSuccess={(id) => {
          message.success(editingQuestion ? "Cập nhật câu hỏi thành công" : "Thêm câu hỏi thành công");
          setOpenAddQuestion(false);
          setEditingQuestion(null);
          fetchQuestions();
        }}
      />
      {/* Detail Modal thông minh */}
      {previewVisible && previewQuestion && (
        <QuestionDetailModal
          open={previewVisible}
          question={previewQuestion}
          highlightQuestionId={highlightQuestionId}
          onClose={() => {
            setPreviewVisible(false);
            setPreviewQuestion(null);
            setHighlightQuestionId(undefined);
          }}
        />
      )}

      {/* import modal */}
      {/* Upload modal */}
      <UploadQuestionModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onNext={(file, data) => {
          setZipFile(file);
          setOpenImportModal(false);
          setPreviewData(data);
          setOpenPreview(true);
        }}
      />

      {/* Preview modal */}
      {previewData && (
        <Spin spinning={importLoading} tip="Đang import...">
          <PreviewImportModal
            open={openPreview}
            data={previewData}
            onClose={() => {
              setOpenPreview(false);
              setPreviewData(null);
              setZipFile(null);
            }}
            onImport={handleSubmitImport}
            loading={importLoading}
          />
        </Spin>
      )}

    </Layout>
  );
};

export default QuestionManager;