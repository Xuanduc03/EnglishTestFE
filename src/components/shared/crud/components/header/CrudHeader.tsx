import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import React from "react";
import type { PageHeaderProps } from "../../type";


const { Title, Text } = Typography;

export const CrudHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  onCreate,
  createButtonText = "Thêm mới",
  extra
}) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
        }}>
            {/* LEFT SIDE: Title & Subtitle */}
            <div>
                <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
                    {title}
                </Title>
                {subtitle && (
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        {subtitle}
                    </Text>
                )}
            </div>

            {/* RIGHT SIDE: Actions */}
            <Space>
                {/* Nút Làm mới (chỉ hiện nếu truyền hàm onRefresh) */}
                {onRefresh && (
                    <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                        Làm mới
                    </Button>
                )}

                {/* Các nút mở rộng khác (nếu có) */}
                {extra}

                {/* Nút Tạo mới (chỉ hiện nếu truyền hàm onCreate) */}
                {onCreate && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onCreate}
                        size="large"
                        style={{
                            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)', // Style bóng đổ theo yêu cầu
                            fontWeight: 500
                        }}
                    >
                        {createButtonText}
                    </Button>
                )}
            </Space>
        </div>
    )
};