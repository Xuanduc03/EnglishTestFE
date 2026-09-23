// AdminDashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler,
  Tooltip as ChartTooltip, Legend,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import './Dashboard.scss';
import type {
  DashboardStatsDto, UserGrowthDto, ExamSubmissionStatsDto,
  ScoreDistributionDto, PassRateDto, CompletionTimeDto,
  TopExamDto, TopUserDto, SkillStatsDto, RecentActivityDto,
  DateRangeParams
} from './types/adminStats.types';
import { adminStatsService, getPresetRange } from './services/adminStats.service';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler,
  ChartTooltip, Legend,
);

// ── Chart defaults ──────────────────────────────────────────────
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, tooltip: {
      backgroundColor: '#1e293b', titleColor: '#94a3b8',
      bodyColor: '#f1f5f9', borderColor: '#334155', borderWidth: 1,
      padding: 10, cornerRadius: 8, titleFont: { family: 'Bricolage Grotesque' },
      bodyFont: { family: 'JetBrains Mono', size: 12 },
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
  },
};
const NO_SCALE_OPTS = { ...BASE_OPTS, scales: undefined };

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (n?: number) => n == null ? '—' : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toLocaleString('vi-VN');
const pct = (n?: number) => n == null ? '—' : `${(n * 100).toFixed(1)}%`;
const signStr = (n?: number) => n == null ? '' : `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const relTime = (iso: string) => {
  const m = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${Math.floor(m)}p trước`;
  return `${Math.floor(m / 60)}h trước`;
};
const AVATAR_COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#7c3aed', '#db2777'];

// ── Types ─────────────────────────────────────────────────────────
type Preset = '7d' | '30d' | '90d' | '1y';

interface DashboardState {
  overview: DashboardStatsDto | null;
  userGrowth: UserGrowthDto | null;
  submissions: ExamSubmissionStatsDto | null;
  scoreDistribution: ScoreDistributionDto | null;
  passRate: PassRateDto[];
  completionTime: CompletionTimeDto | null;
  topExams: TopExamDto[];
  topUsers: TopUserDto[];
  skillStats: SkillStatsDto[];
  recentActivity: RecentActivityDto[];
}

const EMPTY: DashboardState = {
  overview: null, userGrowth: null, submissions: null,
  scoreDistribution: null, passRate: [], completionTime: null,
  topExams: [], topUsers: [], skillStats: [], recentActivity: [],
};

// ── Sub-components ────────────────────────────────────────────────
interface KpiProps {
  label: string; value: string; sub: string;
  growth?: number; icon: string;
  variant: 'blue' | 'indigo' | 'amber' | 'green';
}
const KpiCard: React.FC<KpiProps> = ({ label, value, sub, growth, icon, variant }) => (
  <div className={`kpi-card kpi-card--${variant} fade-up`}>
    <div className={`kpi-card__icon kpi-card__icon--${variant}`}>{icon}</div>
    <div className="kpi-card__label">{label}</div>
    <div className="kpi-card__value">{value}</div>
    <div className="kpi-card__footer">
      {growth !== undefined && (
        <span className={`badge ${growth >= 0 ? 'badge--up' : 'badge--down'}`}>
          {signStr(growth)}
        </span>
      )}
      <span className="kpi-card__sub">{sub}</span>
    </div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode; color?: string; extra?: string }> =
  ({ children, color = '#2563eb', extra }) => (
    <div className="sec-title">
      <div className="sec-title__bar" style={{ background: color }} />
      <h3>{children}</h3>
      {extra && <span className="sec-title__extra">{extra}</span>}
    </div>
  );

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> =
  ({ children, style }) => <div className="card" style={style}>{children}</div>;

// ── Main component ────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [preset, setPreset] = useState<Preset>('30d');
  const [data, setData] = useState<DashboardState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Preset) => {
    setLoading(true);
    setError(null);
    try {
      const filter: DateRangeParams = getPresetRange(p);
      const result = await adminStatsService.loadDashboardAll(filter);
      setData(result);
    } catch (e) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(preset); }, [preset, load]);

  // ── Chart data builders ─────────────────────────────────────────
  const userGrowthChart = useMemo(() => {
    const pts = data.userGrowth?.newUsers ?? [];
    return {
      labels: pts.map(p => p.label),
      datasets: [{
        label: 'User mới', data: pts.map(p => p.value),
        borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.08)',
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
      }],
    };
  }, [data.userGrowth]);

  const submissionsChart = useMemo(() => {
    const s = data.submissions?.submissions ?? [];
    const c = data.submissions?.completions ?? [];
    return {
      labels: s.map(p => p.label),
      datasets: [
        {
          label: 'Lượt thi', data: s.map(p => p.value),
          borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.07)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
        },
        {
          label: 'Hoàn thành', data: c.map(p => p.value),
          borderColor: '#10b981', backgroundColor: 'transparent',
          fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5,
          borderDash: [5, 3],
        },
      ],
    };
  }, [data.submissions]);

  const scoreDistChart = useMemo(() => {
    const b = data.scoreDistribution?.buckets ?? [];
    const max = Math.max(...b.map(x => x.count), 1);
    return {
      labels: b.map(x => x.label),
      datasets: [{
        label: 'Lượt',
        data: b.map(x => x.count),
        backgroundColor: b.map((_, i) => {
          const t = i / (b.length - 1);
          const r = Math.round(37 + t * 34);
          const g = Math.round(99 + t * 77);
          const bl = Math.round(235 - t * 95);
          return `rgba(${r},${g},${bl},0.8)`;
        }),
        borderRadius: 5,
        borderSkipped: false,
      }],
    };
  }, [data.scoreDistribution]);

  const radarChart = useMemo(() => {
    const s = data.skillStats ?? [];
    return {
      labels: s.map(x => x.partName),
      datasets: [{
        label: 'Độ chính xác (%)',
        data: s.map(x => x.avgAccuracy),
        backgroundColor: 'rgba(37,99,235,.12)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
      }],
    };
  }, [data.skillStats]);

  const timeChart = useMemo(() => {
    const pts = data.completionTime?.byDay ?? [];
    return {
      labels: pts.map(p => p.label),
      datasets: [{
        label: 'Thời gian (phút)',
        data: pts.map(p => p.value),
        borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.07)',
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
      }],
    };
  }, [data.completionTime]);

  const ov = data.overview;
  const now = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ── Skeleton ────────────────────────────────────────────────────
  if (loading) return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div><p className="dashboard-header__title">Thống kê tổng quan</p><p className="dashboard-header__sub">{now}</p></div>
      </div>
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
      <div className="charts-r2">
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
      </div>
      <div className="charts-r3">
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 240 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>{error}</p>
        <button className="preset-btn" onClick={() => load(preset)}>Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Thống kê tổng quan</h1>
          <p className="dashboard-header__sub">{now}</p>
        </div>
        <div className="dashboard-header__controls">
          {(['7d', '30d', '90d', '1y'] as Preset[]).map(p => (
            <button
              key={p}
              className={`preset-btn${preset === p ? ' preset-btn--active' : ''}`}
              onClick={() => setPreset(p)}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Người dùng" value={fmt(ov?.totalUsers)} sub={`+${ov?.newUsersToday ?? 0} hôm nay`} growth={ov?.userGrowthPct} icon="👥" variant="blue" />
        <KpiCard label="Lượt thi" value={fmt(ov?.totalAttempts)} sub={`${ov?.attemptsToday ?? 0} hôm nay`} growth={ov?.attemptGrowthPct} icon="📝" variant="indigo" />
        <KpiCard label="Điểm trung bình" value={String(ov?.averageScore ?? '—')} sub="thang điểm 990" growth={ov?.scoreGrowthPct} icon="📊" variant="amber" />
        <KpiCard label="Tỷ lệ pass" value={pct(ov?.passRate)} sub={`TB ${ov?.avgCompletionMins ?? '—'} phút`} icon="✅" variant="green" />
      </div>

      {/* Row 1: user growth + submissions */}
      <div className="charts-r2">
        <Card>
          <SectionTitle extra={`+${fmt(data.userGrowth?.totalNewUsers)} kỳ này`}>Tăng trưởng người dùng</SectionTitle>
          <div style={{ height: 180 }}>
            <Line data={userGrowthChart} options={BASE_OPTS as any} />
          </div>
        </Card>
        <Card>
          <SectionTitle color="#6366f1" extra={`${fmt(data.submissions?.totalSubmitted)} nộp`}>Lượt thi / Hoàn thành</SectionTitle>
          <div style={{ height: 180 }}>
            <Line data={submissionsChart} options={{ ...BASE_OPTS, plugins: { ...BASE_OPTS.plugins, legend: { display: true, labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 12 } } } } as any} />
          </div>
        </Card>
      </div>

      {/* Row 2: score dist + radar */}
      <div className="charts-r3">
        <Card>
          <SectionTitle color="#f59e0b">Phân bổ điểm số (TOEIC 990)</SectionTitle>
          <div className="score-meta">
            {[['TB', data.scoreDistribution?.mean], ['Trung vị', data.scoreDistribution?.median], ['Độ lệch chuẩn', data.scoreDistribution?.stdDev], ['Tổng', data.scoreDistribution?.totalAttempts]].map(([k, v]) => (
              <div className="score-meta-item" key={String(k)}>
                <div className="score-meta-item__label">{k}</div>
                <div className="score-meta-item__val">{v?.toLocaleString('vi-VN') ?? '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 150 }}>
            <Bar data={scoreDistChart} options={{ ...BASE_OPTS, plugins: { ...BASE_OPTS.plugins } } as any} />
          </div>
        </Card>
        <Card>
          <SectionTitle color="#0891b2">Độ chính xác theo Part</SectionTitle>
          <div style={{ height: 220 }}>
            <Radar data={radarChart} options={{
              ...NO_SCALE_OPTS,
              scales: {
                r: {
                  grid: { color: '#f1f5f9' },
                  ticks: { display: false },
                  pointLabels: { color: '#64748b', font: { size: 11, family: 'Bricolage Grotesque' } },
                  suggestedMin: 0, suggestedMax: 100,
                }
              },
            } as any} />
          </div>
        </Card>
      </div>

      {/* Row 3: pass rate + completion time */}
      <div className="charts-r3">
        <Card>
          <SectionTitle color="#10b981">Tỷ lệ pass theo đề thi</SectionTitle>
          {data.passRate.slice(0, 7).map(e => (
            <div className="pass-row" key={e.examId}>
              <div className="pass-row__label" title={e.examTitle}>{e.examTitle}</div>
              <div className="pass-row__track">
                <div
                  className={`pass-row__fill pass-row__fill--${e.passRate >= .7 ? 'high' : e.passRate >= .5 ? 'mid' : 'low'}`}
                  style={{ width: `${(e.passRate * 100).toFixed(0)}%` }}
                />
              </div>
              <div className="pass-row__pct">{pct(e.passRate)}</div>
              <div className="pass-row__count">{fmt(e.total)}</div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle color="#f59e0b">Thời gian làm bài</SectionTitle>
          <div className="stat3">
            <div className="stat3-item">
              <div className="stat3-item__label">Trung bình</div>
              <div className="stat3-item__val" style={{ color: '#2563eb' }}>
                {data.completionTime?.avgMinutes ?? '—'}<span className="stat3-item__unit">p</span>
              </div>
            </div>
            <div className="stat3-item">
              <div className="stat3-item__label">Trung vị</div>
              <div className="stat3-item__val" style={{ color: '#0891b2' }}>
                {data.completionTime?.medianMinutes ?? '—'}<span className="stat3-item__unit">p</span>
              </div>
            </div>
            <div className="stat3-item">
              <div className="stat3-item__label">P90</div>
              <div className="stat3-item__val" style={{ color: '#f59e0b' }}>
                {data.completionTime?.p90Minutes ?? '—'}<span className="stat3-item__unit">p</span>
              </div>
            </div>
          </div>
          <div style={{ height: 110 }}>
            <Line data={timeChart} options={BASE_OPTS as any} />
          </div>
        </Card>
      </div>

      {/* Row 4: top exams + top users + activity */}
      <div className="charts-r4">
        {/* Top exams */}
        <Card>
          <SectionTitle color="#f59e0b">Top đề thi</SectionTitle>
          {data.topExams.slice(0, 6).map((e, i) => (
            <div className="row-item" key={e.examId}>
              <span className={`row-item__rank${i < 3 ? ' row-item__rank--top' : ''}`}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-item__title" title={e.title}>{e.title}</div>
                <div className="row-item__sub">{fmt(e.attemptCount)} lượt · TB {e.avgScore}</div>
              </div>
              <span className="row-item__score" style={{
                color: e.passRate >= .7 ? '#10b981' : e.passRate >= .5 ? '#f59e0b' : '#ef4444',
              }}>{pct(e.passRate)}</span>
            </div>
          ))}
        </Card>

        {/* Top users */}
        <Card>
          <SectionTitle>Top học viên</SectionTitle>
          {data.topUsers.slice(0, 6).map((u, i) => (
            <div className="row-item" key={u.userId}>
              <div className="avatar" style={{
                background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '1a',
                color: AVATAR_COLORS[i % AVATAR_COLORS.length],
              }}>{u.fullName.slice(-1)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-item__title">{u.fullName}</div>
                <div className="row-item__sub">{u.attemptCount} bài · Best {u.bestScore}</div>
              </div>
              <span className="row-item__score">{u.avgScore}</span>
            </div>
          ))}
        </Card>

        {/* Recent activity */}
        <Card>
          <SectionTitle color="#10b981">Hoạt động gần đây</SectionTitle>
          {data.recentActivity.slice(0, 9).map((a, i) => (
            <div className="activity-item" key={i}>
              <div className={`activity-dot activity-dot--${a.action}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                  <span className="activity-name">{a.userName}</span>
                  <span className="activity-action">{a.action === 'submitted' ? 'nộp bài' : 'đăng ký'}</span>
                  {a.score != null && <span className="activity-score"> {a.score}</span>}
                </div>
                {a.examTitle && <div className="activity-exam">{a.examTitle}</div>}
              </div>
              <div className="activity-time">{relTime(a.occuredAt)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;