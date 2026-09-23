import React from 'react';
import { Card, Row, Col, Progress, Statistic, Button, Typography, Space, Divider, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  RedoOutlined,
  FileSearchOutlined,
  TrophyTwoTone,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ResultPage.scss';
import type { SubmitExamResult } from '../../../../pages/Student/FullTest/examAttempt.types';

const { Title, Text } = Typography;

// ── Helpers ───────────────────────────────────────────────────
const LISTENING_PARTS = ['Part 1', 'Part 2', 'Part 3', 'Part 4'];
const READING_PARTS = ['Part 5', 'Part 6', 'Part 7'];
const PART_ORDER = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5', 'Part 6', 'Part 7'];
const MAX_TOEIC_SKILL = 495;
const MAX_TOEIC_TOTAL = 990;

const getScoreColor = (pct: number) => {
  if (pct >= 80) return '#52c41a';
  if (pct >= 60) return '#1677ff';
  if (pct >= 40) return '#faad14';
  return '#ff4d4f';
};

// ── Props ─────────────────────────────────────────────────────
interface ResultPageProps {
  result: SubmitExamResult;   // dùng đúng type từ types chung
  attemptId: string;
}

// ── Component ─────────────────────────────────────────────────
const ResultPage: React.FC<ResultPageProps> = ({ result, attemptId }) => {
  const navigate = useNavigate();

  const {
    listeningCorrect,
    listeningScore,
    readingCorrect,
    readingScore,
    totalScore,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    durationSeconds,
    totalQuestions,
    partSummaries,
  } = result;

  // % cho progress circles — theo thang TOEIC
  const listeningPercent = Math.round(listeningScore / MAX_TOEIC_SKILL * 100);
  const readingPercent = Math.round(readingScore / MAX_TOEIC_SKILL * 100);
  const totalPercent = Math.round(totalScore / MAX_TOEIC_TOTAL * 100);

  const minutesSpent = Math.floor(durationSeconds / 60);
  const secondsLeft = durationSeconds % 60;

  const sortedParts = [...partSummaries].sort(
    (a, b) => PART_ORDER.indexOf(a.partName) - PART_ORDER.indexOf(b.partName)
  );

  // Tổng câu Listening / Reading
  const listeningTotal = partSummaries
    .filter(p => LISTENING_PARTS.includes(p.partName))
    .reduce((s, p) => s + p.total, 0);
  const readingTotal = partSummaries
    .filter(p => READING_PARTS.includes(p.partName))
    .reduce((s, p) => s + p.total, 0);

  return (
    <div className="result-page">
      <div className="result-container">

        {/* Header */}
        <div className="result-header">
          <TrophyTwoTone twoToneColor="#fadb14" style={{ fontSize: 64, marginBottom: 16 }} />
          <Title level={2} className="gradient-text">Test Completed!</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Congratulations on completing the test. Below are your detailed results.
          </Text>
        </div>

        <Divider />

        {/* Điểm 3 vòng tròn — dùng trực tiếp từ ScoreTable */}
        <Row gutter={[24, 24]} justify="center" className="main-scores">

          <Col xs={24} sm={8}>
            <Card bordered={false} className="score-card listening-card">
              <Text strong className="score-label">LISTENING</Text>
              <Progress
                type="dashboard"
                percent={listeningPercent}
                format={() => (
                  <span>
                    <span style={{ fontSize: 28, fontWeight: 700 }}>{listeningScore}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>/495</span>
                  </span>
                )}
                strokeColor="#1677ff"
                size={130}
              />
              <div className="score-detail">
                {listeningCorrect}/{listeningTotal} correct
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="score-card total-card">
              <Text strong className="score-label">TOTAL TOEIC SCORE</Text>
              <Progress
                type="dashboard"
                percent={totalPercent}
                format={() => (
                  <span>
                    <span style={{ fontSize: 32, fontWeight: 700 }}>{totalScore}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>/990</span>
                  </span>
                )}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                size={160}
              />
              <div className="score-detail">
                Listening {listeningScore} + Reading {readingScore}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="score-card reading-card">
              <Text strong className="score-label">READING</Text>
              <Progress
                type="dashboard"
                percent={readingPercent}
                format={() => (
                  <span>
                    <span style={{ fontSize: 28, fontWeight: 700 }}>{readingScore}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>/495</span>
                  </span>
                )}
                strokeColor="#52c41a"
                size={130}
              />
              <div className="score-detail">
                {readingCorrect}/{readingTotal} correct
              </div>
            </Card>
          </Col>

        </Row>

        {/* Thống kê nhanh */}
        <div className="quick-stats-wrapper">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} className="stat-box correct">
                <Statistic
                  title="Correct"
                  value={correctAnswers}
                  suffix={`/ ${totalQuestions}`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#389e0d' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} className="stat-box incorrect">
                <Statistic
                  title="Incorrect"
                  value={wrongAnswers}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} className="stat-box skipped">
                <Statistic
                  title="Skipped"
                  value={skippedAnswers}
                  prefix={<MinusCircleOutlined />}
                  valueStyle={{ color: '#8c8c8c' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} className="stat-box time">
                <Statistic
                  title="Time Spent"
                  value={`${minutesSpent}:${String(secondsLeft).padStart(2, '0')}`}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#0958d9' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Chi tiết từng Part */}
        {sortedParts.length > 0 && (
          <div className="parts-breakdown">
            <Title level={4} style={{ marginBottom: 20 }}>Breakdown by Part</Title>
            {sortedParts.map((part, idx) => {
              const pct = part.total > 0
                ? Math.round(part.correct / part.total * 100)
                : 0;
              const isListening = LISTENING_PARTS.includes(part.partName);
              return (
                <div key={idx} className="part-row">
                  <div className="part-name">
                    <Text strong>{part.partName}</Text>
                    <Tag
                      color={isListening ? 'blue' : 'green'}
                      style={{ marginLeft: 6 }}
                    >
                      {isListening ? 'Listening' : 'Reading'}
                    </Tag>
                    <Text type="secondary" className="part-ratio">
                      {part.correct}/{part.total} correct
                    </Text>
                  </div>
                  <Progress
                    percent={pct}
                    strokeColor={getScoreColor(pct)}
                    status={pct === 100 ? 'success' : 'active'}
                    format={p => `${p}%`}
                  />
                </div>
              );
            })}
          </div>
        )}

        <Divider />

        {/* Nút hành động */}
        <Space size="large" className="action-buttons" wrap>
          <Button
            type="primary"
            danger
            size="large"
            icon={<FileSearchOutlined />}
            onClick={() => navigate(`/full-test/${attemptId}/review`)}
          >
            Review Answers
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RedoOutlined />}
            onClick={() => navigate('/full-test')}
          >
            Take Another Test
          </Button>
        </Space>

      </div>
    </div>
  );
};

export default ResultPage;
