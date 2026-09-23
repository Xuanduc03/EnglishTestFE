import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentResults.scss';

// Định nghĩa Type cho dữ liệu truyền vào
export interface ResultItem {
    id: string | number;
    examTitle: string;
    date: string;
    score: number;
    total: number;
    accuracy: number; // Phần trăm (%)
    timeSpent: string; // VD: "115 phút"
}

interface RecentResultsProps {
    results: ResultItem[];
    isLoading?: boolean;
}

const RecentResults: React.FC<RecentResultsProps> = ({ results, isLoading = false }) => {
    const navigate = useNavigate();

    // Đổi màu thanh Accuracy tùy theo điểm (Dưới 50% màu Cam, Dưới 30% màu Đỏ)
    const getAccuracyColor = (acc: number) => {
        if (acc >= 70) return 'var(--success, #10b981)'; // Xanh lá
        if (acc >= 50) return 'var(--warning, #f59e0b)'; // Vàng/Cam
        return '#ef4444'; // Đỏ
    };

    return (
        <section className="recent-results-wrapper">
            {/* HEADER */}
            <div className="card-header">
                <div className="header-title">
                    <span className="icon">📊</span>
                    <h3>Recent Results</h3>
                </div>
                <button
                    className="link-all"
                    onClick={() => navigate('/history')}
                >
                    Full History →
                </button>
            </div>

            {/* BODY / LIST */}
            <div className="results-list">

                {isLoading && (
                    <div className="empty-state">⏳ Loading results...</div>
                )}

                {!isLoading && results.length === 0 && (
                    <div className="empty-state">
                        📝 You haven't completed any exams yet. Give one a try!
                    </div>
                )}

                {!isLoading && results.map((result) => (
                    <div
                        key={result.id}
                        className="result-item"
                        onClick={() => navigate(`/results/${result.id}`)}
                    >
                        {/* 1. Khối Điểm số */}
                        <div className="score-badge">
                            <span className="score-num">{result.score}</span>
                            <span className="score-total">/{result.total}</span>
                        </div>

                        {/* 2. Khối Thông tin */}
                        <div className="result-info">
                            <h4>{result.examTitle}</h4>
                            <div className="result-meta">
                                <span>{result.date}</span>
                                <span className="dot">•</span>
                                <span className="time-badge">⏱ {result.timeSpent}</span>
                            </div>
                        </div>

                        {/* 3. Khối Độ chính xác (Accuracy) */}
                        <div className="accuracy-box">
                            <span
                                className="acc-text"
                                style={{ color: getAccuracyColor(result.accuracy) }}
                            >
                                {result.accuracy}%
                            </span>
                            <div className="acc-bar-bg">
                                <div
                                    className="acc-bar-fill"
                                    style={{
                                        width: `${result.accuracy}%`,
                                        backgroundColor: getAccuracyColor(result.accuracy)
                                    }}
                                />
                            </div>
                        </div>

                        {/* 4. Mũi tên điều hướng */}
                        <div className="detail-arrow">›</div>
                    </div>
                ))}

            </div>
        </section>
    );
};

export default RecentResults;