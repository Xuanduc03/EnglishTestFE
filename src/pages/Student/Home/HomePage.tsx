// Home.tsx - Simple Version without Ant Design
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.scss';
import type { ExamItem } from '../../../types/student/examsStudent.type';
import { ExamService } from '../../Admin/Exams/exams.service';

// Mock data
const mockUserStats = {
  name: "Nguyễn Văn A",
  currentScore: 785,
  targetScore: 900,
  streakDays: 14,
  totalExams: 12,
  accuracy: 82,
  rank: "Top 8%",
  vocabularyLearned: 1250
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const simulationExams = [
    {
      id: 1,
      title: "TOEIC Full Test - Đợt 1/2024",
      code: "TOEIC-2024-01",
      duration: 120,
      totalQuestions: 200,
      status: "open",
      startTime: "2024-12-20",
    },
    {
      id: 2,
      title: "IELTS Mock Test - Academic",
      code: "IELTS-MOCK-12",
      duration: 175,
      totalQuestions: 80,
      status: "open",
    }
  ];

  const recentResults = [
    {
      id: 1,
      examTitle: "TOEIC Mock Test #12",
      date: "2024-12-15",
      score: 785,
      total: 990,
      accuracy: 82,
      timeSpent: "115 phút"
    },
    {
      id: 2,
      examTitle: "IELTS Practice Test",
      date: "2024-12-10",
      score: 7.0,
      total: 9.0,
      accuracy: 78,
      timeSpent: "170 phút"
    }
  ];

  const leaderboardData = [
    { rank: 1, name: "Trần Văn B", score: 950, exams: 15, streak: 21 },
    { rank: 2, name: "Lê Thị C", score: 925, exams: 12, streak: 18 },
    { rank: 3, name: "Phạm Văn D", score: 900, exams: 10, streak: 15 },
    { rank: 4, name: "Nguyễn Thị E", score: 880, exams: 8, streak: 12 },
    { rank: 5, name: "Bạn", score: 785, exams: 12, streak: 14, isCurrentUser: true }
  ];

  const practiceSections = [
    {
      id: 1,
      title: "Luyện Listening Part 1",
      skill: "Listening",
      completed: 8,
      total: 15,
    },
    {
      id: 2,
      title: "Luyện Reading Part 7",
      skill: "Reading",
      completed: 12,
      total: 20,
    }
  ];

  const [openExams, setOpenExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);


  const fetchOpenExams = async () => {
    try {
      setLoadingExams(true);

      const res = await ExamService.getAll({
        page: 1,
        pageSize: 5,
        status: 'Published'
      });

      setOpenExams(res.data.items);
    } catch (error) {
      console.error('Failed to fetch exams', error);
    } finally {
      setLoadingExams(false);
    }
  };


  useEffect(() => {
    fetchOpenExams();
  }, []);


  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="container">
          <div className="welcome-section">
            <div className="welcome-text">
              <p className="greeting">Xin chào,</p>
              <h1>{mockUserStats.name}</h1>
              <p className="subtitle">Hãy chọn hình thức ôn luyện phù hợp với bạn</p>
            </div>
            <div className="quick-stats">
              <div className="stat-card">
                <span className="stat-icon">🏆</span>
                <div className="stat-info">
                  <h3>{mockUserStats.currentScore}/990</h3>
                  <p>Điểm hiện tại</p>
                </div>
              </div>
              <div className="stat-badge">
                🔥 {mockUserStats.streakDays} ngày
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="section-header">
            <h2>Ôn luyện nhanh</h2>
            <p>Chọn hình thức phù hợp với mục tiêu của bạn</p>
          </div>

          <div className="action-grid">
            {/* Thi thử */}
            <div className="action-card simulation" onClick={() => navigate('/full-test')}>
              <div className="card-icon">▶️</div>
              <h3>Thi thử TOEIC/IELTS</h3>
              <p>Mô phỏng kỳ thi thật với thời gian và áp lực</p>
              <div className="card-tags">
                <span className="tag blue">120 phút</span>
                <span className="tag green">200 câu</span>
                <span className="tag red">Tính điểm</span>
              </div>
              <button className="btn btn-primary">Vào phòng thi</button>
            </div>

            {/* Luyện tập */}
            <div className="action-card practice" onClick={() => navigate('/practice/list')}>
              <div className="card-icon">📚</div>
              <h3>Luyện tập theo phần</h3>
              <p>Tập trung vào kỹ năng yếu, có giải thích chi tiết</p>
              <div className="card-tags">
                <span className="tag green">Không giới hạn</span>
                <span className="tag blue">Giải thích đáp án</span>
              </div>
              <button className="btn btn-default">Bắt đầu luyện tập</button>
            </div>

            {/* Flashcard */}
            <div className="action-card flashcard" onClick={() => navigate('/vocabulary/flash-card')}>
              <div className="card-icon">📝</div>
              <h3>Học từ vựng</h3>
              <p>Flashcard + Audio giúp ghi nhớ từ vựng hiệu quả</p>
              <div className="card-tags">
                <span className="tag purple">{mockUserStats.vocabularyLearned} từ</span>
                <span className="tag orange">Lật thẻ + Nghe</span>
              </div>
              <button className="btn btn-default">Mở bộ từ vựng</button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Column */}
          <div className="left-column">
            {/* Active Exams */}
            <section className="card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">⏰</span>
                  <h3>Bài thi đang mở</h3>
                </div>
                <a href="/exams" className="link">Xem tất cả →</a>
              </div>

              <div className="card-body">
                {loadingExams && <p>Đang tải bài thi...</p>}

                {!loadingExams && openExams.length === 0 && (
                  <p>Hiện chưa có bài thi nào đang mở</p>
                )}

                {openExams.map(exam => (
                  <div key={exam.id} className="exam-item">
                    <div className="exam-info">
                      <div className="exam-icon">▶️</div>
                      <div className="exam-details">
                        <h4>{exam.title}</h4>
                        <div className="exam-meta">
                          <span className="tag">Mã: {exam.code}</span>
                          <span className="tag">{exam.duration} phút</span>
                          <span className="tag">{exam.questionCount} câu</span>
                          <span className="tag blue">
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/full-test/${exam.id}`)}
                    >
                      Vào thi
                    </button>
                  </div>
                ))}
              </div>

            </section>

            {/* Recent Results */}
            <section className="card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">📊</span>
                  <h3>Kết quả gần đây</h3>
                </div>
                <button className="link" onClick={() => navigate('/history')}>
                  Xem lịch sử đầy đủ
                </button>
              </div>
              <div className="card-body">
                {recentResults.map(result => (
                  <div key={result.id} className="result-item">
                    <div className="result-score">
                      <div className="score-circle">
                        <strong>{result.score}</strong>
                        <span>/{result.total}</span>
                      </div>
                    </div>
                    <div className="result-info">
                      <h4>{result.examTitle}</h4>
                      <div className="result-meta">
                        <span>{result.date}</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${result.accuracy}%` }}
                          />
                        </div>
                        <span>{result.accuracy}%</span>
                        <span>Thời gian: {result.timeSpent}</span>
                      </div>
                    </div>
                    <button
                      className="btn-link"
                      onClick={() => navigate(`/results/${result.id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Progress Stats */}
            <section className="card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">📈</span>
                  <h3>Tiến độ của bạn</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Mục tiêu: {mockUserStats.targetScore}/990</span>
                    <strong>{mockUserStats.currentScore}/990</strong>
                  </div>
                  <div className="progress-bar large">
                    <div
                      className="progress-fill blue"
                      style={{ width: `${(mockUserStats.currentScore / mockUserStats.targetScore) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-label">
                    <span>Độ chính xác</span>
                    <strong>{mockUserStats.accuracy}%</strong>
                  </div>
                  <div className="progress-bar large">
                    <div
                      className="progress-fill green"
                      style={{ width: `${mockUserStats.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-label">
                    <span>Chuỗi học tập</span>
                    <strong>🔥 {mockUserStats.streakDays} ngày</strong>
                  </div>
                  <div className="progress-bar large">
                    <div
                      className="progress-fill orange"
                      style={{ width: `${(mockUserStats.streakDays / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Leaderboard */}
            <section className="card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">👥</span>
                  <h3>Bảng xếp hạng</h3>
                </div>
                <button className="link" onClick={() => navigate('/leaderboard')}>
                  Xem đầy đủ
                </button>
              </div>
              <div className="card-body">
                {leaderboardData.map(user => (
                  <div
                    key={user.rank}
                    className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="user-rank">
                      {user.rank <= 3 ? (
                        <span className={`medal rank-${user.rank}`}>
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="rank-number">{user.rank}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <strong>{user.name} {user.isCurrentUser && '(Bạn)'}</strong>
                      <span>{user.score} điểm</span>
                    </div>
                    <div className="user-stats">
                      <span className="tag blue">{user.exams} bài</span>
                      <span className="tag orange">🔥 {user.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Practice Suggestions */}
            <section className="card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">💡</span>
                  <h3>Gợi ý luyện tập</h3>
                </div>
              </div>
              <div className="card-body">
                {practiceSections.map(item => (
                  <div key={item.id} className="practice-item">
                    <div className="practice-info">
                      <h4>{item.title}</h4>
                      <div className="practice-meta">
                        <span className="tag blue">{item.skill}</span>
                        <div className="progress-bar small">
                          <div
                            className="progress-fill"
                            style={{ width: `${(item.completed / item.total) * 100}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {item.completed}/{item.total}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-link"
                      onClick={() => navigate(`/practice/${item.id}`)}
                    >
                      Luyện ngay
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <section className="card alert-card">
          <div className="alert-content">
            <span className="alert-icon">📅</span>
            <div className="alert-text">
              <h4>TOEIC Mock Test tháng 12 - Đăng ký đến hết 20/12</h4>
              <p>Thi thử miễn phí có chấm điểm và phân tích chi tiết</p>
            </div>
            <button className="btn btn-primary">Đăng ký ngay</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;