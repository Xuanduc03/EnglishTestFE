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
import { LeaderboardService } from './Home.services';
import type { LeaderboardEntry } from './Home.type';
import { SKILL_PARENT_ID } from '../../../components/PracticeList/SkillPracticePage';
import type { CategoryDto } from '../../Admin/Categories/category.config';
import { toast } from 'react-toastify';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // ── State — khai báo TẤT CẢ ở đây, trước mọi function ──
  const [openExams, setOpenExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [recentResults, setRecentResults] = useState<ResultItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [practiceSkills, setPracticeSkills] = useState<CategoryDto[]>([]);
  const [startingPractice, setStartingPractice] = useState<string | null>(null);

  // ── Helpers ───────────────────────────────────────────────
  const calculateTimeSpent = (start: string, end: string): string => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} mins`;
  };

  // ── Fetch functions ───────────────────────────────────────
  const fetchOpenExams = async () => {
    try {
      setLoadingExams(true);
      const res = await ExamService.getAll({
        page: 1,
        pageSize: 5,
        status: 'Published',
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
      const res = await PracticeService.getHistory({ pageSize: 5, page: 1 });
      const items: ResultItem[] = res.items.map(dto => ({
        id: dto.sessionId,
        examTitle: dto.title,
        date: new Date(dto.startedAt).toLocaleDateString('vi-VN'),
        score: dto.score,
        total: dto.totalQuestions,
        accuracy: dto.accuracyPercentage,
        timeSpent: dto.submittedAt
          ? calculateTimeSpent(dto.startedAt, dto.submittedAt)
          : 'In Progress',
      }));
      setRecentResults(items);
    } catch (error) {
      console.error('Failed to fetch recent results', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await LeaderboardService.getLeaderboard(5, 'week');
      setLeaderboardData(res.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchPracticeSkills = async () => {
    try {
      const skills = await PracticeService.getByCodeType('SKILL', SKILL_PARENT_ID);
      setPracticeSkills(skills);
    } catch {
      // silently fail on home page
    }
  };

  useEffect(() => {
    fetchOpenExams();
    fetchRecentResults();
    fetchLeaderboard();
    fetchPracticeSkills();
  }, []);

  // Quick-start practice: pick first part of a skill and start with defaults (10 questions, untimed)
  const handleQuickStartPractice = async (skill: CategoryDto) => {
    const firstPart = skill.children?.[0];
    if (!firstPart) {
      navigate('/practice/list');
      return;
    }
    try {
      setStartingPractice(skill.id);
      const session = await PracticeService.startPractice({
        partIds: [firstPart.id],
        questionsPerPart: 10,
        isTimed: false,
      });
      navigate(`/practice/session/${session.sessionId}`);
    } catch {
      toast.error('Could not start practice. Please try from the practice page.');
      navigate('/practice/list');
    } finally {
      setStartingPractice(null);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="home-page">
      <div className="container">

        {/* KHỐI 1: BENTO DASHBOARD */}
        <BentoDashboard />

        {/* KHỐI 2: QUICK ACTIONS */}
        <QuickActions />

        {/* KHỐI 3: MAIN CONTENT */}
        <div className="main-content">

          {/* CỘT TRÁI (2/3) */}
          <div className="left-column">
            <ActiveExams exams={openExams} isLoading={loadingExams} />
            <RecentResults results={recentResults} isLoading={loadingResults} />
          </div>

          {/* CỘT PHẢI (1/3) */}
          <div className="right-column">

            {/* LEADERBOARD */}
            <section className="premium-card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">👥</span>
                  <h3>Leaderboard</h3>
                </div>
                <button className="link" onClick={() => navigate('/leaderboard')}>
                  View All
                </button>
              </div>
              <div className="card-body">
                {leaderboardData.map(user => (
                  <div
                    key={user.rank}
                    className={`leaderboard-item ${user.userId ? 'current-user' : ''}`}
                  >
                    <div className="user-rank">
                      {user.rank <= 3 ? (
                        <span className={`medal rank-${user.rank}`}>{user.medal}</span>
                      ) : (
                        <span className="rank-number">{user.rank}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <strong>{user.fullname}</strong>
                      <span>{user.points} pts</span>
                    </div>
                    <div className="user-stats">
                      <span className="tag blue">{user.streak} days</span>
                      <span className="tag orange">🔥 {user.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SUGGESTED PRACTICE */}
            <section className="premium-card">
              <div className="card-header">
                <div className="header-title">
                  <span className="icon">💡</span>
                  <h3>Suggested Practice</h3>
                </div>
              </div>
              <div className="card-body">
                {practiceSkills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <button className="btn-link" onClick={() => navigate('/practice/list')}>Browse Practice Library</button>
                  </div>
                ) : (
                  practiceSkills.slice(0, 3).map(skill => (
                    <div key={skill.id} className="practice-item">
                      <div className="practice-info">
                        <h4>{skill.name}</h4>
                        <div className="practice-meta">
                          <span className="tag blue">{skill.codeType || 'Skill'}</span>
                          <span className="progress-text">{skill.children?.length ?? 0} parts</span>
                        </div>
                      </div>
                      <button
                        className="btn-link"
                        disabled={startingPractice === skill.id}
                        onClick={() => handleQuickStartPractice(skill)}
                      >
                        {startingPractice === skill.id ? 'Starting...' : 'Start Now'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>

        {/* KHỐI 4: ALERT */}
        <section className="alert-card">
          <div className="alert-content">
            <span className="alert-icon">📅</span>
            <div className="alert-text">
              <h4>TOEIC Mock Test — Register by Dec 20</h4>
              <p>Free practice test with scoring and detailed analysis</p>
            </div>
          </div>
          <button className="btn-primary">Register Now</button>
        </section>

      </div>
    </div>
  );
};

export default Home;