import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './LearningAnalysis.scss';
import { examAnalyticsService } from './examAnalytics.service';
import type { ExamAnalyticsDto } from './examAnalytics.types';
import { useAuthStore } from '../../../stores/store';
import { jwtDecode } from 'jwt-decode';

// ── Component ────────────────────────────────────────────────────

const LearningAnalysis = () => {
  const { user, accessToken } = useAuthStore();
  
  let userId = user?.id;

  if (!userId) {
    try {
      const storedUserBase = localStorage.getItem('user');
      if (storedUserBase) {
        const parsed = JSON.parse(storedUserBase);
        userId = parsed.userId || parsed.id;
      }
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }
  }

  // Fallback: Lấy userId từ accessToken nếu Zustand chưa kịp fetch profile (ví dụ khi F5 trang)
  if (!userId && accessToken) {
    try {
      const decoded: any = jwtDecode(accessToken);
      // userId thường nằm ở 1 trong các key này tuỳ thuộc Backend config ClaimTypes
      userId = decoded.nameid || 
               decoded.sub || 
               decoded.id || 
               decoded.userId || 
               decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch (e) {
      console.warn('Failed to decode token for userId');
    }
  }

  // State quản lý dữ liệu
  const [data, setData] = useState<ExamAnalyticsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook gọi API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Gọi service lấy dữ liệu thật từ Backend (phân tích 5 lần gần nhất)
        const result = await examAnalyticsService.getAnalytics(userId!, 5);
        setData(result);
      } catch (err) {
        setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const getLevelColorClass = (level: string) => {
    if (level === 'Strong') return 'lvl-strong';
    if (level === 'Average') return 'lvl-average';
    return 'lvl-weak';
  };

  // Hiển thị trạng thái loading hoặc lỗi
  if (loading) return <div className="la-loading">Đang phân tích dữ liệu học tập...</div>;
  if (error) return <div className="la-error">{error}</div>;
  if (!data) return <div className="la-empty">Chưa có dữ liệu bài thi.</div>;

  // Chuẩn bị data cho biểu đồ (recharts yêu cầu format date đẹp chút)
  const chartData = data.scoreHistory.map(history => {
    const date = new Date(history.attemptDate);
    return {
      attemptDate: `${date.getDate()}/${date.getMonth() + 1}`, // Format ngày: dd/mm
      percent: history.percent,
      score: history.score
    };
  });

  return (
    <div className="learning-analysis-page">
      <div className="la-header">
        <h1>Learning Analysis Dashboard</h1>
        <p>Báo cáo hiệu suất học tập và phân tích điểm yếu</p>
      </div>

      {/* 🟢 BLOCK 1: Overview Cards */}
      <div className="la-overview-cards">
        <div className="la-card">
          <div className="card-title">Tổng số bài đã làm</div>
          <div className="card-value">{data.totalAttempts}</div>
        </div>

        <div className="la-card">
          <div className="card-title">Điểm cao nhất</div>
          <div className="card-value text-success">{data.bestScore}%</div>
        </div>

        <div className="la-card">
          <div className="card-title">Điểm trung bình</div>
          <div className="card-value text-warning">{data.averageScore}%</div>
        </div>

        <div className="la-card highlight-card">
          <div className="card-title">Điểm thi gần nhất</div>
          <div className="card-value">{data.latestScore}%</div>
          <div className={`card-trend ${data.scoreTrend > 0 ? 'trend-up' : 'trend-down'}`}>
            {data.scoreTrend > 0 ? '🟢 +' : '🔴 '}{data.scoreTrend}%
          </div>
        </div>
      </div>

      {/* 🟢 BLOCK 2: Score History Chart */}
      <div className="la-chart-section">
        <h2>📊 Lịch sử điểm số (Score History)</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="attemptDate" tickLine={false} axisLine={false} dy={10} />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                dx={-10}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Score']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="percent"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🟢 BLOCK 3: Bắt bệnh & Bốc thuốc (Split 50/50) */}
      <div className="la-diagnosis-split">
        {/* Left: Strengths & Weaknesses */}
        <div className="diagnosis-left">
          <h2>🩺 Phân tích điểm mạnh / yếu</h2>

          <div className="sw-box box-strengths">
            <h3>✅ Điểm mạnh (Strengths)</h3>
            <ul>
              {data.strengths.length > 0
                ? data.strengths.map((st, i) => <li key={i}>{st}</li>)
                : <li>Chưa có đủ dữ liệu để đánh giá điểm mạnh.</li>
              }
            </ul>
          </div>

          <div className="sw-box box-weaknesses">
            <h3>⚠️ Điểm yếu (Weaknesses)</h3>
            <ul>
              {data.weaknesses.length > 0
                ? data.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)
                : <li>Chưa có đủ dữ liệu để đánh giá điểm yếu.</li>
              }
            </ul>
          </div>
        </div>

        {/* Right: Suggestions Roadmap */}
        <div className="diagnosis-right">
          <h2>💊 Lộ trình khắc phục (Suggestions)</h2>
          <div className="suggestions-list">
            {data.suggestions.length > 0 ? (
              data.suggestions.map((sugg, index) => (
                <div key={index} className="suggestion-card">
                  <div className="sugg-icon">💡</div>
                  <div className="sugg-content">
                    <p>{sugg.message}</p>
                    <button
                      className="btn-study-now"
                      onClick={() => console.log('Navigate to:', sugg.actionUrl)}
                    >
                      Ôn luyện {sugg.partName} ngay 🚀
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Tuyệt vời! Bạn đang duy trì phong độ rất tốt.</p>
            )}
          </div>
        </div>
      </div>

      {/* 🟢 BLOCK 4: Detailed Table */}
      <div className="la-detailed-table-section">
        <h2>🔬 Bảng phân tích nội soi (Detailed Analytics)</h2>
        <div className="table-responsive">
          <table className="la-table">
            <thead>
              <tr>
                <th>Kỹ năng (Skill)</th>
                <th>Tên phần thi (Part)</th>
                <th>Độ chính xác (Accuracy)</th>
                <th>Đánh giá (Level)</th>
              </tr>
            </thead>
            <tbody>
              {data.partAnalytics.map((row, index) => (
                <tr key={index}>
                  <td>
                    <span className={`skill-badge ${row.skill.toLowerCase()}`}>
                      {row.skill === 'Listening' ? '🎧 ' : '📖 '}{row.skill}
                    </span>
                  </td>
                  <td className="fw-500">{row.partName}</td>
                  <td className="td-progress">
                    <div className="progress-bar-wrapper">
                      <div className="progress-info">
                        <span>{row.accuracyPercent}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${getLevelColorClass(row.level)}`}
                          style={{ width: `${row.accuracyPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`level-pill ${getLevelColorClass(row.level)}`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LearningAnalysis;