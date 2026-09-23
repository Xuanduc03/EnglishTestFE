import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, InputNumber, Switch, message, Tabs, Form, Row, Col } from 'antd';
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

  const isTimed = Form.useWatch('isTimed', form);

  // ── Fetch ────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [resSkills, resInProgress, resHistoryResult] = await Promise.all([
          PracticeService.getByCodeType('SKILL', SKILL_PARENT_ID),
          PracticeService.getInProgressPractices().catch(() => []),
          PracticeService.getHistory({ page: 1, pageSize: 100 }).catch(() => ({
            items: [], totalCount: 0, pageIndex: 1, pageSize: 100,
            totalPages: 0, hasPrevious: false, hasNext: false,
          })),
        ]);

        const historyList: PracticeHistoryDto[] = resHistoryResult.items;

        const completed = historyList.filter(
          (h) => h.status === PracticeStatus.Submitted || h.status === PracticeStatus.TimedOut
        );
        const avgAccuracy = completed.length > 0
          ? Math.round(completed.reduce((s, h) => s + (h.accuracyPercentage ?? 0), 0) / completed.length)
          : 0;

        // Filter out IELTS, Speaking, and Writing skills
        const EXCLUDED = ['ielts', 'speaking', 'writing'];
        const filteredSkills = resSkills.filter(
          (s) => !EXCLUDED.some(kw => s.name.toLowerCase().includes(kw))
        );

        setSkills(filteredSkills);
        setInProgressItems(resInProgress);
        setHistoryItems(historyList);
        setOverallStats({ totalCompleted: completed.length, averageAccuracy: avgAccuracy, studyStreak: 0 });
        if (filteredSkills.length > 0) setActiveSkillId(filteredSkills[0].id);
      } catch {
        message.error('Failed to load practice data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ── Formatter ───────────────────────────────

  const roadmapItems = useMemo((): PracticeItem[] => {
    const activeSkill = skills.find((s) => s.id === activeSkillId);
    if (!activeSkill?.children?.length) return [];
    const qEst: Record<number, number> = { 1:6, 2:25, 3:39, 4:30, 5:30, 6:16, 7:54 };
    const tEst: Record<number, string> = { 1:'3 mins', 2:'12 mins', 3:'20 mins', 4:'15 mins', 5:'15 mins', 6:'16 mins', 7:'40 mins' };
    return activeSkill.children.map((part) => {
      const pn = parseInt(part.name.replace(/\D/g, '')) || 0;
      const ip = inProgressItems.find((x) =>
        x.categoryId === part.id ||
        x.categoryName?.toLowerCase() === part.name?.toLowerCase()
      );
      const sid = ip ? (ip.attemptId ?? ip.sessionId ?? ip.id) : undefined;
      return {
        id: part.id, title: part.name, partId: part.id,
        subtitle: ip ? `In Progress: ${ip.title || ''}` : `${activeSkill.name} • ${part.code}`,
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
      const sid = item.attemptId ?? item.sessionId ?? item.id ?? '';
      const lastUpdated = item.lastUpdated ?? item.lastAccessedAt;
      const timeLimit = item.timeLimitSeconds > 0
        ? `${Math.floor(item.timeLimitSeconds / 60)} phút`
        : undefined;
      return {
        id: sid,
        sessionId: sid,
        title: item.title || 'In Progress Practice',
        subtitle: lastUpdated
          ? `Last Updated: ${new Date(lastUpdated).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
          : item.startedAt
          ? `Started: ${new Date(item.startedAt).toLocaleDateString('en-US')}`
          : '',
        correctRate: Math.round(item.progress ?? 0),
        questionCount: item.totalQuestions || 0,
        participants: 0,
        status: 'in-progress' as const,
        timeEstimate: timeLimit,
      };
    })
  , [inProgressItems]);

  const historyFormatted = useMemo((): PracticeItem[] =>
    historyItems.map((item): PracticeItem => {
      const statusLabel =
        item.status === PracticeStatus.Abandoned ? ' · Abandoned' :
        item.status === PracticeStatus.TimedOut  ? ' · Time Out'  : '';

      const dateStr = item.submittedAt
        ? `Completed: ${new Date(item.submittedAt).toLocaleDateString('en-US', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}${statusLabel}`
        : `Started: ${new Date(item.startedAt).toLocaleDateString('en-US')}${statusLabel}`;

      return {
        id: item.sessionId,
        sessionId: item.sessionId,
        title: item.title || 'Practice',
        subtitle: dateStr,
        correctRate: Math.round(item.accuracyPercentage ?? 0),
        questionCount: item.totalQuestions || 0,
        participants: 0,
        status: item.status === PracticeStatus.InProgress ? 'in-progress' : 'completed',
        difficulty: 'medium',
        timeEstimate: `${item.totalQuestions} questions`,
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
      message.success('Practice session created!');
      navigate(`/practice/session/${session.sessionId}`);
    } catch (error: any) {
      if (!error.errorFields)
        message.error(error?.response?.data?.message || 'Failed to create practice session');
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
      key: 'roadmap', label: 'Skill Roadmap',
      children: (
        <Tabs activeKey={activeSkillId} onChange={setActiveSkillId}
          items={roadmapTabItems} tabPosition="left" className="custom-practice-tabs-left" />
      ),
    },
    {
      key: 'in-progress',
      label: `In Progress (${inProgressItems.length})`,
      children: (
        <PracticeList tests={inProgressFormatted} loading={loading}
          onContinueTest={handleContinueTest}
          emptyMessage="You have no in-progress practice sessions." />
      ),
    },
    {
      key: 'history',
      label: `History (${historyItems.length})`,
      children: (
        <PracticeList tests={historyFormatted} loading={loading}
          onStartTest={handleStartTestClick} onViewResult={handleViewResult}
          emptyMessage="You have not completed any practice sessions." />
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────
  return (
    <div className="practice-dashboard">
      
      {/* ── Custom Hero Header ── */}
      <div className="practice-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Practice Hub
          </div>
          <h1 className="hero-title">Master your skills every day</h1>
          <p className="hero-description">
            Track your practice progress and improve your TOEIC score through dedicated section exercises.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <span style={{ fontSize: 24 }}>🏆</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{overallStats.totalCompleted}</span>
              <span className="stat-label">Completed Sessions</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <span style={{ fontSize: 24 }}>🎯</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{overallStats.averageAccuracy}%</span>
              <span className="stat-label">Average Accuracy</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <span style={{ fontSize: 24 }}>🔥</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{overallStats.studyStreak}</span>
              <span className="stat-label">Study Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Container ── */}
      <div className="practice-content-wrapper">
        <Tabs items={mainTabItems} size="large" className="custom-practice-tabs" />
      </div>

      <Modal
        title="Practice Configuration"
        open={configModalVisible} onOk={handleConfirmStart}
        onCancel={() => setConfigModalVisible(false)}
        okText="Start" cancelText="Cancel"
        confirmLoading={loading} destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="Number of Questions" name="questionsPerPart"
            rules={[{ required: true, message: 'Please enter number of questions' }]}>
            <InputNumber min={5} max={50} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: isTimed ? 16 : 0 }}>
            <Row align="middle" gutter={8}>
              <Col>
                <Form.Item name="isTimed" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Col>
              <Col><span>Time limit</span></Col>
            </Row>
          </Form.Item>

          {isTimed && (
            <Form.Item label="Time (minutes)" name="timeLimitMinutes"
              rules={[{ required: true, message: 'Please enter time' }]}>
              <InputNumber min={5} max={120} style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}