import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './style.scss';
import type { IeltsSubmitResult } from '../../../types/ieltsExam.types';

const IeltsFullTestResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();

  // 1. "Hứng" cục result được gửi sang từ lệnh navigate của trang làm bài
  const [result, setResult] = useState<IeltsSubmitResult | null>(
    (location.state?.result as IeltsSubmitResult) || null
  );

  /* (Tùy chọn) 
   * Đề phòng học viên ấn F5 tải lại trang làm mất state của Router, 
   * chỗ này bạn có thể gọi API để lấy lại kết quả nếu result bị null.
   */
  // useEffect(() => {
  //   if (!result && attemptId) {
  //     // Gọi API lấy kết quả: ieltsAttemptService.getResult(attemptId).then(setResult);
  //   }
  // }, [result, attemptId]);

  // 2. Nút "Làm lại bài thi"
  const handleRetry = () => {
    navigate('/full-test'); // Chuyển về trang danh sách đề thi
  };

  // 3. Nút "Xem chi tiết đáp án"
  const handleReview = () => {
    navigate(`/ielts-test/review/${attemptId}`);
  };

  // Hàm format thời gian (giây -> mm:ss)
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Hàm format ngày nộp bài
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // ── GUARD: Tránh lỗi Cannot read properties of undefined ──
  if (!result) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading results...</h2>
      </div>
    );
  }

  return (
    <div className="idp-result-container">

      {/* ── HEADER ── */}
      <div className="result-header">
        <h1 className="result-title">Test Results</h1>
        <p className="result-meta">Submitted at: {formatDate(result.submittedAt)}</p>
      </div>

      {/* ── TỔNG QUAN ĐIỂM SỐ (BAND SCORE) ── */}
      <div className="score-cards-wrapper">
        <div className="score-card listening">
          <div className="skill-name">Listening</div>
          <div className="band-score">{result.listening.bandScore.toFixed(1)}</div>
          <div className="correct-count">Correct: {result.listening.correctCount}</div>
        </div>

        <div className="score-card reading">
          <div className="skill-name">Reading</div>
          <div className="band-score">{result.reading.bandScore.toFixed(1)}</div>
          <div className="correct-count">Correct: {result.reading.correctCount}</div>
        </div>
      </div>

      {/* ── THỐNG KÊ CHI TIẾT (ĐÚNG / SAI / BỎ QUA / THỜI GIAN) ── */}
      <div className="stats-grid">
        <div className="stat-box correct">
          <span className="stat-value">{result.correctAnswers}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-box wrong">
          <span className="stat-value">{result.wrongAnswers}</span>
          <span className="stat-label">Wrong</span>
        </div>
        <div className="stat-box skipped">
          <span className="stat-value">{result.skippedAnswers}</span>
          <span className="stat-label">Skipped</span>
        </div>
        <div className="stat-box time">
          <span className="stat-value">{formatTime(result.durationSeconds)}</span>
          <span className="stat-label">Time spent</span>
        </div>
      </div>

      {/* ── BẢNG PHÂN TÍCH TỪNG PHẦN (SECTION BREAKDOWN) ── */}
      <div className="section-breakdown-wrapper">
        <h3 className="breakdown-title">Section Breakdown</h3>
        <div className="breakdown-table-container">
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Section</th>
                <th className="center">Total</th>
                <th className="center text-green">Correct</th>
                <th className="center text-red">Wrong</th>
                <th className="center text-gray">Skipped</th>
              </tr>
            </thead>
            <tbody>
              {result.sections.map((sec, idx) => (
                <tr key={idx}>
                  <td className="section-name">{sec.sectionName}</td>
                  <td className="center fw-600">{sec.total}</td>
                  <td className="center text-green fw-600">{sec.correct}</td>
                  <td className="center text-red fw-600">{sec.wrong}</td>
                  <td className="center text-gray fw-600">{sec.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── NÚT HÀNH ĐỘNG ── */}
      <div className="action-footer">
        <button className="btn-action btn-outline" onClick={handleRetry}>
          Back to Test List
        </button>
        <button className="btn-action btn-primary" onClick={handleReview}>
          View Answer Review
        </button>
      </div>

    </div>
  );
};

export default IeltsFullTestResultPage;