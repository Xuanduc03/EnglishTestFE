import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Steps, 
  Progress, 
  Button, 
  Statistic, 
  Timeline, 
  Tag, 
  Badge, 
  Tooltip,
  Select,
  Alert,
  Collapse,
  Empty,
  Divider,
  Avatar
} from 'antd';
import { 
  CalendarOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  PlayCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  UserOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  StarOutlined,
  FireOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './LearningPathPage.scss';

const { Step } = Steps;
const { Option } = Select;
const { Panel } = Collapse;

interface StudyStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  type: 'theory' | 'practice' | 'test' | 'review';
  resources: number;
  difficulty: 'easy' | 'medium' | 'hard';
  score?: number;
  targetScore?: number;
}

interface Phase {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  steps: StudyStep[];
  focusAreas: string[];
  examTarget: 'TOEIC' | 'IELTS';
}

interface LearningPath {
  id: number;
  name: string;
  targetScore: {
    TOEIC: number;
    IELTS: {
      overall: number;
      listening: number;
      reading: number;
      writing: number;
      speaking: number;
    };
  };
  currentScore: {
    TOEIC: number;
    IELTS: {
      overall: number;
      listening: number;
      reading: number;
      writing: number;
      speaking: number;
    };
  };
  estimatedCompletion: string;
  dailyStudyTime: number;
  weeklyProgress: number;
  phases: Phase[];
  weakAreas: string[];
  strongAreas: string[];
}

const LearningPathPage: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<'TOEIC' | 'IELTS'>('TOEIC');
  const [activePhase, setActivePhase] = useState<number>(1);
  const [learningPath, setLearningPath] = useState<LearningPath>({
    id: 1,
    name: 'Lộ trình học tập cá nhân',
    targetScore: {
      TOEIC: 850,
      IELTS: {
        overall: 7.5,
        listening: 8.0,
        reading: 7.5,
        writing: 7.0,
        speaking: 7.5
      }
    },
    currentScore: {
      TOEIC: 650,
      IELTS: {
        overall: 6.0,
        listening: 6.5,
        reading: 6.0,
        writing: 5.5,
        speaking: 6.0
      }
    },
    estimatedCompletion: '2024-03-15',
    dailyStudyTime: 120,
    weeklyProgress: 65,
    phases: [
      {
        id: 1,
        title: 'Củng cố nền tảng',
        description: 'Xây dựng kiến thức cơ bản về ngữ pháp và từ vựng',
        duration: '2 tuần',
        progress: 100,
        status: 'completed',
        examTarget: 'TOEIC',
        focusAreas: ['Ngữ pháp cơ bản', 'Từ vựng thông dụng', 'Phát âm'],
        steps: [
          {
            id: 1,
            title: 'Ngữ pháp cơ bản',
            description: 'Ôn tập 12 thì cơ bản và cấu trúc câu',
            duration: '3 giờ',
            completed: true,
            type: 'theory',
            resources: 15,
            difficulty: 'easy',
            score: 85
          },
          {
            id: 2,
            title: 'Từ vựng thông dụng',
            description: 'Học 500 từ vựng thường gặp trong TOEIC',
            duration: '5 giờ',
            completed: true,
            type: 'theory',
            resources: 8,
            difficulty: 'medium',
            score: 78
          },
          {
            id: 3,
            title: 'Bài kiểm tra đánh giá năng lực',
            description: 'Test đầu vào để xác định điểm mạnh/yếu',
            duration: '1.5 giờ',
            completed: true,
            type: 'test',
            resources: 1,
            difficulty: 'medium',
            score: 650,
            targetScore: 850
          }
        ]
      },
      {
        id: 2,
        title: 'Luyện kỹ năng Nghe',
        description: 'Phát triển kỹ năng nghe hiểu qua các dạng bài',
        duration: '3 tuần',
        progress: 75,
        status: 'in-progress',
        examTarget: 'TOEIC',
        focusAreas: ['Part 1-2: Mô tả tranh & Hỏi đáp', 'Part 3-4: Đoạn hội thoại & Bài nói'],
        steps: [
          {
            id: 4,
            title: 'Part 1: Mô tả tranh',
            description: 'Luyện nghe và chọn mô tả đúng với bức tranh',
            duration: '4 giờ',
            completed: true,
            type: 'practice',
            resources: 20,
            difficulty: 'easy',
            score: 82
          },
          {
            id: 5,
            title: 'Part 2: Hỏi đáp',
            description: 'Luyện nghe câu hỏi và chọn câu trả lời phù hợp',
            duration: '6 giờ',
            completed: true,
            type: 'practice',
            resources: 25,
            difficulty: 'medium',
            score: 75
          },
          {
            id: 6,
            title: 'Part 3: Đoạn hội thoại',
            description: 'Luyện nghe đoạn hội thoại và trả lời câu hỏi',
            duration: '8 giờ',
            completed: false,
            type: 'practice',
            resources: 30,
            difficulty: 'hard'
          }
        ]
      },
      {
        id: 3,
        title: 'Luyện kỹ năng Đọc',
        description: 'Nâng cao kỹ năng đọc hiểu và tốc độ đọc',
        duration: '3 tuần',
        progress: 30,
        status: 'in-progress',
        examTarget: 'TOEIC',
        focusAreas: ['Part 5-6: Hoàn thành câu & Đoạn văn', 'Part 7: Đọc hiểu'],
        steps: [
          {
            id: 7,
            title: 'Part 5: Hoàn thành câu',
            description: 'Luyện tập ngữ pháp và từ vựng trong câu',
            duration: '5 giờ',
            completed: false,
            type: 'practice',
            resources: 40,
            difficulty: 'medium'
          },
          {
            id: 8,
            title: 'Part 6: Hoàn thành đoạn văn',
            description: 'Luyện tập điền từ vào đoạn văn',
            duration: '6 giờ',
            completed: false,
            type: 'practice',
            resources: 25,
            difficulty: 'hard'
          }
        ]
      },
      {
        id: 4,
        title: 'Luyện đề tổng hợp',
        description: 'Làm đề thi thử và phân tích lỗi sai',
        duration: '4 tuần',
        progress: 0,
        status: 'not-started',
        examTarget: 'TOEIC',
        focusAreas: ['Full test', 'Time management', 'Chiến thuật làm bài'],
        steps: [
          {
            id: 9,
            title: 'Full Test 1',
            description: 'Làm bài thi thử TOEIC hoàn chỉnh',
            duration: '2 giờ',
            completed: false,
            type: 'test',
            resources: 5,
            difficulty: 'hard'
          },
          {
            id: 10,
            title: 'Phân tích lỗi sai',
            description: 'Review và học từ lỗi sai trong bài test',
            duration: '3 giờ',
            completed: false,
            type: 'review',
            resources: 10,
            difficulty: 'medium'
          }
        ]
      }
    ],
    weakAreas: ['Part 3 Listening', 'Part 7 Reading', 'Business Vocabulary'],
    strongAreas: ['Part 1-2 Listening', 'Basic Grammar', 'Time Management']
  });

  const [ieltsPath, setIeltsPath] = useState<LearningPath>({
    id: 2,
    name: 'Lộ trình IELTS 7.5+',
    targetScore: {
      TOEIC: 0,
      IELTS: {
        overall: 7.5,
        listening: 8.0,
        reading: 7.5,
        writing: 7.0,
        speaking: 7.5
      }
    },
    currentScore: {
      TOEIC: 0,
      IELTS: {
        overall: 6.0,
        listening: 6.5,
        reading: 6.0,
        writing: 5.5,
        speaking: 6.0
      }
    },
    estimatedCompletion: '2024-04-30',
    dailyStudyTime: 90,
    weeklyProgress: 45,
    phases: [
      {
        id: 1,
        title: 'Foundation Building',
        description: 'Xây dựng nền tảng ngữ pháp và từ vựng học thuật',
        duration: '3 tuần',
        progress: 100,
        status: 'completed',
        examTarget: 'IELTS',
        focusAreas: ['Academic Vocabulary', 'Complex Grammar', 'Pronunciation'],
        steps: [
          {
            id: 1,
            title: 'Academic Vocabulary (Band 6.0-7.0)',
            description: 'Học 1000 từ vựng học thuật thường gặp',
            duration: '10 giờ',
            completed: true,
            type: 'theory',
            resources: 20,
            difficulty: 'medium',
            score: 80
          },
          {
            id: 2,
            title: 'Grammar for Writing',
            description: 'Cấu trúc câu phức và mệnh đề quan hệ',
            duration: '8 giờ',
            completed: true,
            type: 'theory',
            resources: 15,
            difficulty: 'hard',
            score: 75
          }
        ]
      },
      {
        id: 2,
        title: 'Listening & Reading Skills',
        description: 'Phát triển kỹ năng nghe và đọc học thuật',
        duration: '4 tuần',
        progress: 60,
        status: 'in-progress',
        examTarget: 'IELTS',
        focusAreas: ['Note-taking Skills', 'Skimming & Scanning', 'Keyword Recognition'],
        steps: [
          {
            id: 3,
            title: 'Listening Section 1-2',
            description: 'Luyện nghe hội thoại và thông tin cơ bản',
            duration: '12 giờ',
            completed: true,
            type: 'practice',
            resources: 25,
            difficulty: 'medium',
            score: 72
          },
          {
            id: 4,
            title: 'Reading Matching Headings',
            description: 'Kỹ năng nối tiêu đề với đoạn văn',
            duration: '10 giờ',
            completed: false,
            type: 'practice',
            resources: 18,
            difficulty: 'hard'
          }
        ]
      },
      {
        id: 3,
        title: 'Writing & Speaking',
        description: 'Master kỹ năng viết và nói theo tiêu chí chấm điểm',
        duration: '5 tuần',
        progress: 20,
        status: 'in-progress',
        examTarget: 'IELTS',
        focusAreas: ['Essay Structure', 'Cohesion & Coherence', 'Pronunciation & Fluency'],
        steps: [
          {
            id: 5,
            title: 'Task 2 Essay Structure',
            description: 'Cấu trúc bài luận học thuật',
            duration: '15 giờ',
            completed: false,
            type: 'practice',
            resources: 30,
            difficulty: 'hard'
          }
        ]
      }
    ],
    weakAreas: ['Writing Task 2', 'Speaking Part 3', 'Academic Vocabulary'],
    strongAreas: ['Listening Section 1-2', 'Reading True/False', 'Basic Pronunciation']
  });

  const currentPath = selectedExam === 'TOEIC' ? learningPath : ieltsPath;
  const currentPhase = currentPath.phases.find(phase => phase.id === activePhase);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'theory': return <BookOutlined />;
      case 'practice': return <PlayCircleOutlined />;
      case 'test': return <BarChartOutlined />;
      case 'review': return <CheckCircleOutlined />;
      default: return <BookOutlined />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  const handleStartStep = (stepId: number) => {
    console.log('Bắt đầu học bước:', stepId);
    // Logic để bắt đầu học
  };

  const calculateDaysRemaining = () => {
    const targetDate = new Date(currentPath.estimatedCompletion);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="learning-path-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Lộ trình học tập cá nhân</h1>
          <p className="page-subtitle">
            Lộ trình được thiết kế riêng dựa trên trình độ và mục tiêu của bạn
          </p>
        </div>
        
        <div className="exam-selector">
          <Select
            value={selectedExam}
            onChange={(value) => setSelectedExam(value)}
            style={{ width: 200 }}
            size="large"
          >
            <Option value="TOEIC">TOEIC Master</Option>
            <Option value="IELTS">IELTS Preparation</Option>
          </Select>
        </div>
      </div>

      {/* Overview Section */}
      <Row gutter={[24, 24]} className="overview-section">
        <Col xs={24} md={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Điểm mục tiêu"
              value={selectedExam === 'TOEIC' 
                ? currentPath.targetScore.TOEIC 
                : currentPath.targetScore.IELTS.overall}
              prefix={<TrophyOutlined />}
              suffix={selectedExam === 'TOEIC' ? 'điểm' : 'Overall'}
            />
            <div className="current-score">
              Hiện tại: {selectedExam === 'TOEIC' 
                ? currentPath.currentScore.TOEIC 
                : currentPath.currentScore.IELTS.overall}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Thời gian học mỗi ngày"
              value={currentPath.dailyStudyTime}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
            />
            <div className="recommendation">
              Khuyến nghị: 90-120 phút/ngày
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Hoàn thành dự kiến"
              value={calculateDaysRemaining()}
              suffix="ngày"
              prefix={<CalendarOutlined />}
            />
            <div className="date-info">
              {currentPath.estimatedCompletion}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tiến độ tuần này"
              value={currentPath.weeklyProgress}
              suffix="%"
              prefix={<FireOutlined />}
            />
            <Progress 
              percent={currentPath.weeklyProgress} 
              size="small" 
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} className="main-content">
        {/* Left Column - Progress Timeline */}
        <Col xs={24} lg={8} xl={6}>
          <Card 
            title="Các giai đoạn học tập" 
            className="phases-card"
            extra={<Tag color="blue">{currentPath.phases.length} giai đoạn</Tag>}
          >
            <div className="phases-timeline">
              <Timeline>
                {currentPath.phases.map((phase) => (
                  <Timeline.Item
                    key={phase.id}
                    color={phase.status === 'completed' ? 'green' : 
                           phase.status === 'in-progress' ? 'blue' : 'gray'}
                    className={`phase-item ${activePhase === phase.id ? 'active' : ''}`}
                  >
                    <div className="phase-header">
                      <Badge 
                        status={getStatusColor(phase.status) as any}
                        text={<span className="phase-title">{phase.title}</span>}
                      />
                      <Tag color={phase.status === 'in-progress' ? 'blue' : 
                                 phase.status === 'completed' ? 'green' : 'default'}>
                        {phase.status === 'completed' ? 'Đã hoàn thành' : 
                         phase.status === 'in-progress' ? 'Đang học' : 'Chưa bắt đầu'}
                      </Tag>
                    </div>
                    <div className="phase-info">
                      <span className="duration">
                        <ClockCircleOutlined /> {phase.duration}
                      </span>
                      <Progress 
                        percent={phase.progress} 
                        size="small" 
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>

          {/* Weak Areas */}
          <Card title="Điểm cần cải thiện" className="areas-card">
            <div className="areas-list">
              {currentPath.weakAreas.map((area, index) => (
                <div key={index} className="area-item weak">
                  <span className="area-dot" style={{ backgroundColor: '#ff4d4f' }} />
                  <span className="area-text">{area}</span>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => console.log('Focus on:', area)}
                  >
                    Tập trung
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Center Column - Phase Details */}
        <Col xs={24} lg={16} xl={12}>
          <Card 
            title={
              <div className="phase-detail-header">
                <h3 style={{ margin: 0 }}>{currentPhase?.title}</h3>
                <div className="phase-meta">
                  <Tag icon={<ClockCircleOutlined />}>{currentPhase?.duration}</Tag>
                  <Tag icon={<TeamOutlined />}>{currentPhase?.examTarget}</Tag>
                </div>
              </div>
            }
            className="phase-detail-card"
          >
            <div className="phase-description">
              <p>{currentPhase?.description}</p>
              
              <div className="focus-areas">
                <h4>Trọng tâm:</h4>
                <div className="focus-tags">
                  {currentPhase?.focusAreas.map((area, index) => (
                    <Tag key={index} color="blue">{area}</Tag>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* Steps in this phase */}
            <div className="steps-section">
              <h4>Các bước học tập trong giai đoạn này:</h4>
              
              {currentPhase?.steps.map((step) => (
                <Card 
                  key={step.id} 
                  className={`step-card ${step.completed ? 'completed' : ''}`}
                  style={{ marginBottom: 16 }}
                >
                  <div className="step-header">
                    <div className="step-title-section">
                      <Badge 
                        status={step.completed ? 'success' : 'default'}
                        dot
                      />
                      <span className="step-icon">
                        {getStepIcon(step.type)}
                      </span>
                      <h4 style={{ margin: 0, flex: 1 }}>{step.title}</h4>
                      <Tag color={getDifficultyColor(step.difficulty)}>
                        {step.difficulty === 'easy' ? 'Dễ' : 
                         step.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                      </Tag>
                    </div>
                    
                    <div className="step-meta">
                      <span className="duration">
                        <ClockCircleOutlined /> {step.duration}
                      </span>
                      <span className="resources">
                        <BookOutlined /> {step.resources} tài liệu
                      </span>
                    </div>
                  </div>
                  
                  <p className="step-description">{step.description}</p>
                  
                  <div className="step-footer">
                    {step.score && (
                      <div className="step-score">
                        <span>Điểm đạt được: </span>
                        <strong style={{ color: '#52c41a' }}>{step.score}%</strong>
                        {step.targetScore && (
                          <span style={{ marginLeft: 8 }}>
                            (Mục tiêu: {step.targetScore})
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="step-actions">
                      {step.completed ? (
                        <Button 
                          type="default" 
                          icon={<CheckCircleOutlined />}
                          style={{ color: '#52c41a' }}
                        >
                          Đã hoàn thành
                        </Button>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleStartStep(step.id)}
                        >
                          Bắt đầu học
                        </Button>
                      )}
                      
                      <Button type="link">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Progress Summary */}
          <Card title="Tổng quan tiến độ" className="progress-summary-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <h4>Hoàn thành các giai đoạn:</h4>
                <Progress 
                  percent={
                    (currentPath.phases.filter(p => p.status === 'completed').length / 
                     currentPath.phases.length) * 100
                  }
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Col>
              
              {selectedExam === 'IELTS' && (
                <>
                  <Col xs={12} sm={6}>
                    <div className="skill-progress">
                      <div className="skill-label">
                        <span>Listening</span>
                        <span>{currentPath.currentScore.IELTS.listening}</span>
                      </div>
                      <Progress 
                        percent={(currentPath.currentScore.IELTS.listening / 9) * 100}
                        size="small"
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div className="skill-progress">
                      <div className="skill-label">
                        <span>Reading</span>
                        <span>{currentPath.currentScore.IELTS.reading}</span>
                      </div>
                      <Progress 
                        percent={(currentPath.currentScore.IELTS.reading / 9) * 100}
                        size="small"
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div className="skill-progress">
                      <div className="skill-label">
                        <span>Writing</span>
                        <span>{currentPath.currentScore.IELTS.writing}</span>
                      </div>
                      <Progress 
                        percent={(currentPath.currentScore.IELTS.writing / 9) * 100}
                        size="small"
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={6}>
                    <div className="skill-progress">
                      <div className="skill-label">
                        <span>Speaking</span>
                        <span>{currentPath.currentScore.IELTS.speaking}</span>
                      </div>
                      <Progress 
                        percent={(currentPath.currentScore.IELTS.speaking / 9) * 100}
                        size="small"
                      />
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </Col>

        {/* Right Column - Recommendations */}
        <Col xs={24} xl={6}>
          <Card title="Đề xuất học tập" className="recommendations-card">
            <div className="recommendation-item">
              <div className="rec-icon">
                <StarOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div className="rec-content">
                <h5>Luyện tập hàng ngày</h5>
                <p>Duy trì ít nhất {currentPath.dailyStudyTime} phút mỗi ngày</p>
              </div>
            </div>
            
            <div className="recommendation-item">
              <div className="rec-icon">
                <FireOutlined style={{ color: '#fa541c', fontSize: 20 }} />
              </div>
              <div className="rec-content">
                <h5>Chuỗi ngày học</h5>
                <p>Đã duy trì 14 ngày liên tiếp</p>
                <Button type="link" size="small">Xem streak</Button>
              </div>
            </div>
            
            <div className="recommendation-item">
              <div className="rec-icon">
                <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />
              </div>
              <div className="rec-content">
                <h5>Thử thách tuần</h5>
                <p>Hoàn thành 5 bài test để nhận huy hiệu</p>
                <Progress percent={60} size="small" />
              </div>
            </div>
          </Card>

          <Card 
            title="Tài nguyên bổ sung" 
            className="resources-card"
            style={{ marginTop: 24 }}
          >
            <div className="resources-list">
              <Button type="link" block className="resource-link">
                <BookOutlined /> Tài liệu ngữ pháp
              </Button>
              <Button type="link" block className="resource-link">
                <PlayCircleOutlined /> Video hướng dẫn
              </Button>
              <Button type="link" block className="resource-link">
                <BarChartOutlined /> Bài test mẫu
              </Button>
              <Button type="link" block className="resource-link">
                <TeamOutlined /> Nhóm học tập
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Action Bar */}
      <div className="action-bar">
        <Button 
          type="primary" 
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={() => console.log('Continue learning')}
        >
          Tiếp tục học bài tiếp theo
        </Button>
        
        <Button 
          type="default" 
          size="large"
          icon={<SettingOutlined />}
          onClick={() => console.log('Adjust settings')}
        >
          Tùy chỉnh lộ trình
        </Button>
      </div>
    </div>
  );
};

export default LearningPathPage;