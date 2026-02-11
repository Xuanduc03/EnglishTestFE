import { Row, Col, Card, Typography } from "antd";
import type { StatCardConfig } from "../../type";
import React, { isValidElement } from "react";
const { Text, Title } = Typography;

export const StatCards = ({ stats }: { stats: StatCardConfig[] }) => {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => {
        const { title, value, color = '#1890ff', icon } = stat; // default color
        return (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              variant="borderless"
              style={{
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: 8 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
                  <Title level={2} style={{ margin: '4px 0 0', color }}>{value}</Title>
                </div>
                {icon && isValidElement(icon) && (  
                  <div style={{
                    backgroundColor: `${color}15`,
                    padding: 12,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(icon)}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        )
      })}
    </Row>
  );
};
