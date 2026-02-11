import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Forgot.scss';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Password reset for:', values.email);
      setIsSubmitted(true);
      message.success('Đã gửi email đặt lại mật khẩu');
      
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResend = () => {
    const email = form.getFieldValue('email');
    if (email) {
      handleSubmit({ email });
    }
  };

  return (
    <div className="forgot-password-page">
      <Card className="forgot-password-card">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToLogin}
          className="back-button"
        >
          Quay lại đăng nhập
        </Button>

        <div className="header">
          <Title level={3}>Quên mật khẩu</Title>
          <Text className="description">
            Vui lòng nhập địa chỉ email liên kết với tài khoản của bạn, 
            chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu của bạn.
          </Text>
        </div>

        {!isSubmitted ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="forgot-form"
          >
            <Form.Item
              label="Địa chỉ email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
                { max: 50, message: 'Email không quá 50 ký tự' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Gửi yêu cầu
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <Title level={4}>Yêu cầu đã được gửi</Title>
            <Text>
              Chúng tôi đã gửi email đến <strong>{form.getFieldValue('email')}</strong>. 
              Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.
            </Text>
            
            <div className="action-buttons">
              <Button
                type="primary"
                onClick={handleResend}
                loading={loading}
              >
                Gửi lại email
              </Button>
              <Button onClick={handleBackToLogin}>
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;