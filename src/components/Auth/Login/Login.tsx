import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  type FormProps,
} from "antd";
import {
  GoogleOutlined,
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginPage.scss";
import { api } from "../../../configs/axios-custom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { Spin } from "antd";

const { Title, Link } = Typography;
const toastId = "login-toast";

interface LoginPayload {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleResponse = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/google-login", {
        IdToken: credentialResponse.credential,
      });

      if (res.data.success === true) {
        const loginData = res.data.data;
        localStorage.setItem("accessToken", loginData.token);
        localStorage.setItem("refreshToken", loginData.refreshToken);
        localStorage.setItem("user", JSON.stringify(loginData));
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
    } catch (error) {
      toast.error(`Có lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const onFinish: FormProps<LoginPayload>["onFinish"] = async (values: any) => {
    try {
      setLoading(true);
      const response = await api.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.success === true) {
        const loginData = response.data.data;
        localStorage.setItem("accessToken", loginData.token);
        localStorage.setItem("refreshToken", loginData.refreshToken);
        localStorage.setItem("user", JSON.stringify(loginData));
        localStorage.setItem("roles", JSON.stringify(loginData.roles));

        toast.success(`Chào mừng ${loginData.username} quay lại!`);

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
    } catch (error: any) {
      toast.update(toastId, {
        render: error.response?.data?.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Đang đăng nhập...">
      <div className="login-container">
        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="back-button"
          onClick={handleBack}
        >
          Quay lại
        </Button>

        {/* Login Card */}
        <Card className="login-card" >
          <div className="login-header">
            <img src="/logo.png" alt="Logo" className="login-logo" />
            <Title level={3}>Đăng nhập tài khoản</Title>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleResponse}
              onError={() => toast.error("Đăng nhập Google thất bại!")}
              useOneTap
            />
          </div>

          <Divider plain>hoặc</Divider>

          <Form layout="vertical" size="large" onFinish={onFinish}>
            <Form.Item
              label="Tên tài khoản hoặc Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập tài khoản hoặc email!" },
                { max: 50, message: "Không quá 50 ký tự!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tài khoản hoặc Email" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <div className="login-links">
              <Link href="/register">Đăng ký</Link>
              <Link href="/forgot">Quên mật khẩu?</Link>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default LoginPage;