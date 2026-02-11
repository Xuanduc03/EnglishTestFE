import React, { useState, useEffect } from 'react';
import './ListTestFull.scss';

// Types
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

interface TestCardProps {
  test: Test;
  onStartTest: (testId: number) => void;
  onContinueTest: (testId: number) => void;
  onRetryTest: (testId: number) => void;
}

// Test Card Component
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

// Main Tests Section Component
const ListTestFull: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API call - Replace with your actual API endpoint
  const fetchTests = async (): Promise<Test[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - Replace with actual API response
    return [
      {
        id: 1,
        title: "TEST 1",
        type: "free",
        totalScore: 990,
        userScore: 270,
        questionCount: 200,
        participantCount: 15420,
        hasExplanation: true,
        status: "completed"
      },
      {
        id: 2,
        title: "TEST 2",
        type: "free",
        totalScore: 990,
        userScore: undefined,
        questionCount: 200,
        participantCount: 12850,
        hasExplanation: true,
        status: "not-started"
      },
      {
        id: 3,
        title: "TEST 3",
        type: "new",
        totalScore: 990,
        userScore: 450,
        questionCount: 200,
        participantCount: 8650,
        hasExplanation: true,
        status: "in-progress",
        progress: 60
      },
      {
        id: 4,
        title: "TEST 4",
        type: "free",
        totalScore: 990,
        userScore: 720,
        questionCount: 200,
        participantCount: 11200,
        hasExplanation: true,
        status: "completed"
      },
      {
        id: 5,
        title: "TEST 5",
        type: "new",
        totalScore: 990,
        userScore: undefined,
        questionCount: 200,
        participantCount: 4200,
        hasExplanation: true,
        status: "not-started"
      },
      {
        id: 6,
        title: "TEST 6",
        type: "premium",
        totalScore: 990,
        userScore: undefined,
        questionCount: 200,
        participantCount: 3200,
        hasExplanation: true,
        status: "not-started"
      },
      {
        id: 7,
        title: "TEST 7",
        type: "free",
        totalScore: 990,
        userScore: 580,
        questionCount: 200,
        participantCount: 9800,
        hasExplanation: true,
        status: "completed"
      },
      {
        id: 8,
        title: "TEST 8",
        type: "new",
        totalScore: 990,
        userScore: undefined,
        questionCount: 200,
        participantCount: 2100,
        hasExplanation: true,
        status: "not-started"
      }
    ];
  };

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const testsData = await fetchTests();
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

  const handleStartTest = async (testId: number) => {
    try {
      console.log('Starting test:', testId);
      // Implement start test API call here
      // await startTestAPI(testId);
      
      // Update test status locally for demo
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'in-progress' as const } : test
      ));
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleContinueTest = async (testId: number) => {
    try {
      console.log('Continuing test:', testId);
      // Implement continue test API call here
      // await continueTestAPI(testId);
    } catch (error) {
      console.error('Error continuing test:', error);
    }
  };

  const handleRetryTest = async (testId: number) => {
    try {
      console.log('Retrying test:', testId);
      // Implement retry test API call here
      // await retryTestAPI(testId);
      
      // Update test status locally for demo
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'in-progress' as const, userScore: undefined } : test
      ));
    } catch (error) {
      console.error('Error retrying test:', error);
    }
  };

  // Loading State
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

  // Error State
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

  // Empty State
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

  // Main Content
  return (
    <section className="tests-section">
      <div className="tests-container">
        {/* Section Header */}
        <div className="section-header">
          <h1 className="section-title">📚 Đề Thi TOEIC</h1>
          <p className="section-subtitle">
            Luyện tập với các đề thi TOEIC mới nhất và hoàn toàn miễn phí
          </p>
        </div>

        {/* Tests Grid */}
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