import React, { useEffect, useState } from 'react';
import './BentoDashboard.scss';
import { useNavigate } from 'react-router-dom';
import type { InProgressPracticeDto, UserDashboardStats } from './headerdash.types';
import { api } from '../../../../configs/axios-custom';
import { toast } from 'react-toastify';
import { Spin } from 'antd';

const BentoDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [inProgressPractice, setInProgressPractice] = useState<InProgressPracticeDto | null>(null);
    const [loadingPractice, setLoadingPractice] = useState(true);
    const [errorPractice, setErrorPractice] = useState<string | null>(null);

    const [dashboardInfo, setDashboardInfo] = useState<UserDashboardStats | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [errorInfo, setErrorInfo] = useState<string | null>(null);

    // Gọi API dashboard info
    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                setLoadingInfo(true);
                const response = await api.get('/api/dashboard/info');
                if (response.data.success) {
                    setDashboardInfo(response.data.data);
                } else {
                    setErrorInfo('Không thể tải thông tin người dùng');
                }
            } catch (err) {
                console.error('Lỗi lấy dashboard info:', err);
                setErrorInfo('Không thể tải thông tin người dùng');
            } finally {
                setLoadingInfo(false);
            }
        };
        fetchDashboardInfo();
    }, []);

    // Gọi API lấy practice attempt đang in progress
    useEffect(() => {
        const fetchInProgressPractice = async () => {
            try {
                setLoadingPractice(true);
                const response = await api.get('/api/practice/in-progress');
                if (response.data.success && response.data.data) {
                    setInProgressPractice(response.data.data);
                } else {
                    setInProgressPractice(null);
                }
            } catch (err) {
                console.error('Lỗi khi lấy practice in progress:', err);
                setErrorPractice('Không thể tải dữ liệu bài học');
                toast.error('Không thể tải bài học đang dở');
            } finally {
                setLoadingPractice(false);
            }
        };

        fetchInProgressPractice();
    }, []);

    const loading = loadingInfo || loadingPractice;
    const error = errorInfo || errorPractice;

    if (loading) {
        return (
            <div className="bento-dashboard-wrapper container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Spin tip="Đang tải..." />
            </div>
        );
    }

    if (error || !dashboardInfo) {
        return (
            <div className="bento-dashboard-wrapper container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: 'red' }}>{error || 'Không có dữ liệu'}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </div>
        );
    }

    const stats = dashboardInfo;

    // Tính toán stroke cho circular chart
    const circleCircumference = 251.2;
    const scorePercentage = Math.min((stats.currentScore / stats.targetScore) * 100, 100);
    const strokeDashoffset = circleCircumference - (scorePercentage / 100) * circleCircumference;

    // Hàm xử lý khi click "Học tiếp"
    const handleContinueClick = () => {
        if (inProgressPractice) {
            navigate(`/practice/${inProgressPractice.attemptId}`);
        } else {
            navigate('/practice/list');
        }
    };

    return (
        <div className="bento-dashboard-wrapper container">
            <div className="bento-grid">
                {/* 1. HERO CARD */}
                <div className="bento-card card-hero">
                    <div className="hero-top">
                        <div className="hero-badge">👋 Chào buổi sáng</div>
                        <div
                            className="hero-badge"
                            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                        >
                            {stats.rank}
                        </div>
                    </div>
                    <div className="hero-main">
                        <h1>{stats.name}<br />Kỷ luật tạo nên sự vĩ đại.</h1>
                        <p>Bạn đã hoàn thành 80% lộ trình tuần này. Chỉ còn 1 bài Mock Test nữa là đột phá điểm số!</p>
                    </div>
                </div>

                {/* 2. STATS CARD */}
                <div className="bento-card card-stats">
                    <h3 style={{ marginBottom: '20px', fontSize: '15px', color: 'var(--text-muted)', width: '100%', textAlign: 'left' }}>
                        Mục tiêu: {stats.targetScore} TOEIC
                    </h3>
                    <div className="circular-chart">
                        <svg viewBox="0 0 100 100">
                            <circle className="circle-bg" cx="50" cy="50" r="40" />
                            <circle
                                className="circle-fill"
                                cx="50" cy="50" r="40"
                                style={{ strokeDasharray: circleCircumference, strokeDashoffset: strokeDashoffset }}
                            />
                        </svg>
                        <div className="chart-text">
                            <h2>{stats.currentScore}</h2>
                            <span>Điểm</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)', margin: 0 }}>
                        +15 điểm so với tuần trước 🚀
                    </p>
                </div>

                {/* 3. CONTINUE LEARNING */}
                <div className="bento-card card-continue">
                    <div className="continue-img">🎧</div>
                    <div className="continue-info">
                        {inProgressPractice ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        Đang làm dở
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        {inProgressPractice.progress}%
                                    </span>
                                </div>
                                <h3>{inProgressPractice.title}</h3>
                                <p>{inProgressPractice.subtitle || 'Tiếp tục luyện tập'}</p>
                                <div className="progress-bar">
                                    <div style={{ width: `${inProgressPractice.progress}%` }}></div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        Luyện tập ngay
                                    </span>
                                </div>
                                <h3>Chưa có bài học nào</h3>
                                <p>Hãy bắt đầu luyện tập với các part phù hợp với bạn.</p>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleContinueClick}
                        style={{ background: 'var(--text-main)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        {inProgressPractice ? 'Học tiếp →' : 'Bắt đầu học →'}
                    </button>
                </div>

                {/* 4. DAILY QUEST */}
                <div className="bento-card card-quest">
                    <h3 style={{ fontSize: '15px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎯 Nhiệm vụ hôm nay
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="quest-item">
                            <div className="checkbox done">✓</div>
                            <span>Luyện 50 từ vựng mới</span>
                        </div>
                        <div className="quest-item" style={{ opacity: 0.6 }}>
                            <div className="checkbox"></div>
                            <span>Làm 1 Mini Test Reading</span>
                        </div>
                    </div>
                </div>

                {/* 5. STREAK CARD */}
                <div className="bento-card card-streak">
                    <p>CHUỖI KỶ LỤC</p>
                    <h2>{stats.streak} <span style={{ fontSize: '24px' }}>🔥</span></h2>
                    <div className="streak-days">
                        {stats.streakHistory.map((isActive, index) => (
                            <div key={index} className={`day-dot ${isActive ? 'active' : ''}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BentoDashboard;