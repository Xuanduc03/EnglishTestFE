import React, { useEffect, useState } from 'react';
import './BentoDashboard.scss';
import { useNavigate } from 'react-router-dom';
import type { InProgressPracticeDto, UserDashboardStats } from './headerdash.types';
import { api } from '../../../../configs/axios-custom';
import { Spin } from 'antd';

const BentoDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [inProgressPractice, setInProgressPractice] = useState<InProgressPracticeDto | null>(null);
    const [loadingPractice, setLoadingPractice] = useState(true);

    const [dashboardInfo, setDashboardInfo] = useState<UserDashboardStats | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                const response = await api.get('/api/dashboard/info');
                if (response.data.success) setDashboardInfo(response.data.data);
                else setError('Unable to load user information');
            } catch {
                setError('Unable to load user information');
            } finally {
                setLoadingInfo(false);
            }
        };
        fetchDashboardInfo();
    }, []);

    useEffect(() => {
        const fetchInProgress = async () => {
            try {
                const response = await api.get('/api/practice/in-progress');
                if (response.data.success && response.data.data)
                    setInProgressPractice(response.data.data);
            } catch {
                // silent — không có bài dở là bình thường
            } finally {
                setLoadingPractice(false);
            }
        };
        fetchInProgress();
    }, []);

    if (loadingInfo || loadingPractice) {
        return (
            <div className="bento-dashboard-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 360 }}>
                <Spin tip="Loading..." />
            </div>
        );
    }

    if (error || !dashboardInfo) {
        return (
            <div className="bento-dashboard-wrapper" style={{ textAlign: 'center', padding: 50 }}>
                <p style={{ color: '#EF4444', marginBottom: 12 }}>{error ?? 'No data available'}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    const stats = dashboardInfo;

    // Circular progress
    const circumference = 251.2;
    const pct = Math.min((stats.currentScore / stats.targetScore) * 100, 100);
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    const handleContinue = () => {
        navigate(inProgressPractice
            ? `/practice/session/${inProgressPractice.attemptId}`
            : '/practice/list'
        );
    };

    return (
        <div className="bento-dashboard-wrapper">
            <div className="bento-grid">

                {/* ── 1. Hero ─────────────────────────────────── */}
                <div className="bento-card card-hero">
                    <div className="hero-top">
                        <span className="hero-badge">👋 Good morning</span>
                        <span
                            className="hero-badge"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', borderColor: 'rgba(245,158,11,0.25)' }}
                        >
                            {stats.rank}
                        </span>
                    </div>
                    <div className="hero-main">
                        <h1>
                            {stats.name}<br />
                            Discipline creates greatness.
                        </h1>
                        <p>View results and analyze your learning path to improve your score every day!</p>
                        <button
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.15)',
                                padding: '10px 18px',
                                borderRadius: 10,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                marginTop: 16,
                            }}
                            onClick={() => navigate('/my-learning')}
                        >
                            Learning Path Analysis →
                        </button>
                    </div>
                </div>

                {/* ── 2. Stats ─────────────────────────────────── */}
                <div className="bento-card card-stats">
                    <div className="stats-title">
                        Target: {stats.targetScore} TOEIC
                    </div>
                    <div className="circular-chart">
                        <svg viewBox="0 0 100 100">
                            <circle className="circle-bg" cx="50" cy="50" r="40" />
                            <circle
                                className="circle-fill"
                                cx="50" cy="50" r="40"
                                style={{ strokeDasharray: circumference, strokeDashoffset }}
                            />
                        </svg>
                        <div className="chart-text">
                            <h2>{stats.currentScore}</h2>
                            <span>/ {stats.targetScore}</span>
                        </div>
                    </div>
                    <div className="stats-progress-label">
                        <strong>{Math.round(pct)}%</strong> of goal achieved
                    </div>
                    <div className="stats-delta">+15 pts vs last week 🚀</div>
                </div>

                {/* ── 3. Continue ──────────────────────────────── */}
                <div className="bento-card card-continue">
                    <div className="continue-img">🎧</div>
                    <div className="continue-info">
                        <div className="continue-status">
                            <span className="continue-label">
                                {inProgressPractice ? 'In Progress' : 'Start Practicing'}
                            </span>
                            {inProgressPractice && (
                                <span className="continue-pct">{inProgressPractice.progress}%</span>
                            )}
                        </div>
                        <h3>
                            {inProgressPractice?.title ?? 'No current lesson'}
                        </h3>
                        <p>
                            {inProgressPractice?.subtitle ?? 'Start practicing with parts that match your skill level.'}
                        </p>
                        {inProgressPractice && (
                            <div className="progress-bar">
                                <div style={{ width: `${inProgressPractice.progress}%` }} />
                            </div>
                        )}
                    </div>
                    <button className="btn-continue" onClick={handleContinue}>
                        {inProgressPractice ? 'Continue →' : 'Start →'}
                    </button>
                </div>

                {/* ── 4. Daily quest ───────────────────────────── */}
                <div className="bento-card card-quest">
                    <div className="quest-title">
                        <span className="quest-icon">🎯</span>
                        Daily Quests
                    </div>
                    <div className="quest-items">
                        <div className="quest-item done">
                            <div className="checkbox done">✓</div>
                            <span>Practice 50 new vocabulary words</span>
                        </div>
                        <div className="quest-item">
                            <div className="checkbox" />
                            <span>Complete 1 Mini Reading Test</span>
                        </div>
                    </div>
                </div>

                {/* ── 5. Streak ────────────────────────────────── */}
                <div className="bento-card card-streak">
                    <div className="streak-label">Streak Record</div>
                    <div className="streak-count">
                        {stats.streak}
                        <span className="streak-fire">🔥</span>
                    </div>
                    <div className="streak-days">
                        {stats.streakHistory.map((isActive: boolean, i: number) => (
                            <div
                                key={i}
                                className={`day-dot ${isActive ? 'active' : ''}`}
                                title={`Day ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="streak-hint">Last 7 days</div>
                </div>

            </div>
        </div>
    );
};

export default BentoDashboard;