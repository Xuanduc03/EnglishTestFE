import React, { useState, useEffect } from 'react';
import './ListTestFull.scss';
import { api } from '../../../configs/axios-custom';
import { examAttemptService } from '../services/examAttemptApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { CompletedAttemptDto, ExamHistoryItem } from '../../../pages/Student/FullTest/examAttempt.types';
import { ieltsAttemptService } from '../services/IELTS/ieltsAttemp.services';

export const ExamType = {
  TOEIC: 1,
  IELTS: 2,
  TOEFL: 3,
  SAT: 4,
  Other: 99
} as const;


export type ExamType = typeof ExamType[keyof typeof ExamType];
// ── Types 
interface ExamSummaryDto {
  id: string;
  code: string;
  title: string;
  description?: string;
  duration: number;
  timeLimitSeconds?: number;
  totalScore: number;
  questionCount: number;
  activeUserCount: number;
  status: number;
  type: ExamType;
  version: number;
  createdAt: string;
}

interface Test {
  id: string;
  title: string;
  typeBadge: 'free' | 'new' | 'premium';
  examType: ExamType;
  totalScore: number;
  userScore?: number;
  questionCount: number;
  activeUserCount: number;
  hasExplanation: boolean;
  status: 'not-started' | 'in-progress' | 'completed';
  duration: number; // display minutes
}

interface TestCardProps {
  test: Test;
  onStartTest: (testId: string, examType: ExamType) => void;
  onContinueTest: (testId: string, examType: ExamType) => void;
  onRetryTest: (testId: string, examType: ExamType) => void;
}

// ── TestCard ───────────────────────────────────────────────────
const TestCard: React.FC<TestCardProps> = ({ test, onStartTest, onContinueTest, onRetryTest }) => {
  const getBadgeText = () => {
    switch (test.typeBadge) {
      case 'free': return 'Free';
      case 'new': return 'New';
      case 'premium': return 'Premium';
      default: return 'Free';
    }
  };

  const getButtonText = () => {
    switch (test.status) {
      case 'not-started': return 'Start Now';
      case 'in-progress': return 'Continue';
      case 'completed': return 'Retry';
      default: return 'Start Now';
    }
  };

  const handleButtonClick = () => {
    switch (test.status) {
      case 'not-started': onStartTest(test.id, test.examType); break;
      case 'in-progress': onContinueTest(test.id, test.examType); break;
      case 'completed': onRetryTest(test.id, test.examType); break;
    }
  };

  const getScoreDisplay = () => {
    if (test.status === 'not-started') {
      return (
        <div className="score-section">
          <p className="score-text no-score">Your Score</p>
        </div>
      );
    }
    return (
      <div className="score-section">
        <p className="score-text">Your Score</p>
        <p className="score-value">{test.userScore}/{test.totalScore}</p>
      </div>
    );
  };

  return (
    <div className={`test-card ${test.typeBadge}`}>
      <div className="card-badges-wrapper" style={{ display: 'flex', gap: '8px', position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
        <div className={`card-badge ${test.typeBadge}`} style={{ position: 'relative', top: 0, left: 0 }}>
          {getBadgeText()}
        </div>

        {/* Nhãn phân loại TOEIC / IELTS */}
        <div
          style={{
            backgroundColor: test.examType === ExamType.IELTS ? '#0050A0' : '#cf1322',
            color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center'
          }}
        >
          {test.examType === ExamType.IELTS ? 'IELTS' : 'TOEIC'}
        </div>
      </div>

      <div className="card-content" style={{ marginTop: '16px' }}>
        <h3 className="test-title">{test.title}</h3>
        {getScoreDisplay()}
        <div className="test-info">
          <div className="info-item">
            <span className="info-icon">❓</span>
            <span className="info-text">{test.questionCount} questions</span>
          </div>
          <div className="info-item">
            <span className="info-icon">👥</span>
            <span className="info-text">{test.activeUserCount.toLocaleString()} participants</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <span className="info-text">{test.duration} mins</span>
          </div>
        </div>
        <button className="action-button" onClick={handleButtonClick}>
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

// ── HistoryCard (Giữ nguyên) ───────────────────────────────────
interface HistoryCardProps {
  attempt: ExamHistoryItem;
  onViewResult: (attemptId: string, isIelts: boolean) => void;
  onRetry: (examId: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ attempt, onViewResult, onRetry }) => {
  const accuracy = attempt.accuracyPercent ?? 0;
  const scorePercent = Math.round(accuracy);
  const getScoreColor = () => {
    if (scorePercent >= 80) return '#52c41a';
    if (scorePercent >= 60) return '#1677ff';
    if (scorePercent >= 40) return '#faad14';
    return '#ff4d4f';
  };
  const isIelts = attempt.examCode?.includes('IELTS') || attempt.examTitle?.includes('IELTS');
  const maxScore = isIelts ? '9.0' : '990';

  let currentScore: string | number = attempt.totalScore || 0;
  if (isIelts && attempt.totalScore != null) {
    currentScore = (attempt.totalScore / 10).toFixed(1); // IELTS lưu 85 -> hiển thị 8.5
  } else if (attempt.status === 'InProgress' || attempt.totalScore == null) {
    currentScore = '-'; // Chưa nộp bài thì hiện dấu gạch ngang
  }

  // 3. FIX SỐ CÂU SAI: Tổng câu - câu đúng (để gom cả số câu chưa làm vào)
  const wrongCount = (attempt.totalQuestions || 0) - (attempt.correctAnswers || 0);
  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="history-card">
      <div className="history-card__header">
        <div className="history-card__title-group">
          <h3 className="history-card__title">{attempt.examTitle}</h3>
          <span className="history-card__date">{formatDate(attempt.submittedAt || '')}</span>
        </div>
        <div className="history-card__score-badge" style={{ color: getScoreColor(), borderColor: getScoreColor() }}>
          <span className="score-num">{attempt.totalScore}</span>
          <span className="score-max">/{maxScore}</span>
        </div>
      </div>

      <div className="history-card__progress">
        <div className="progress-meta">
          <span className="progress-label">Accuracy</span>
          <span className="progress-pct" style={{ color: getScoreColor() }}>{scorePercent}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scorePercent}%`, background: getScoreColor() }} />
        </div>
      </div>

      <div className="history-card__stats">
        <div className="stat-chip correct"><span className="stat-icon">✅</span><span>{attempt.correctAnswers} correct</span></div>
        <div className="stat-chip wrong"><span className="stat-icon">❌</span><span>{attempt.totalQuestions - attempt.correctAnswers} wrong</span></div>
        <div className="stat-chip total"><span className="stat-icon">📝</span><span>{attempt.totalQuestions} items</span></div>
      </div>

      <div className="history-card__actions">
        <button className="hc-btn hc-btn--primary" onClick={() => onViewResult(attempt.attemptId, isIelts)}>Review Result</button>
        <button className="hc-btn hc-btn--secondary" onClick={() => onRetry(attempt.examId)}>Retry</button>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────
type ActiveTab = 'list' | 'history';
type FilterType = 'ALL' | typeof ExamType.TOEIC | typeof ExamType.IELTS;

const ListTestFull: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State Lọc theo Loại Kỳ Thi (TOEIC / IELTS / TẤT CẢ)
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const navigate = useNavigate();

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── 1. Fetch exam list CÓ TRUYỀN PARAM ?type= ──────────────────
  const fetchFullTests = async (filterType: FilterType) => {
    try {
      setLoading(true);
      setError(null);

      // Ghép param vào URL nếu có lọc
      const url = filterType === 'ALL'
        ? '/api/exams/full-tests'
        : `/api/exams/full-tests?type=${filterType}`;

      const response = await api.get<ExamSummaryDto[]>(url);

      const mappedData: Test[] = response.data.map((exam) => {
        const isPremium = exam.code?.toLowerCase().includes('premium') || false;
        const isNew = new Date(exam.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        let typeBadge: 'free' | 'new' | 'premium' = 'free';
        if (isPremium) typeBadge = 'premium';
        else if (isNew) typeBadge = 'new';

        // Prefer timeLimitSeconds from API (converts to minutes), fallback to duration
          const durationMins = exam.timeLimitSeconds
            ? Math.round(exam.timeLimitSeconds / 60)
            : exam.duration;

          return {
            id: exam.id,
            title: exam.title,
            typeBadge,
            examType: exam.type,
            totalScore: exam.totalScore,
            questionCount: exam.questionCount,
            activeUserCount: exam.activeUserCount,
            hasExplanation: true,
            status: 'not-started',
            duration: durationMins
          };
      });

      setTests(mappedData);
    } catch {
      setError('Could not load test list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API lại khi học viên bấm đổi bộ lọc TOEIC / IELTS
  useEffect(() => {
    fetchFullTests(activeFilter);
  }, [activeFilter]);

  // ── 2. Fetch completed history VÀ FIX LỖI THIẾU setHistory ─────
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);

      // Gọi API từ service
      const data = await examAttemptService.getHistory();

      setHistory(data.items || []);

    } catch {
      setHistoryError('Could not load exam history. Please try again later.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && history.length === 0 && !historyLoading) {
      fetchHistory();
    }
  }, [activeTab]);

  const handleStartTest = async (testId: string, examType: ExamType) => {
    try {
      if (examType === ExamType.IELTS) {
        const ieltsAttempt = await ieltsAttemptService.startExam({ examId: testId });
        navigate(`/ielts-test/${ieltsAttempt.attemptId}`, { state: { examData: ieltsAttempt } });
      } else {
        const toeicAttempt = await examAttemptService.startExam({ examId: testId });
        navigate(`/full-test/${toeicAttempt.attemptId}`, { state: { examData: toeicAttempt } });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cannot start the exam right now');
    }
  };

  const handleContinueTest = async (testId: string, examType: ExamType) => {
    toast.info("Continue feature is currently being updated!");
  };

  const handleRetryTest = async (testId: string, examType: ExamType) => {
    handleStartTest(testId, examType); // Tái sử dụng logic của StartTest
  };

  const handleViewResult = (attemptId: string, isIelts: boolean) => {
    if (isIelts) {
      navigate(`/ielts-test/review/${attemptId}`);
    } else {
      navigate(`/full-test/${attemptId}/review`);
    }
  };

  const handleRetryHistory = async (examId: string) => {
    toast.info("Please go back to the list tab to restart the test.");
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <section className="tests-section">
      <div className="tests-container">
        <div className="section-header">
          <h1 className="section-title">📚 Test Library</h1>
          <p className="section-subtitle">Practice with the latest certification exams completely free!</p>
        </div>

        <div className="tabs-nav">
          <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            <span className="tab-icon">📋</span> Test List
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <span className="tab-icon">🏆</span> History
          </button>
        </div>

        {activeTab === 'list' && (
          <>
            {loading ? (
              <div className="tests-loading">
                {[...Array(8)].map((_, i) => <div key={i} className="test-card-skeleton" />)}
              </div>
            ) : error ? (
              <div className="tests-empty">
                <div className="empty-icon">⚠️</div>
                <h3 className="empty-title">Oops! Error occurred</h3>
                <p className="empty-description">{error}</p>
                <button onClick={() => fetchFullTests(activeFilter)} className="retry-button">Retry</button>
              </div>
            ) : (
              <>
                <div className="search-filter-bar">
                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search for tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>}
                  </div>

                  {/* BỘ LỌC ĐÃ CẬP NHẬT LÊN API */}
                  <div className="filter-pills">
                    <button
                      className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('ALL')}
                    >All</button>
                    <button
                      className={`filter-pill ${activeFilter === ExamType.TOEIC ? 'active' : ''}`}
                      onClick={() => setActiveFilter(ExamType.TOEIC)}
                    >TOEIC</button>
                    <button
                      className={`filter-pill ${activeFilter === ExamType.IELTS ? 'active' : ''}`}
                      onClick={() => setActiveFilter(ExamType.IELTS)}
                    >IELTS</button>
                  </div>
                  <p className="result-count">{filteredTests.length} tests</p>
                </div>

                {filteredTests.length === 0 ? (
                  <div className="tests-empty">
                    <div className="empty-icon">🔎</div>
                    <h3 className="empty-title">No results found</h3>
                  </div>
                ) : (
                  <div className="tests-grid">
                    {filteredTests.map((test) => (
                      <TestCard
                        key={test.id}
                        test={test}
                        onStartTest={handleStartTest}
                        onContinueTest={handleContinueTest}
                        onRetryTest={handleRetryTest}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {historyLoading ? (
              <div className="tests-loading">
                {[...Array(4)].map((_, i) => <div key={i} className="test-card-skeleton history-skeleton" />)}
              </div>
            ) : historyError ? (
              <div className="tests-empty">
                <div className="empty-icon">⚠️</div>
                <h3 className="empty-title">Oops! Error occurred</h3>
                <p className="empty-description">{historyError}</p>
                <button onClick={fetchHistory} className="retry-button">Retry</button>
              </div>
            ) : history.length === 0 ? (
              <div className="tests-empty">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">No history found</h3>
                <button className="retry-button" onClick={() => setActiveTab('list')}>View Test List</button>
              </div>
            ) : (
              <>
                <div className="history-summary-bar">
                  <span className="history-count">🎯 You've completed <strong>{history.length}</strong> tests</span>
                  <button className="refresh-btn" onClick={fetchHistory} title="Refresh">🔄 Refresh</button>
                </div>
                <div className="history-grid">
                  {history.map((attempt) => (
                    <HistoryCard
                      key={attempt.attemptId}
                      attempt={attempt}
                      onViewResult={handleViewResult}
                      onRetry={handleRetryHistory}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ListTestFull;