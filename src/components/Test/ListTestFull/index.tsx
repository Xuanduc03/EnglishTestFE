import React, { useState, useEffect } from 'react';
import './ListTestFull.scss';
import { api } from '../../../configs/axios-custom';
import { examAttemptService } from '../services/examAttemptApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { CompletedAttemptDto } from '../../../pages/Student/FullTest/examAttempt.types';

// ── Types ─────────────────────────────────────────────────────
interface Test {
  id: string;
  title: string;
  type: 'free' | 'new' | 'premium';
  totalScore: number;
  userScore?: number;
  questionCount: number;
  activeUserCount: number;
  hasExplanation: boolean;
  status: 'not-started' | 'in-progress' | 'completed';
  progress?: number;
}

interface ExamSummaryDto {
  id: string;
  code: string;
  title: string;
  description?: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  activeUserCount: number;
  status: string;
  version: number;
  createdAt: string;
}

interface TestCardProps {
  test: Test;
  onStartTest: (testId: string) => void;
  onContinueTest: (testId: string) => void;
  onRetryTest: (testId: string) => void;
}

// ── TestCard ───────────────────────────────────────────────────
const TestCard: React.FC<TestCardProps> = ({ test, onStartTest, onContinueTest, onRetryTest }) => {
  const getBadgeText = () => {
    switch (test.type) {
      case 'free': return 'Free';
      case 'new': return 'New';
      case 'premium': return 'Premium';
      default: return 'Free';
    }
  };

  const getButtonText = () => {
    switch (test.status) {
      case 'not-started': return 'Làm ngay';
      case 'in-progress': return 'Tiếp tục';
      case 'completed': return 'Thử lại';
      default: return 'Làm ngay';
    }
  };

  const handleButtonClick = () => {
    switch (test.status) {
      case 'not-started': onStartTest(test.id); break;
      case 'in-progress': onContinueTest(test.id); break;
      case 'completed':   onRetryTest(test.id); break;
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
        <p className="score-text">Điểm của bạn</p>
        <p className="score-value">{test.userScore}/{test.totalScore}</p>
      </div>
    );
  };

  return (
    <div className={`test-card ${test.type}`}>
      <div className={`card-badge ${test.type}`}>{getBadgeText()}</div>
      <div className="card-content">
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
            <span className="info-icon">💡</span>
            <span className="info-text">{test.hasExplanation ? 'Free explanation' : 'No explanation'}</span>
          </div>
        </div>
        <button className="action-button" onClick={handleButtonClick}>
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

// ── HistoryCard ────────────────────────────────────────────────
interface HistoryCardProps {
  attempt: CompletedAttemptDto;
  onViewResult: (attemptId: string) => void;
  onRetry: (examId: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ attempt, onViewResult, onRetry }) => {
  const scorePercent = Math.round(attempt.scorePercent);
  const getScoreColor = () => {
    if (scorePercent >= 80) return '#52c41a';
    if (scorePercent >= 60) return '#1677ff';
    if (scorePercent >= 40) return '#faad14';
    return '#ff4d4f';
  };

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
      {/* Header */}
      <div className="history-card__header">
        <div className="history-card__title-group">
          <h3 className="history-card__title">{attempt.examTitle}</h3>
          <span className="history-card__date">🗓 {formatDate(attempt.submittedAt)}</span>
        </div>
        <div className="history-card__score-badge" style={{ color: getScoreColor(), borderColor: getScoreColor() }}>
          <span className="score-num">{attempt.totalScore}</span>
          <span className="score-max">/{attempt.maxScore}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="history-card__progress">
        <div className="progress-meta">
          <span className="progress-label">Tỉ lệ đúng</span>
          <span className="progress-pct" style={{ color: getScoreColor() }}>{scorePercent}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${scorePercent}%`, background: getScoreColor() }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="history-card__stats">
        <div className="stat-chip correct">
          <span className="stat-icon">✅</span>
          <span>{attempt.correctAnswers} đúng</span>
        </div>
        <div className="stat-chip wrong">
          <span className="stat-icon">❌</span>
          <span>{attempt.totalQuestions - attempt.correctAnswers} sai</span>
        </div>
        <div className="stat-chip total">
          <span className="stat-icon">📝</span>
          <span>{attempt.totalQuestions} câu</span>
        </div>
      </div>

      {/* Actions */}
      <div className="history-card__actions">
        <button className="hc-btn hc-btn--primary" onClick={() => onViewResult(attempt.attemptId)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Xem kết quả
        </button>
        <button className="hc-btn hc-btn--secondary" onClick={() => onRetry(attempt.examId)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Làm lại
        </button>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────
type ActiveTab = 'list' | 'history';

const ListTestFull: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'new' | 'premium'>('all');

  const [history, setHistory] = useState<CompletedAttemptDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Filter
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || test.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // ── Fetch exam list ──────────────────────────────────────────
  const fetchFullTests = async (): Promise<Test[]> => {
    const response = await api.get<ExamSummaryDto[]>('/api/exams/full-tests');
    return response.data.map((exam) => {
      const isPremium = exam.code?.toLowerCase().includes('premium') || false;
      const isNew = new Date(exam.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let type: 'free' | 'new' | 'premium' = 'free';
      if (isPremium) type = 'premium';
      else if (isNew) type = 'new';
      return {
        id: exam.id,
        title: exam.title,
        type,
        totalScore: exam.totalScore,
        userScore: undefined,
        questionCount: exam.questionCount,
        activeUserCount: exam.activeUserCount,
        hasExplanation: true,
        status: 'not-started',
      };
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setTests(await fetchFullTests());
      } catch {
        setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Fetch completed history ──────────────────────────────────
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const data = await examAttemptService.getCompletedAttempts();
      setHistory(data);
    } catch {
      setHistoryError('Không thể tải lịch sử làm bài. Vui lòng thử lại sau.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history khi chuyển sang tab lịch sử
  useEffect(() => {
    if (activeTab === 'history' && history.length === 0 && !historyLoading) {
      fetchHistory();
    }
  }, [activeTab]);

  // ── Handlers ────────────────────────────────────────────────
  const handleStartTest = async (testId: string) => {
    try {
      const attempt = await examAttemptService.startExam({ examId: testId });
      navigate(`/full-test/${attempt.attemptId}`, { state: { examData: attempt } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể bắt đầu bài thi');
    }
  };

  const handleContinueTest = async (testId: string) => {
    console.log('Continuing test:', testId);
  };

  const handleRetryTest = async (testId: string) => {
    try {
      const attempt = await examAttemptService.startExam({ examId: testId });
      navigate(`/full-test/${attempt.attemptId}`, { state: { examData: attempt } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể bắt đầu bài thi');
    }
  };

  const handleViewResult = (attemptId: string) => {
    navigate(`/full-test/result`, { state: { attemptId } });
  };

  const handleRetry = async (examId: string) => {
    try {
      const newAttempt = await examAttemptService.startExam({ examId });
      navigate(`/full-test/${newAttempt.attemptId}`, { state: { examData: newAttempt } });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể bắt đầu bài thi');
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <section className="tests-section">
      <div className="tests-container">
        {/* Section Header */}
        <div className="section-header">
          <h1 className="section-title">📚 Đề Thi TOEIC</h1>
          <p className="section-subtitle">Luyện tập với các đề thi TOEIC mới nhất và hoàn toàn miễn phí</p>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <span className="tab-icon">📋</span>
            Danh Sách Đề Thi
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">🏆</span>
            Lịch Sử Làm Bài
          </button>
        </div>

        {/* ══ TAB 1: DANH SÁCH ĐỀ THI ══ */}
        {activeTab === 'list' && (
          <>
            {loading && (
              <div className="tests-loading">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="test-card-skeleton" />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="tests-empty">
                <div className="empty-icon">⚠️</div>
                <h3 className="empty-title">Đã xảy ra lỗi</h3>
                <p className="empty-description">{error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">Thử lại</button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Search & Filter */}
                <div className="search-filter-bar">
                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Tìm kiếm đề thi theo tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                  </div>
                  <div className="filter-pills">
                    {(['all', 'free', 'new', 'premium'] as const).map((f) => (
                      <button
                        key={f}
                        className={`filter-pill ${f} ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                      >
                        {f === 'all' ? 'Tất cả' : f === 'free' ? 'Miễn phí' : f === 'new' ? 'Mới' : 'Premium'}
                      </button>
                    ))}
                  </div>
                  <p className="result-count">{filteredTests.length} / {tests.length} đề thi</p>
                </div>

                {filteredTests.length === 0 ? (
                  <div className="tests-empty">
                    <div className="empty-icon">🔎</div>
                    <h3 className="empty-title">Không tìm thấy đề thi</h3>
                    <p className="empty-description">
                      Không có đề thi nào khớp với từ khóa <strong>"{searchQuery}"</strong>
                      {activeFilter !== 'all' && ` trong nhóm "${activeFilter}"`}.
                    </p>
                    <button className="retry-button" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                      Xóa bộ lọc
                    </button>
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

        {/* ══ TAB 2: LỊCH SỬ LÀM BÀI ══ */}
        {activeTab === 'history' && (
          <>
            {historyLoading && (
              <div className="tests-loading">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="test-card-skeleton history-skeleton" />
                ))}
              </div>
            )}

            {historyError && !historyLoading && (
              <div className="tests-empty">
                <div className="empty-icon">⚠️</div>
                <h3 className="empty-title">Đã xảy ra lỗi</h3>
                <p className="empty-description">{historyError}</p>
                <button onClick={fetchHistory} className="retry-button">Thử lại</button>
              </div>
            )}

            {!historyLoading && !historyError && history.length === 0 && (
              <div className="tests-empty">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">Chưa có lịch sử làm bài</h3>
                <p className="empty-description">
                  Bạn chưa hoàn thành đề thi nào. Hãy thử làm một đề thi để xem kết quả ở đây!
                </p>
                <button className="retry-button" onClick={() => setActiveTab('list')}>
                  Xem danh sách đề thi
                </button>
              </div>
            )}

            {!historyLoading && !historyError && history.length > 0 && (
              <>
                <div className="history-summary-bar">
                  <span className="history-count">
                    🎯 Bạn đã hoàn thành <strong>{history.length}</strong> bài thi
                  </span>
                  <button className="refresh-btn" onClick={fetchHistory} title="Tải lại">
                    🔄 Làm mới
                  </button>
                </div>
                <div className="history-grid">
                  {history.map((attempt) => (
                    <HistoryCard
                      key={attempt.attemptId}
                      attempt={attempt}
                      onViewResult={handleViewResult}
                      onRetry={handleRetry}
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