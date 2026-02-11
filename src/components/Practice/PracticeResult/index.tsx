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
  RedoOutlined
} from '@ant-design/icons';
import './PracticeResult.scss';
import type { PartResultDto, PracticeResultDto } from '../Types/practice.type';
import { PracticeService } from '../Services/practice.service';

const PracticeResult: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<PracticeResultDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/practice');
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
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="practice-result loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="practice-result error">
        <p>Không tìm thấy kết quả</p>
      </div>
    );
  }

  // Convert partResults object to array
  const partResultsArray = Object.values(result.partResults).sort(
    (a, b) => a.partNumber - b.partNumber
  );

  // Determine score color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    return '#ff4d4f';
  };

  // Table columns for part results
  const columns = [
    {
      title: 'Part',
      dataIndex: 'partName',
      key: 'partName',
      render: (text: string, record: PartResultDto) => (
        <strong>{record.partName}</strong>
      )
    },
    {
      title: 'Đúng',
      dataIndex: 'correct',
      key: 'correct',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#52c41a' }}>
          <CheckCircleOutlined /> {val}
        </span>
      )
    },
    {
      title: 'Sai',
      dataIndex: 'incorrect',
      key: 'incorrect',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#ff4d4f' }}>
          <CloseCircleOutlined /> {val}
        </span>
      )
    },
    {
      title: 'Chưa làm',
      dataIndex: 'unanswered',
      key: 'unanswered',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#8c8c8c' }}>
          <QuestionCircleOutlined /> {val}
        </span>
      )
    },
    {
      title: 'Độ chính xác',
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
      )
    },
    {
      title: 'Thời gian TB/câu',
      dataIndex: 'averageTimePerQuestion',
      key: 'averageTimePerQuestion',
      align: 'center' as const,
      render: (val: number) => `${Math.round(val)}s`
    }
  ];

  return (
    <div className="practice-result">
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <TrophyOutlined className="trophy-icon" />
          <h1>Kết quả luyện tập</h1>
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
                      <div className="score-label">Độ chính xác</div>
                    </div>
                  )}
                />
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng điểm"
                    value={result.score}
                    precision={0}
                    suffix="/ 990"
                    valueStyle={{ color: getScoreColor(result.accuracyPercentage) }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Thời gian"
                    value={result.totalTime}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đúng"
                    value={result.correctAnswers}
                    suffix={`/ ${result.totalQuestions}`}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Sai"
                    value={result.incorrectAnswers}
                    suffix={`/ ${result.totalQuestions}`}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Chưa làm"
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
        <Card title="Chi tiết từng Part" className="parts-card">
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
            onClick={() => navigate('/practice')}
          >
            Về trang chủ
          </Button>
          
          <Button
            type="primary"
            size="large"
            icon={<RedoOutlined />}
            onClick={() => navigate('/practice')}
          >
            Luyện tập mới
          </Button>
        </div>

        {/* Encouragement Message */}
        <div className="encouragement">
          {result.accuracyPercentage >= 80 ? (
            <p className="excellent">
              🎉 Xuất sắc! Bạn đã làm rất tốt. Hãy tiếp tục phát huy!
            </p>
          ) : result.accuracyPercentage >= 60 ? (
            <p className="good">
              👍 Tốt lắm! Bạn đang trên đà tiến bộ. Cố gắng lên!
            </p>
          ) : (
            <p className="need-improvement">
              💪 Đừng nản chí! Hãy xem lại lý thuyết và luyện tập thêm nhé!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeResult;