import React, { useState, useEffect } from 'react';
import './ListTestFull.scss';
import { api } from '../../../configs/axios-custom'; // Import axios instance đã cấu hình

// Types (giữ nguyên)
interface Test {
  id: number;
  title: string;
  type: 'free' | 'new' | 'premium';
  totalScore: number;
  userScore?: number;
  questionCount: number;
  participantCount: number;
  hasExplanation: boolean;
  status: 'not-started' | 'in-progress' | 'completed';
  progress?: number;
}

// Interface cho response từ API (dựa trên ExamSummaryDto)
interface ExamSummaryDto {
  id: number;
  code: string;
  title: string;
  description?: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  status: string;      // "Published", "Draft", ...
  version: number;
  createdAt: string;
  // Nếu có thêm các trường khác (price, isPremium, ...) thì thêm vào đây
}

interface TestCardProps {
  test: Test;
  onStartTest: (testId: number) => void;
  onContinueTest: (testId: number) => void;
  onRetryTest: (testId: number) => void;
}

// Test Card Component (giữ nguyên)
const TestCard: React.FC<TestCardProps> = ({
  test,
  onStartTest,
  onContinueTest,
  onRetryTest
}) => {
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
      case 'not-started':
        onStartTest(test.id);
        break;
      case 'in-progress':
        onContinueTest(test.id);
        break;
      case 'completed':
        onRetryTest(test.id);
        break;
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
        <p className="score-value">
          {test.userScore}/{test.totalScore}
        </p>
      </div>
    );
  };

  return (
    <div className={`test-card ${test.type}`}>
      {/* Badge */}
      <div className={`card-badge ${test.type}`}>
        {getBadgeText()}
      </div>

      <div className="card-content">
        {/* Title */}
        <h3 className="test-title">{test.title}</h3>

        {/* Score Section */}
        {getScoreDisplay()}

        {/* Test Info */}
        <div className="test-info">
          <div className="info-item">
            <span className="info-icon">❓</span>
            <span className="info-text">{test.questionCount} questions</span>
          </div>
          <div className="info-item">
            <span className="info-icon">👥</span>
            <span className="info-text">{test.participantCount.toLocaleString()} participants</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💡</span>
            <span className="info-text">
              {test.hasExplanation ? 'Free explanation' : 'No explanation'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="action-button"
          onClick={handleButtonClick}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

// Main component
const ListTestFull: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API thực tế
  const fetchFullTests = async (): Promise<Test[]> => {
    try {
      // Gọi endpoint GET /api/exams/full-tests
      const response = await api.get<ExamSummaryDto[]>('/api/exams/full-tests');
      const examDtos = response.data;

      const mappedTests: Test[] = examDtos.map((exam) => {
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
          participantCount: 0, // chưa có dữ liệu thật
          hasExplanation: true, // giả sử luôn có giải thích
          status: 'not-started', // chưa có thông tin trạng thái của user
        };
      });

      return mappedTests;
    } catch (error) {
      console.error('Lỗi khi gọi API lấy danh sách đề thi:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const testsData = await fetchFullTests();
        setTests(testsData);
      } catch (err) {
        setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
        console.error('Error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  // Handlers (giữ nguyên, có thể thêm logic gọi API thật sau)
  const handleStartTest = async (testId: number) => {
    try {
      console.log('Starting test:', testId);
      // TODO: Gọi API start test
      // await api.post(`/exams/${testId}/start`);
      setTests(prev =>
        prev.map(test =>
          test.id === testId ? { ...test, status: 'in-progress' as const } : test
        )
      );
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleContinueTest = async (testId: number) => {
    try {
      console.log('Continuing test:', testId);
      // TODO: Gọi API continue test
      // await api.post(`/exams/${testId}/continue`);
    } catch (error) {
      console.error('Error continuing test:', error);
    }
  };

  const handleRetryTest = async (testId: number) => {
    try {
      console.log('Retrying test:', testId);
      // TODO: Gọi API retry test
      // await api.post(`/exams/${testId}/retry`);
      setTests(prev =>
        prev.map(test =>
          test.id === testId ? { ...test, status: 'in-progress' as const, userScore: undefined } : test
        )
      );
    } catch (error) {
      console.error('Error retrying test:', error);
    }
  };

  // Các trạng thái render (giữ nguyên)
  if (loading) {
    return (
      <section className="tests-section">
        <div className="tests-container">
          <div className="section-header">
            <h1 className="section-title">📚 Đề Thi TOEIC</h1>
            <p className="section-subtitle">
              Luyện tập với các đề thi TOEIC mới nhất và hoàn toàn miễn phí
            </p>
          </div>
          <div className="tests-loading">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="test-card-skeleton"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tests-section">
        <div className="tests-container">
          <div className="tests-empty">
            <div className="empty-icon">⚠️</div>
            <h3 className="empty-title">Đã xảy ra lỗi</h3>
            <p className="empty-description">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <section className="tests-section">
        <div className="tests-container">
          <div className="section-header">
            <h1 className="section-title">📚 Đề Thi TOEIC</h1>
            <p className="section-subtitle">
              Luyện tập với các đề thi TOEIC mới nhất và hoàn toàn miễn phí
            </p>
          </div>
          <div className="tests-empty">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">Chưa có đề thi nào</h3>
            <p className="empty-description">
              Các đề thi sẽ sớm được cập nhật. Vui lòng quay lại sau!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tests-section">
      <div className="tests-container">
        <div className="section-header">
          <h1 className="section-title">📚 Đề Thi TOEIC</h1>
          <p className="section-subtitle">
            Luyện tập với các đề thi TOEIC mới nhất và hoàn toàn miễn phí
          </p>
        </div>

        <div className="tests-grid">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onStartTest={handleStartTest}
              onContinueTest={handleContinueTest}
              onRetryTest={handleRetryTest}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListTestFull;