import React, { useState } from 'react';
import './LearningAnalysis.scss';

const LearningAnalysis = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Dữ liệu completion rate
  const completionData = [
    { skill: 'Grammar', value: 34, color: '#6366f1' },
    { skill: 'Listening', value: 26, color: '#06b6d4' },
    { skill: 'Vocabulary', value: 5, color: '#10b981' },
    { skill: 'Reading', value: 16, color: '#f59e0b' },
    { skill: 'Speaking', value: 2, color: '#ef4444' },
    { skill: 'Writing', value: 2, color: '#8b5cf6' },
  ];

  // Dữ liệu learning time
  const learningTimeData = [
    { day: '25 Dec', minutes: 8 },
    { day: '26 Dec', minutes: 15 },
    { day: '27 Dec', minutes: 12 },
    { day: '28 Dec', minutes: 20 },
    { day: '29 Dec', minutes: 25 },
    { day: '30 Dec', minutes: 18 },
    { day: '31 Dec', minutes: 22 },
    { day: '01 Jan', minutes: 30 },
  ];

  // Chi tiết kỹ năng
  const skillDetails = [
    { name: 'Listening', answered: 575, total: 2242, percentage: 21, color: '#3b82f6' },
    { name: 'Reading', answered: 340, total: 2200, percentage: 12, color: '#10b981' },
    { name: 'Writing', answered: 1, total: 80, percentage: 0, color: '#8b5cf6' },
    { name: 'Speaking', answered: 1, total: 82, percentage: 0, color: '#ef4444' },
    { name: 'Vocabulary', answered: 83, total: 1870, percentage: 4, color: '#f59e0b' },
    { name: 'Grammar', answered: 1213, total: 3661, percentage: 29, color: '#6366f1' },
  ];

  // Kết quả bài thi
  const examResults = [
    { type: 'MINI TEST', completed: 3, total: 5 },
    { type: 'FULL TEST', completed: 2, total: 13 },
  ];

  // Tính overall completion
  const overallCompletion = completionData.reduce((sum, item) => sum + item.value, 0) / completionData.length;

  return (
    <div className="learning-analysis-modern">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <h1>Performance Statistics</h1>
          <p className="subtitle">Track your goals to see how far you've come and how close you are to reaching your goal.</p>
        </div>
        <div className="header-actions">
          <div className="period-selector">
            <button 
              className={selectedPeriod === 'week' ? 'active' : ''}
              onClick={() => setSelectedPeriod('week')}
            >
              7 Days
            </button>
            <button 
              className={selectedPeriod === 'month' ? 'active' : ''}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
            <button 
              className={selectedPeriod === 'quarter' ? 'active' : ''}
              onClick={() => setSelectedPeriod('quarter')}
            >
              This Quarter
            </button>
          </div>
        </div>
      </div>

      <div className="modern-content">
        {/* Main Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Overall Completion</h3>
              <div className="stat-value">{overallCompletion.toFixed(0)}%</div>
              <div className="stat-change">+2.5% from last week</div>
            </div>
          </div>
          
          <div className="stat-card secondary">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>Avg. Learning Time</h3>
              <div className="stat-value">5m 37s</div>
              <div className="stat-change">per day</div>
            </div>
          </div>
          
          <div className="stat-card tertiary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Avg. Accuracy</h3>
              <div className="stat-value">34.8%</div>
              <div className="stat-change">+1.2% this week</div>
            </div>
          </div>
          
          <div className="stat-card quaternary">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>Study Streak</h3>
              <div className="stat-value">7 days</div>
              <div className="stat-change">Keep it up!</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="content-column">
            {/* Completion Rate Card */}
            <div className="modern-card">
              <div className="card-header">
                <h2>Completion Rate</h2>
                <p className="card-subtitle">The chart reflects your completion progress by skills</p>
              </div>
              
              <div className="completion-overview">
                <div className="overall-progress">
                  <div className="progress-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="12"
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="12"
                        strokeDasharray={`${overallCompletion * 3.6} 360`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="progress-text">
                      <div className="progress-value">{overallCompletion.toFixed(0)}%</div>
                      <div className="progress-label">Overall</div>
                    </div>
                  </div>
                </div>
                
                <div className="skills-breakdown">
                  {completionData.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-info">
                        <div className="skill-color" style={{ backgroundColor: skill.color }}></div>
                        <span className="skill-name">{skill.skill}</span>
                      </div>
                      <div className="skill-percentage">{skill.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card-footer">
                <p className="encouragement">Let's study hard to make excellent progress today!</p>
                <button className="action-button">
                  <span>Continue Studying</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>

            {/* Learning Time Card */}
            <div className="modern-card">
              <div className="card-header">
                <h2>Learning Time</h2>
                <p className="card-subtitle">Avr. Per day: 5m 37s</p>
              </div>
              
              <div className="learning-time-chart">
                <div className="chart-container">
                  <div className="y-axis">
                    <span>40</span>
                    <span>32</span>
                    <span>24</span>
                    <span>16</span>
                    <span>8</span>
                    <span>0</span>
                  </div>
                  <div className="bars-container">
                    {learningTimeData.map((item, index) => (
                      <div key={index} className="chart-bar-group">
                        <div className="chart-bar-wrapper">
                          <div 
                            className="chart-bar"
                            style={{ height: `${(item.minutes / 40) * 100}%` }}
                          ></div>
                        </div>
                        <div className="chart-label">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-legend">
                  <span className="legend-item">7 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="content-column">
            {/* Progress Details Card */}
            <div className="modern-card">
              <div className="card-header">
                <h2>Progress Details</h2>
                <p className="card-subtitle">Help you track your learning performance and analyze progress through each skill easily</p>
              </div>
              
              <div className="skills-details">
                {skillDetails.map((skill, index) => (
                  <div key={index} className="skill-detail-item">
                    <div className="skill-header">
                      <span className="skill-title">{skill.name}</span>
                      <div className="skill-numbers">
                        <span className="answered">{skill.answered}</span>
                        <span className="separator">/</span>
                        <span className="total">{skill.total} Answered</span>
                      </div>
                    </div>
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${skill.percentage}%`,
                            backgroundColor: skill.color
                          }}
                        ></div>
                      </div>
                      <div className="progress-percentage">{skill.percentage}% Correct</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Results Card */}
            <div className="modern-card">
              <div className="card-header">
                <h2>Exam Results</h2>
                <p className="card-subtitle">Help you determine what you know and what you still need to work on.</p>
              </div>
              
              <div className="exam-results">
                {examResults.map((exam, index) => (
                  <div key={index} className="exam-item">
                    <div className="exam-type">{exam.type}</div>
                    <div className="exam-progress">
                      <div className="exam-numbers">
                        <span className="completed">{exam.completed}</span>
                        <span className="separator">/</span>
                        <span className="total">{exam.total}</span>
                        <span className="label">Test Completed</span>
                      </div>
                      <div className="exam-bar">
                        <div 
                          className="exam-bar-fill"
                          style={{ width: `${(exam.completed / exam.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="exam-stats-grid">
                  <div className="exam-stat">
                    <div className="stat-value">34.8%</div>
                    <div className="stat-label">Avg. Accuracy</div>
                  </div>
                  <div className="exam-stat">
                    <div className="stat-value">350</div>
                    <div className="stat-label">Avg. Score</div>
                  </div>
                  <div className="exam-stat">
                    <div className="stat-value">42m 13s</div>
                    <div className="stat-label">Avg. Time Taken</div>
                  </div>
                  <div className="exam-stat">
                    <div className="stat-value">5/18</div>
                    <div className="stat-label">Tests Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningAnalysis;