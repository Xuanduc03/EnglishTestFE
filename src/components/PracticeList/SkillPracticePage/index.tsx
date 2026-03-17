import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, InputNumber, Switch, message, Tabs, Form, Row, Col, Card, Statistic, Progress } from 'antd';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import type { CategoryDto } from '../../../pages/Admin/Categories/category.config';
import { PracticeService } from '../../Practice/Services/practice.service';
import type { CreatePracticeRequest, PracticeHistoryDto } from '../../Practice/Types/practice.type';
import { PracticeStatus } from '../../Practice/Types/practice.type';
import PracticeList from '..';
import type { PracticeItem } from '..';
import './SkillList.scss';

export const SKILL_PARENT_ID = '9bcaa771-ca9e-45dd-9405-910e6a068631';

interface PracticeConfigForm {
  questionsPerPart: number;
  isTimed: boolean;
  timeLimitMinutes: number;
}

export default function SkillTabsWithParts() {
  const navigate = useNavigate();
  const [form] = Form.useForm<PracticeConfigForm>();

  const [skills, setSkills] = useState<CategoryDto[]>([]);
  const [activeSkillId, setActiveSkillId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [inProgressItems, setInProgressItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<PracticeHistoryDto[]>([]);
  const [overallStats, setOverallStats] = useState({ totalCompleted: 0, averageAccuracy: 0, studyStreak: 0 });
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // FIX: Form.useWatch thay vì state riêng isTimedEnabled
  const isTimed = Form.useWatch('isTimed', form);

  // ── Fetch ────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // FIX: bỏ getStatistics (endpoint không tồn tại), tính stats từ history
        const [resSkills, resInProgress, resHistoryResult] = await Promise.all([
          PracticeService.getByCodeType('SKILL', SKILL_PARENT_ID),
          PracticeService.getInProgressPractices().catch(() => []),
          PracticeService.getHistory({ page: 1, pageSize: 100 }).catch(() => ({
            items: [], totalCount: 0, pageIndex: 1, pageSize: 100,
            totalPages: 0, hasPrevious: false, hasNext: false,
          })),
        ]);

        const historyList: PracticeHistoryDto[] = resHistoryResult.items;

        // FIX: status là số nguyên (1 = Submitted, 3 = TimedOut)
        const completed = historyList.filter(
          (h) => h.status === PracticeStatus.Submitted || h.status === PracticeStatus.TimedOut
        );
        const avgAccuracy = completed.length > 0
          ? Math.round(completed.reduce((s, h) => s + (h.accuracyPercentage ?? 0), 0) / completed.length)
          : 0;

        setSkills(resSkills);
        setInProgressItems(resInProgress);
        setHistoryItems(historyList);
        setOverallStats({ totalCompleted: completed.length, averageAccuracy: avgAccuracy, studyStreak: 0 });
        if (resSkills.length > 0) setActiveSkillId(resSkills[0].id);
      } catch {
        message.error('Không thể tải dữ liệu luyện tập');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ── useMemo formatters ───────────────────────────────

  const roadmapItems = useMemo((): PracticeItem[] => {
    const activeSkill = skills.find((s) => s.id === activeSkillId);
    if (!activeSkill?.children?.length) return [];
    const qEst: Record<number, number> = { 1:6, 2:25, 3:39, 4:30, 5:30, 6:16, 7:54 };
    const tEst: Record<number, string> = { 1:'3 phút', 2:'12 phút', 3:'20 phút', 4:'15 phút', 5:'15 phút', 6:'16 phút', 7:'40 phút' };
    return activeSkill.children.map((part) => {
      const pn = parseInt(part.name.replace(/\D/g, '')) || 0;
      // Backend trả categoryName, không có categoryId — match bằng tên part
      const ip = inProgressItems.find((x) =>
        x.categoryId === part.id ||
        x.categoryName?.toLowerCase() === part.name?.toLowerCase()
      );
      const sid = ip ? (ip.attemptId ?? ip.sessionId ?? ip.id) : undefined;
      return {
        id: part.id, title: part.name, partId: part.id,
        subtitle: ip ? `Đang làm dở: ${ip.title || ''}` : `${activeSkill.name} • ${part.code}`,
        // Backend trả progress trực tiếp
        correctRate: ip ? Math.round(ip.progress ?? 0) : 0,
        questionCount: qEst[pn] || 20, participants: 100 + pn * 50,
        status: ip ? 'in-progress' as const : 'not-started' as const,
        difficulty: 'medium' as const, timeEstimate: tEst[pn],
        sessionId: sid,
      };
    });
  }, [skills, activeSkillId, inProgressItems]);

  const inProgressFormatted = useMemo((): PracticeItem[] =>
    inProgressItems.map((item) => {
      // Backend trả AttemptId (không phải sessionId)
      const sid = item.attemptId ?? item.sessionId ?? item.id ?? '';
      const lastUpdated = item.lastUpdated ?? item.lastAccessedAt;
      const timeLimit = item.timeLimitSeconds > 0
        ? `${Math.floor(item.timeLimitSeconds / 60)} phút`
        : undefined;
      return {
        id: sid,
        sessionId: sid,
        title: item.title || 'Bài tập đang làm',
        subtitle: lastUpdated
          ? `Lần cuối: ${new Date(lastUpdated).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
          : item.startedAt
          ? `Bắt đầu: ${new Date(item.startedAt).toLocaleDateString('vi-VN')}`
          : '',
        // Backend trả Progress trực tiếp (0-100), không cần tính lại
        correctRate: Math.round(item.progress ?? 0),
        questionCount: item.totalQuestions || 0,
        participants: 0,
        status: 'in-progress' as const,
        timeEstimate: timeLimit,
      };
    })
  , [inProgressItems]);

  // FIX CHÍNH: status từ API là số (0/1/2/3), không phải string
  const historyFormatted = useMemo((): PracticeItem[] =>
    historyItems.map((item): PracticeItem => {
      const statusLabel =
        item.status === PracticeStatus.Abandoned ? ' · Đã bỏ dở' :
        item.status === PracticeStatus.TimedOut  ? ' · Hết giờ'  : '';

      const dateStr = item.submittedAt
        ? `Hoàn thành: ${new Date(item.submittedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}${statusLabel}`
        : `Bắt đầu: ${new Date(item.startedAt).toLocaleDateString('vi-VN')}${statusLabel}`;

      return {
        id: item.sessionId,
        sessionId: item.sessionId,
        title: item.title || 'Bài tập',
        subtitle: dateStr,
        correctRate: Math.round(item.accuracyPercentage ?? 0),
        questionCount: item.totalQuestions || 0,
        participants: 0,
        // status=1 (Submitted) hoặc 3 (TimedOut) → completed; status=0 → in-progress
        status: item.status === PracticeStatus.InProgress ? 'in-progress' : 'completed',
        difficulty: 'medium',
        timeEstimate: `${item.totalQuestions} câu`,
      };
    })
  , [historyItems]);

  // ── Handlers ─────────────────────────────────────────

  const handleStartTestClick = (partId: string | number) => {
    setSelectedPartId(partId as string);
    form.setFieldsValue({ questionsPerPart: 10, isTimed: false, timeLimitMinutes: 15 });
    setConfigModalVisible(true);
  };
  const handleContinueTest = (sessionId: string) => navigate(`/practice/session/${sessionId}`);
  const handleViewResult   = (sessionId: string) => navigate(`/practice/result/${sessionId}`);

  const handleConfirmStart = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedPartId) return;
      setLoading(true);
      const session = await PracticeService.startPractice({
        partIds: [selectedPartId],
        questionsPerPart: values.questionsPerPart,
        isTimed: values.isTimed,
        timeLimitMinutes: values.isTimed ? values.timeLimitMinutes : undefined,
      });
      message.success('Đã tạo bài luyện tập!');
      navigate(`/practice/session/${session.sessionId}`);
    } catch (error: any) {
      if (!error.errorFields)
        message.error(error?.response?.data?.message || 'Không thể tạo bài luyện tập');
    } finally {
      setLoading(false);
      setConfigModalVisible(false);
    }
  };

  // ── Tabs ─────────────────────────────────────────────

  const roadmapTabItems = skills.map((skill) => ({
    key: skill.id, label: skill.name,
    children: (
      <PracticeList
        activeSkill={skill} tests={roadmapItems} loading={loading}
        onStartTest={handleStartTestClick} onContinueTest={handleContinueTest}
      />
    ),
  }));

  const mainTabItems = [
    {
      key: 'roadmap', label: 'Lộ trình kỹ năng',
      children: (
        <Tabs activeKey={activeSkillId} onChange={setActiveSkillId}
          items={roadmapTabItems} tabPosition="left" />
      ),
    },
    {
      key: 'in-progress',
      label: `Đang làm dở (${inProgressItems.length})`,
      children: (
        <PracticeList tests={inProgressFormatted} loading={loading}
          onContinueTest={handleContinueTest}
          emptyMessage="Bạn không có bài luyện tập nào đang làm dở." />
      ),
    },
    {
      key: 'history',
      label: `Lịch sử đã làm (${historyItems.length})`,
      children: (
        <PracticeList tests={historyFormatted} loading={loading}
          onStartTest={handleStartTestClick} onViewResult={handleViewResult}
          emptyMessage="Bạn chưa hoàn thành bài luyện tập nào." />
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────
  return (
    <div className="practice-dashboard" style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="Tổng bài đã hoàn thành" value={overallStats.totalCompleted}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>Độ chính xác trung bình</span>
              <strong>{overallStats.averageAccuracy}%</strong>
            </div>
            <Progress percent={overallStats.averageAccuracy} strokeColor="#52c41a" status="active" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic title="Chuỗi ngày học (Streak)" value={overallStats.studyStreak}
              suffix="ngày" prefix={<FireOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs items={mainTabItems} size="large" />
      </Card>

      <Modal
        title="Cấu hình bài luyện tập"
        open={configModalVisible} onOk={handleConfirmStart}
        onCancel={() => setConfigModalVisible(false)}
        okText="Bắt đầu" cancelText="Hủy"
        confirmLoading={loading} destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="Số lượng câu hỏi" name="questionsPerPart"
            rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi' }]}>
            <InputNumber min={5} max={50} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: isTimed ? 16 : 0 }}>
            <Row align="middle" gutter={8}>
              <Col>
                <Form.Item name="isTimed" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Col>
              <Col><span>Giới hạn thời gian</span></Col>
            </Row>
          </Form.Item>

          {isTimed && (
            <Form.Item label="Thời gian (phút)" name="timeLimitMinutes"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}>
              <InputNumber min={5} max={120} style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}