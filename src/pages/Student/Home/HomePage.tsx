// Home.tsx - Simple Version without Ant Design
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.scss';
import type { ExamItem } from '../../../types/student/examsStudent.type';
import { ExamService } from '../../Admin/Exams/exams.service';
import BentoDashboard from '../../../components/student/home/BentoDashboard';
import QuickActions from '../../../components/student/home/QuickActions';
import ActiveExams from '../../../components/student/home/ActiveExams';
import RecentResults, { type ResultItem } from '../../../components/student/home/RecentResults';
import { PracticeService } from '../../../components/Practice/Services/practice.service';

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
  const [recentResults, setRecentResults] = useState<ResultItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

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
  const fetchRecentResults = async () => {
    try {
      setLoadingResults(true);
      const res = await PracticeService.getHistory({
        pageSize: 5, // lấy 5 kết quả gần nhất
        page: 1,
      });
      // res là PaginatedResult<PracticeHistoryDto>
      const items = res.items.map(dto => ({
        id: dto.sessionId,
        examTitle: dto.title,
        date: new Date(dto.startedAt).toLocaleDateString('vi-VN'),
        score: dto.score,
        total: dto.totalQuestions,
        accuracy: dto.accuracyPercentage,
        timeSpent: dto.submittedAt ? calculateTimeSpent(dto.startedAt, dto.submittedAt) : 'Chưa hoàn thành',
      }));
      setRecentResults(items);
    } catch (error) {
      console.error('Failed to fetch recent results', error);
    } finally {
      setLoadingResults(false);
    }
  };


  const calculateTimeSpent = (start: string, end: string): string => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} phút`;
  };

  useEffect(() => {
    fetchRecentResults();
    fetchOpenExams();
  }, []);
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
  const mockRecentResults = [
    { id: 1, examTitle: "TOEIC Mock Test #12", date: "15/12/2024", score: 785, total: 990, accuracy: 82, timeSpent: "115 phút" },
    { id: 2, examTitle: "IELTS Practice Test", date: "10/12/2024", score: 5.5, total: 9.0, accuracy: 61, timeSpent: "170 phút" }
  ];

  const [openExams, setOpenExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);






  return (
    <div className="home-page">
      <div className="container">

        {/* KHỐI 1: BENTO DASHBOARD (Top Stats) */}
        <BentoDashboard />

        {/* KHỐI 2: QUICK ACTIONS */}
        <QuickActions />

        {/* KHỐI 3: MAIN CONTENT CHIA 2 CỘT */}
        <div className="main-content">

          {/* CỘT TRÁI (2/3) */}
          <div className="left-column">
            {/* Component Active Exams đã tách */}
            <ActiveExams exams={openExams} isLoading={loadingExams} />

            {/* Component Recent Results đã tách */}
            <RecentResults  results={recentResults} isLoading={loadingResults}  />
          </div>

          {/* CỘT PHẢI (1/3) */}
          <div className="right-column">

            {/* LEADERBOARD CARD */}
            <section className="premium-card">
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
                  <div key={user.rank} className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}>
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
                      <strong>{user.name}</strong>
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

            {/* PRACTICE SUGGESTIONS CARD */}
            <section className="premium-card">
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
                        <div className="progress-bar">
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

        {/* KHỐI 4: UPCOMING DEADLINES (Footer Event) */}
        <section className="alert-card">
          <div className="alert-content">
            <span className="alert-icon">📅</span>
            <div className="alert-text">
              <h4>TOEIC Mock Test tháng 12 - Đăng ký đến hết 20/12</h4>
              <p>Thi thử miễn phí có chấm điểm và phân tích chi tiết</p>
            </div>
          </div>
          <button className="btn-primary">Đăng ký ngay</button>
        </section>

      </div>
    </div>
  );
};

export default Home;

function calculateTimeSpent(startedAt: string, submittedAt: string): any {
  throw new Error('Function not implemented.');
}
