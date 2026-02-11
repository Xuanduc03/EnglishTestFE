import React from 'react';
import { Card, Row, Col, Tag, Input, Button } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import './ListListeningPractice.scss';

const { Search } = Input;

const ListListeningPractice: React.FC = () => {
  // Dữ liệu mẫu cho các topic
  const topics = [
    {
      id: 1,
      title: 'TOPIC 1 - JOB',
      subtitle: 'NGƯỜI & CHẤC CHÍNH TẢ',
      tag: 'TỔP C A S B',
      type: 'topic',
      day: null
    },
    {
      id: 2,
      title: 'DAY 2',
      subtitle: 'Ngày là chúng chính kê',
      tag: 'Tập Sự',
      type: 'day',
      day: 2
    },
    {
      id: 3,
      title: 'DAY 4',
      subtitle: 'Ngày là chúng chính kê',
      tag: 'Tập Sự',
      type: 'day',
      day: 4
    },
    {
      id: 4,
      title: 'TOPIC 2 - ADVERTISING-MARKETING-PROMOTION',
      subtitle: 'NGƯỜI & CHẤC CHÍNH TẢ',
      tag: 'TỔP C A S B',
      type: 'topic',
      day: null
    },
    {
      id: 5,
      title: 'DAY 3',
      subtitle: 'Ngày là chúng chính kê',
      tag: 'Tập Sự',
      type: 'day',
      day: 3
    },
    {
      id: 6,
      title: 'TOPIC 4 - SHIPPING',
      subtitle: 'NGƯỜI & CHẤC CHÍNH TẢ',
      tag: 'TỔP C A S B',
      type: 'topic',
      day: null
    },
    {
      id: 7,
      title: 'DAY 1',
      subtitle: 'Ngày là chúng chính kê',
      tag: 'Tập Sự',
      type: 'day',
      day: 1
    },
    {
      id: 8,
      title: 'TOPIC 3 - MANUFACTURING',
      subtitle: 'NGƯỜI & CHẤC CHÍNH TẢ',
      tag: 'TỔP C A S B',
      type: 'topic',
      day: null
    }
  ];

  const getCardColor = (type: string, day?: number | null) => {
    if (type === 'topic') {
      return '#1890ff'; // Blue for topics
    } else {
      // Different colors for different days
      const dayColors: { [key: number]: string } = {
        1: '#52c41a', // Green
        2: '#faad14', // Orange
        3: '#fa541c', // Red
        4: '#722ed1'  // Purple
      };
      return dayColors[day as number] || '#13c2c2';
    }
  };

  const getHeaderColor = (type: string) => {
    return type === 'topic' ? '#f0f8ff' : '#fff2e8';
  };

  return (
    <div className="topic-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-main">
          <h1 className="main-title">Tỉnh Sự</h1>
          <Tag className="main-tag" color="blue">TỔP C A S B</Tag>
        </div>
        
        <div className="header-search">
          <div className="search-section">
            <h3 className="search-title">Topiểm</h3>
            <Search
              placeholder="Tìm kiếm"
              enterButton={<SearchOutlined />}
              size="large"
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content">
        <Row gutter={[24, 24]}>
          {topics.map((topic) => (
            <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
              <Card 
                className={`topic-card ${topic.type}-card`}
                style={{
                  borderTop: `4px solid ${getCardColor(topic.type, topic.day)}`,
                }}
              >
                <div 
                  className="card-header"
                  style={{
                    backgroundColor: getHeaderColor(topic.type),
                  }}
                >
                  <h3 className="card-title">{topic.title}</h3>
                  <Tag 
                    className="card-tag"
                    color={topic.type === 'topic' ? 'blue' : 'orange'}
                  >
                    {topic.tag}
                  </Tag>
                </div>
                
                <div className="card-content">
                  <p className="card-subtitle">{topic.subtitle}</p>
                  
                  <div className="card-actions">
                    <Button 
                      type="primary" 
                      icon={<FileTextOutlined />}
                      className="exercise-btn"
                      style={{
                        backgroundColor: getCardColor(topic.type, topic.day),
                        borderColor: getCardColor(topic.type, topic.day),
                      }}
                    >
                      Đơn bài tập
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ListListeningPractice;