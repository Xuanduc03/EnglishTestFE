import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, Table, Button, Statistic, Row, Col, Divider } from 'antd';
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  RedoOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import './PracticeResult.scss';
import type { PartResultDto, PracticeResultDto } from '../Types/practice.type';
import { PracticeService } from '../Services/practice.service';

// Helper: format TimeSpan "00:18:30" → "18m 30s"
const formatDuration = (timeSpan: string): string => {
  if (!timeSpan) return '0s';
  const parts = timeSpan.split(':');
  if (parts.length !== 3) return timeSpan;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const result: string[] = [];
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0 || result.length === 0) result.push(`${seconds}s`);
  return result.join(' ');
};

const PracticeResult: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<PracticeResultDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/practice/list');
      return;
    }
    loadResult();
  }, [sessionId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const data = await PracticeService.getResult(sessionId!);
      setResult(data);
    } catch (error) {
      console.error('Load result error:', error);
      navigate('/practice/list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="practice-result loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="practice-result error">
        <p>Result not found</p>
      </div>
    );
  }

  const partResultsArray = Object.values(result.partResults).sort(
    (a, b) => a.partNumber - b.partNumber
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Part',
      dataIndex: 'partName',
      key: 'partName',
      render: (_: string, record: PartResultDto) => <strong>{record.partName}</strong>,
    },
    {
      title: 'Correct',
      dataIndex: 'correct',
      key: 'correct',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#52c41a' }}>
          <CheckCircleOutlined /> {val}
        </span>
      ),
    },
    {
      title: 'Incorrect',
      dataIndex: 'incorrect',
      key: 'incorrect',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#ff4d4f' }}>
          <CloseCircleOutlined /> {val}
        </span>
      ),
    },
    {
      title: 'Unanswered',
      dataIndex: 'unanswered',
      key: 'unanswered',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#8c8c8c' }}>
          <QuestionCircleOutlined /> {val}
        </span>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center' as const,
      render: (val: number) => (
        <Progress
          type="circle"
          percent={Math.round(val)}
          width={50}
          strokeColor={getScoreColor(val)}
        />
      ),
    },
    {
      title: 'Avg. Time/Q',
      dataIndex: 'averageTimePerQuestion',
      key: 'averageTimePerQuestion',
      align: 'center' as const,
      render: (val: number) => `${Math.round(val)}s`,
    },
  ];

  return (
    <div className="practice-result">
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <TrophyOutlined className="trophy-icon" />
          <h1>Practice Result</h1>
        </div>

        {/* Overall Score */}
        <Card className="score-card">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8}>
              <div className="score-circle">
                <Progress
                  type="circle"
                  percent={Math.round(result.accuracyPercentage)}
                  width={180}
                  strokeWidth={10}
                  strokeColor={getScoreColor(result.accuracyPercentage)}
                  format={(percent) => (
                    <div className="score-content">
                      <div className="score-value">{percent}%</div>
                      <div className="score-label">Accuracy</div>
                    </div>
                  )}
                />
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Practice Score"
                    value={result.score}
                    precision={0}
                    valueStyle={{ color: getScoreColor(result.accuracyPercentage) }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Completion Time"
                    value={formatDuration(result.totalTime)}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Correct"
                    value={result.correctAnswers}
                    suffix={`/ ${result.totalQuestions}`}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Incorrect"
                    value={result.incorrectAnswers}
                    suffix={`/ ${result.totalQuestions}`}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Unanswered"
                    value={result.unansweredQuestions}
                    suffix={`/ ${result.totalQuestions}`}
                    valueStyle={{ color: '#8c8c8c' }}
                    prefix={<QuestionCircleOutlined />}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Part Results Table */}
        <Card title="Part Details" className="parts-card">
          <Table
            columns={columns}
            dataSource={partResultsArray}
            rowKey="partName"
            pagination={false}
            bordered
          />
        </Card>

        {/* Actions */}
        <div className="result-actions">
          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/practice/list')}
          >
            Back to Practice
          </Button>

          <Button
            size="large"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/practice/review/${sessionId}`)}
          >
            Review Answers
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<RedoOutlined />}
            onClick={() => navigate('/practice/list')}
          >
            New Practice
          </Button>
        </div>

        {/* Encouragement */}
        <div className="encouragement">
          {result.accuracyPercentage >= 80 ? (
            <p className="excellent">🎉 Excellent! You did a great job. Keep it up!</p>
          ) : result.accuracyPercentage >= 60 ? (
            <p className="good">👍 Good job! You're making progress. Keep going!</p>
          ) : (
            <p className="need-improvement">
              💪 Don't give up! Review the theory and practice more!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeResult;