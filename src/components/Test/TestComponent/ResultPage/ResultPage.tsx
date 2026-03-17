import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerServiceOutlined, ReadOutlined, KeyOutlined } from '@ant-design/icons';
import type { SubmitExamResult } from '../../../../pages/Student/FullTest/examAttempt.types';
import './ResultPage.scss';

// ── Helpers ───────────────────────────────────────────────────
const LISTENING_PARTS = ['Part 1', 'Part 2', 'Part 3', 'Part 4'];
const READING_PARTS   = ['Part 5', 'Part 6', 'Part 7'];
const MAX_TOEIC_SKILL = 495;
const MAX_TOEIC_TOTAL = 990;

interface ResultPageProps {
  result: SubmitExamResult;
  attemptId: string;
  examTitle?: string;
}

const ResultPage: React.FC<ResultPageProps> = ({ 
  result, 
  attemptId, 
  examTitle = 'THI THỬ ONLINE TOEIC - ĐỀ 01' 
}) => {
  const navigate = useNavigate();

  // ── 1. GIỮ NGUYÊN LOGIC CŨ CỦA BẠN ──────────────────────────
  const {
    listeningScore,
    readingScore,
    totalScore,
    partSummaries,
  } = result;

  // Tính phần trăm cho thanh Progress Bar IIG
  const listeningPercent = Math.round((listeningScore / MAX_TOEIC_SKILL) * 100);
  const readingPercent   = Math.round((readingScore / MAX_TOEIC_SKILL) * 100);
  const totalPercent     = Math.round((totalScore / MAX_TOEIC_TOTAL) * 100);

  // ── 2. RENDER GIAO DIỆN IIG CHUẨN ───────────────────────────
  return (
    <div className="iig-result-wrapper">
      
      {/* --- HEADER KẾT QUẢ --- */}
      <div className="iig-result-topbar">
        <div className="iig-logo">
          <span className="logo-text">IIG</span>
          <span className="logo-sub">VIỆT NAM</span>
        </div>
        <div className="iig-topbar-title">Result</div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="iig-result-container">
        
        <h1 className="iig-exam-title">{examTitle.toUpperCase()}</h1>

        {/* --- TOTAL SCORE BOX --- */}
        <div className="iig-total-box">
          <div className="score-text">
            Your score: <span className="score-number">{totalScore}</span>
          </div>
          
          <div className="progress-container">
            <span className="label-min">TOTAL</span>
            <div className="progress-track">
              <div className="track-bg"></div>
              {/* Vạch màu cam theo điểm */}
              <div className="track-fill orange" style={{ width: `${totalPercent}%` }}></div>
              <div className="track-dot orange" style={{ left: '0%' }}></div>
              <div className="track-dot orange" style={{ left: `${totalPercent}%` }}></div>
              
              <span className="track-limit-max">990</span>
              <span className="track-limit-min">0</span>
            </div>
          </div>
        </div>

        {/* --- 2 CỘT LISTENING & READING --- */}
        <div className="iig-sections-grid">
          
          {/* CỘT LISTENING */}
          <div className="iig-section-card">
            <div className="card-header listening-header">
              <div className="header-left">
                <CustomerServiceOutlined className="icon" />
                <span>Listening</span>
              </div>
              <KeyOutlined className="icon-key" />
            </div>
            
            <div className="card-body">
              <div className="score-text">
                Your score: <span className="score-number">{listeningScore}</span>
              </div>
              
              <div className="progress-container">
                <div className="progress-track">
                  <div className="track-bg"></div>
                  {/* Vạch màu xanh theo điểm Listening */}
                  <div className="track-fill green" style={{ width: `${listeningPercent}%` }}></div>
                  <div className="track-dot green" style={{ left: '0%' }}></div>
                  <div className="track-dot green" style={{ left: `${listeningPercent}%` }}></div>
                  
                  <span className="track-limit-max">495</span>
                  <span className="track-limit-min">0</span>
                </div>
              </div>

              {/* Text Đánh giá năng lực giả lập IIG */}
              <ul className="skill-feedback-list">
                <li>You can <span className="highlight">infer the central idea, purpose, and basic context</span> of short spoken exchanges, especially when the vocabulary is not difficult.</li>
                <li>You can <span className="highlight">understand the central idea, purpose, and basic context</span> of extended spoken texts when this information is supported by repetition or paraphrase.</li>
                <li>You can <span className="highlight">understand details</span> in short spoken exchanges when easy or medium-level vocabulary is used.</li>
              </ul>
            </div>
          </div>

          {/* CỘT READING */}
          <div className="iig-section-card">
            <div className="card-header reading-header">
              <div className="header-left">
                <ReadOutlined className="icon" />
                <span>Reading</span>
              </div>
              <KeyOutlined className="icon-key" />
            </div>
            
            <div className="card-body">
              <div className="score-text">
                Your score: <span className="score-number">{readingScore}</span>
              </div>
              
              <div className="progress-container">
                <div className="progress-track">
                  <div className="track-bg"></div>
                  {/* Vạch màu xanh theo điểm Reading */}
                  <div className="track-fill green" style={{ width: `${readingPercent}%` }}></div>
                  <div className="track-dot green" style={{ left: '0%' }}></div>
                  <div className="track-dot green" style={{ left: `${readingPercent}%` }}></div>
                  
                  <span className="track-limit-max">495</span>
                  <span className="track-limit-min">0</span>
                </div>
              </div>

              <ul className="skill-feedback-list">
                <li>You can <span className="highlight">understand very familiar everyday words</span>.</li>
                <li>You can <span className="highlight">understand some most-common, rule-based grammatical constructions</span> when not very much reading is necessary, and no difficult words are present.</li>
                <li>You can <span className="highlight">catch the basic idea</span> of very short and simple texts such as restaurant menus, train or bus schedules, traffic signs.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* --- DÀNH MỘT GÓC NHỎ ĐỂ HIỂN THỊ CÁC THỐNG KÊ CHI TIẾT CỦA BẠN --- */}
        {/* Do IIG không có phần này, mình để nó ở dưới dạng "Review Action" để không làm hỏng form gốc */}
        <div className="iig-custom-stats-area">
           <button 
             className="btn-review-detail" 
             onClick={() => navigate(`/full-test/${attemptId}/review`)}
           >
             Xem lại bài làm chi tiết (Review Answers)
           </button>
        </div>

      </div>

      {/* --- FOOTER (Thanh xám dưới đáy) --- */}
      <div className="iig-result-footer">
        <button className="btn-back" onClick={() => navigate('/full-test')}>
          Back to Dashboard
        </button>
      </div>

    </div>
  );
};

export default ResultPage;