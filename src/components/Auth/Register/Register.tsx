import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Checkbox,
  message,
  Row,
  Col,
} from "antd";
import {
  GoogleOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import './RegisterPage.scss';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import registerImage from "../../../assets/img/banner-register.jpg";
import { api } from "../../../configs/axios-custom";

const { Title, Link, Text } = Typography;

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
      }

      const response = await api.post('/api/auth/register', payload);
      if (response.data.success) {
        toast.success("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Register Error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;

      const response = await api.post("/api/auth/google-login", { idToken });


      if (response.data.success === true) {
        const loginData = response.data.data;
        localStorage.setItem('accessToken', loginData.token);
        localStorage.setItem('refreshToken', loginData.refreshToken);
        localStorage.setItem('user', JSON.stringify(loginData));
        localStorage.setItem("roles", JSON.stringify(loginData.roles));

        toast.success(`Chào mừng ${loginData.fullname} quay lại!`);

        const roles: string[] = loginData.roles;
        if (roles.includes("Admin")) {
          navigate("/admin");
        } else if (roles.includes("Teacher")) {
          navigate("/teacher/dashboard");
        } else if (roles.includes("Student")) {
          navigate("/home");
        } else {
          navigate("/403");
        }
      }
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Đăng nhập bằng Google thất bại!");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Register Failed:", errorInfo);
    message.error("Vui lòng kiểm tra lại thông tin!");
  };

  return (
    <div className="register-page">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="back-button"
        onClick={handleBack}
      >
        Quay lại
      </Button>

      <div className="register-container">
        {/* Left Side - Promotional Content */}
        <div className="image-section">
          <img src={registerImage} alt="Register" className="register-image" />
        </div>

        {/* Right Side - Registration Form */}
        <div className="form-section">
          <Card className="register-card" bordered={false}>
            <div className="register-header">
              <Title level={2}>Đăng Ký Tài Khoản</Title>
              <Text type="secondary">
                Bắt đầu hành trình chinh phục TOEIC ngay hôm nay
              </Text>
            </div>

            {/* Google Login */}
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => {
                  toast.error("Đăng nhập Google thất bại!");
                }}
              />
            </div>

            <Divider plain>hoặc</Divider>

            <Form
              form={form}
              name="registerForm"
              layout="vertical"
              size="large"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              {/* Username */}
              <Form.Item
                label="Họ và tên"
                name="fullname"
                rules={[
                  { required: true, message: "Vui lòng nhập Họ và tên!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập Họ và tên"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
              </Form.Item>


              {/* Password */}
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
                  {
                    pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
                    message: "Cần ít nhất 1 chữ hoa và 1 số!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              {/* Confirm Password */}
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                />
              </Form.Item>

              {/* Agreement Checkbox */}
              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error("Bạn cần đồng ý điều khoản")),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đồng ý với <Link href="#">Điều khoản sử dụng</Link> và{" "}
                  <Link href="#">Chính sách bảo mật</Link>
                </Checkbox>
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            {/* Footer Links */}
            <div className="register-footer">
              <Text type="secondary">
                Đã có tài khoản?{" "}
                <Link href="/login" strong>
                  Đăng nhập ngay
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;