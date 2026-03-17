// ExamAnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Progress, Tag, Spin, Empty,
  Typography, Statistic, Tooltip, Badge
} from 'antd';
import {
  RiseOutlined, FallOutlined, TrophyOutlined,
  FireOutlined, BulbOutlined, LineChartOutlined,
  CheckCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import './style.scss';
import { examAttemptService } from '../../services/examAttemptApi';
import type { ExamAnalyticsDto, PartAnalyticsDto } from '../../../../pages/Student/FullTest/examAttempt.types';

const { Title, Text } = Typography;

// ── Helpers ───────────────────────────────────────────────────
const levelConfig = {
  Strong:  { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: 'Tốt' },
  Average: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', label: 'Trung bình' },
  Weak:    { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', label: 'Cần cải thiện' },
};

const priorityConfig = {
  High:   { color: 'red',    icon: '🔴' },
  Medium: { color: 'orange', icon: '🟡' },
  Low:    { color: 'blue',   icon: '🔵' },
};

const PartCard: React.FC<{ part: PartAnalyticsDto }> = ({ part }) => {
  const cfg = levelConfig[part.level as keyof typeof levelConfig] ?? levelConfig.Average;
  const isUp = part.trendPercent > 0;
  const isDown = part.trendPercent < 0;

  return (
    <div className="part-card" style={{ borderColor: cfg.border, background: cfg.bg }}>
      <div className="part-card__header">
        <div>
          <span className="part-card__name">{part.partName}</span>
          <Tag color={part.skill === 'Listening' ? 'blue' : 'green'}
            style={{ marginLeft: 6, fontSize: 11 }}>
            {part.skill}
          </Tag>
        </div>
        <Tag color={cfg.color} style={{ border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </Tag>
      </div>

      <div className="part-card__progress">
        <Progress
          percent={part.accuracyPercent}
          strokeColor={cfg.color}
          trailColor="#f0f0f0"
          size="small"
          format={p => <span style={{ color: cfg.color, fontWeight: 600 }}>{p}%</span>}
        />
      </div>

      <div className="part-card__footer">
        <Text type="secondary" style={{ fontSize: 12 }}>
          {part.totalCorrect}/{part.totalAttempted} câu đúng
        </Text>
        {part.trendPercent !== 0 && (
          <span className={`trend ${isUp ? 'up' : 'down'}`}>
            {isUp ? <RiseOutlined /> : <FallOutlined />}
            {Math.abs(part.trendPercent)}%
          </span>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const ExamAnalyticsDashboard: React.FC = () => {
  const [data, setData]       = useState<ExamAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examAttemptService.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="analytics-center"><Spin size="large" /></div>
  );

  if (!data || data.totalAttempts === 0) return (
    <Empty
      description="Chưa có dữ liệu phân tích. Hãy làm ít nhất 1 bài thi!"
      style={{ padding: 60 }}
    />
  );

  const listeningParts = data.partAnalytics.filter(p => p.skill === 'Listening');
  const readingParts   = data.partAnalytics.filter(p => p.skill === 'Reading');

  const listeningAvg = listeningParts.length > 0
    ? Math.round(listeningParts.reduce((s, p) => s + p.accuracyPercent, 0) / listeningParts.length)
    : 0;
  const readingAvg = readingParts.length > 0
    ? Math.round(readingParts.reduce((s, p) => s + p.accuracyPercent, 0) / readingParts.length)
    : 0;

  return (
    <div className="analytics-dashboard">

      {/* ── Tổng quan ── */}
      <div className="analytics-section">
        <Title level={4} className="section-title">
          <LineChartOutlined /> Tổng quan
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="Số lần thi"
                value={data.totalAttempts}
                prefix={<TrophyOutlined style={{ color: '#1677ff' }} />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="Điểm TB (%)"
                value={data.averageScore}
                suffix="%"
                prefix={<LineChartOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="Điểm cao nhất"
                value={data.bestScore}
                suffix="%"
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="Lần thi gần nhất"
                value={data.latestScore}
                suffix="%"
                prefix={
                  data.scoreTrend >= 0
                    ? <RiseOutlined style={{ color: '#52c41a' }} />
                    : <FallOutlined  style={{ color: '#ff4d4f' }} />
                }
                valueStyle={{ color: data.scoreTrend >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
              {data.scoreTrend !== 0 && (
                <div className={`trend-badge ${data.scoreTrend > 0 ? 'up' : 'down'}`}>
                  {data.scoreTrend > 0 ? '+' : ''}{data.scoreTrend}% so với lần trước
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* ── Biểu đồ lịch sử ── */}
      {data.scoreHistory.length > 1 && (
        <div className="analytics-section">
          <Title level={4} className="section-title">
            <LineChartOutlined /> Xu hướng điểm số
          </Title>
          <Card className="history-chart-card">
            <div className="chart-container">
              {data.scoreHistory.map((h, i) => (
                <Tooltip
                  key={i}
                  title={
                    <div>
                      <div>{h.examTitle}</div>
                      <div>{new Date(h.attemptDate).toLocaleDateString('vi-VN')}</div>
                      <div style={{ fontWeight: 700 }}>{h.percent}%</div>
                    </div>
                  }
                >
                  <div className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(h.percent, 4)}%`,
                        background: h.percent >= 70 ? '#52c41a'
                          : h.percent >= 50 ? '#1677ff' : '#ff4d4f',
                      }}
                    />
                    <div className="chart-label">
                      {new Date(h.attemptDate).toLocaleDateString('vi-VN', {
                        month: 'numeric', day: 'numeric'
                      })}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Listening vs Reading ── */}
      <div className="analytics-section">
        <Title level={4} className="section-title">
          <FireOutlined /> Kỹ năng tổng thể
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card className="skill-card listening">
              <div className="skill-header">
                <span>🎧 Listening</span>
                <Tag color="blue">{listeningAvg}%</Tag>
              </div>
              <Progress
                percent={listeningAvg}
                strokeColor="#1677ff"
                size="default"
              />
              <div className="skill-parts">
                {listeningParts.map(p => (
                  <div key={p.partName} className="skill-part-row">
                    <span>{p.partName}</span>
                    <Progress
                      percent={p.accuracyPercent}
                      size="small"
                      strokeColor={levelConfig[p.level as keyof typeof levelConfig]?.color}
                      style={{ flex: 1, margin: '0 8px' }}
                      showInfo={false}
                    />
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: levelConfig[p.level as keyof typeof levelConfig]?.color
                    }}>
                      {p.accuracyPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="skill-card reading">
              <div className="skill-header">
                <span>📖 Reading</span>
                <Tag color="green">{readingAvg}%</Tag>
              </div>
              <Progress
                percent={readingAvg}
                strokeColor="#52c41a"
                size="default"
              />
              <div className="skill-parts">
                {readingParts.map(p => (
                  <div key={p.partName} className="skill-part-row">
                    <span>{p.partName}</span>
                    <Progress
                      percent={p.accuracyPercent}
                      size="small"
                      strokeColor={levelConfig[p.level as keyof typeof levelConfig]?.color}
                      style={{ flex: 1, margin: '0 8px' }}
                      showInfo={false}
                    />
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: levelConfig[p.level as keyof typeof levelConfig]?.color
                    }}>
                      {p.accuracyPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ── Chi tiết từng Part ── */}
      <div className="analytics-section">
        <Title level={4} className="section-title">
          <FireOutlined /> Chi tiết từng phần
        </Title>
        <div className="parts-grid">
          {data.partAnalytics.map(p => (
            <PartCard key={p.partName} part={p} />
          ))}
        </div>
      </div>

      {/* ── Điểm mạnh / Điểm yếu ── */}
      <Row gutter={[16, 16]} className="analytics-section">
        {data.strengths.length > 0 && (
          <Col xs={24} sm={12}>
            <Card className="insight-card strength">
              <div className="insight-header">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Điểm mạnh</span>
              </div>
              {data.strengths.map(s => (
                <div key={s} className="insight-item">
                  <Badge color="#52c41a" text={s} />
                </div>
              ))}
            </Card>
          </Col>
        )}
        {data.weaknesses.length > 0 && (
          <Col xs={24} sm={12}>
            <Card className="insight-card weakness">
              <div className="insight-header">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Cần cải thiện</span>
              </div>
              {data.weaknesses.map(w => (
                <div key={w} className="insight-item">
                  <Badge color="#ff4d4f" text={w} />
                </div>
              ))}
            </Card>
          </Col>
        )}
      </Row>

      {/* ── Lộ trình cải thiện ── */}
      {data.suggestions.length > 0 && (
        <div className="analytics-section">
          <Title level={4} className="section-title">
            <BulbOutlined /> Lộ trình cải thiện
          </Title>
          <div className="suggestions">
            {data.suggestions.map((s, i) => {
              const pCfg = priorityConfig[s.priority as keyof typeof priorityConfig];
              return (
                <Card key={i} className="suggestion-card">
                  <div className="suggestion-header">
                    <span>{pCfg.icon}</span>
                    <Tag color={pCfg.color}>{s.priority} Priority</Tag>
                    <span className="suggestion-part">{s.partName}</span>
                  </div>
                  <p className="suggestion-msg">{s.message}</p>
                  <a href={s.actionUrl} className="suggestion-link">
                    → Luyện tập ngay
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAnalyticsDashboard;