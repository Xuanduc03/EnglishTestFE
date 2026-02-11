import React, { useEffect, useState } from "react";
import { 
  Card, 
  Avatar, 
  Form, 
  Input, 
  Button, 
  Tabs, 
  message, 
  Upload, 
  DatePicker,
  Select,
  Spin,
  Modal,
  Typography,
  Row,
  Col,
  Statistic
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  CalendarOutlined,
  UploadOutlined,
  EditOutlined,
  SafetyOutlined,
  FireOutlined,
  TrophyOutlined,
  CrownOutlined,
  CameraOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import "./profile.scss";
import { ProfileService } from "./profile.service";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "./profile.types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  fullname: string;
  phone: string;
  address: string;
  gender: string;
  birthDate: string;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const userLogin = localStorage.getItem("accessToken");
  const navigate = useNavigate() ;
  useEffect(() => {
    if (!userLogin) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [userLogin, navigate]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await ProfileService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        
        // Set initial values for form
        infoForm.setFieldsValue({
          fullname: response.data.fullname,
          phone: response.data.phone || '',
          address: response.data.address || '',
          gender: response.data.gender || 'male',
          birthDate: response.data.birthDate ? dayjs(response.data.birthDate) : null,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải thông tin cá nhân');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload: UploadProps['beforeUpload'] = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Chỉ có thể upload file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    
    return false; // Prevent automatic upload
  };

  const handleAvatarModalOk = async () => {
    if (!avatarFile) return;
    
    setLoading(true);
    try {
      const response = await ProfileService.uploadAvatar(avatarFile);
      if (response.success) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        setProfile(response.data);
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsAvatarModalVisible(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarModalCancel = () => {
    setIsAvatarModalVisible(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Handle profile info update
  const handleInfoSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        fullname: values.fullname,
        phone: values.phone,
        address: values.address,
        gender: values.gender,
        birthDate: values.birthDate ? new Date(values.birthDate).toISOString() : undefined,
      };

      const response = await ProfileService.updateProfileInfo(updateData);
      if (response.success && response.data) {
        setProfile(response.data);
        message.success("Cập nhật thông tin thành công!");
      }
    } catch (error: any) {
      message.error(error.message || "Cập nhật thông tin thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data: ChangePasswordRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      
      const response = await ProfileService.changePassword(data);
      if (response.success) {
        message.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'Chưa cập nhật';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (profileLoading) {
    return (
      <div className="profile-loading">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header với thông tin và stats */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-wrapper" onClick={() => setIsAvatarModalVisible(true)}>
            <Avatar 
              size={120} 
              src={profile?.avatarUrl || undefined}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <div className="avatar-overlay">
              <CameraOutlined />
            </div>
          </div>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => setIsAvatarModalVisible(true)}
            className="change-avatar-btn"
          >
            Đổi ảnh đại diện
          </Button>
        </div>

        <div className="profile-info">
          <Title level={2} className="profile-name">
            {profile?.fullname || 'Chưa cập nhật'}
          </Title>
          <Text type="secondary" className="profile-email">
            <MailOutlined /> {profile?.email}
          </Text>
          <div className="member-info">
            <Text type="secondary">
              Thành viên từ: {formatDate(profile?.createdAt || '')}
            </Text>
          </div>
        </div>

        <div className="profile-stats">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Streak"
                value={profile?.streak || 0}
                prefix={<FireOutlined />}
                suffix="ngày"
                valueStyle={{ color: '#fa541c' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Điểm"
                value={profile?.points || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={24}>
              <div className="member-level">
                <CrownOutlined style={{ color: '#ffd666', marginRight: 8 }} />
                <Text strong>{profile?.memberLevel || 'Basic'}</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Modal upload avatar */}
      <Modal
        title="Thay đổi ảnh đại diện"
        open={isAvatarModalVisible}
        onOk={handleAvatarModalOk}
        onCancel={handleAvatarModalCancel}
        confirmLoading={loading}
        okText="Lưu ảnh"
        cancelText="Hủy"
      >
        <div className="avatar-upload-modal">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
              </div>
            )}
          </Upload>
          <div className="upload-hint">
            <Text type="secondary">Kích thước tối đa: 5MB. Định dạng: JPG, PNG, WebP</Text>
          </div>
        </div>
      </Modal>

      {/* Main content với tabs */}
      <div className="profile-content">
        <Card className="profile-card">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="profile-tabs"
            items={[
              {
                key: 'info',
                label: (
                  <span>
                    <UserOutlined />
                    Thông tin cá nhân
                  </span>
                ),
              },
              {
                key: 'password',
                label: (
                  <span>
                    <SafetyOutlined />
                    Đổi mật khẩu
                  </span>
                ),
              },
            ]}
          />
          
          {/* Tab Thông tin cá nhân */}
          {activeTab === 'info' && (
            <Form 
              layout="vertical" 
              onFinish={handleInfoSubmit}
              form={infoForm}
              className="profile-form"
            >
              <div className="form-section">
                <Title level={4} className="section-title">Thông tin cơ bản</Title>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Họ và tên"
                      name="fullname"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên' },
                        { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined className="input-icon" />} 
                        placeholder="Nhập họ và tên"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined className="input-icon" />} 
                        placeholder="Nhập số điện thoại"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  label="Email"
                  name="email"
                >
                  <Input 
                    prefix={<MailOutlined className="input-icon" />} 
                    value={profile?.email}
                    disabled
                    size="large"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Giới tính"
                      name="gender"
                    >
                      <Select size="large" placeholder="Chọn giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Ngày sinh"
                      name="birthDate"
                    >
                      <DatePicker 
                        placeholder="Chọn ngày sinh"
                        style={{ width: '100%' }}
                        size="large"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="form-actions">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading && activeTab === "info"}
                  size="large"
                  icon={<EditOutlined />}
                >
                  Cập nhật thông tin
                </Button>
              </div>
            </Form>
          )}

          {/* Tab Đổi mật khẩu */}
          {activeTab === 'password' && (
            <Form 
              layout="vertical" 
              onFinish={handlePasswordSubmit}
              form={passwordForm}
              className="password-form"
            >
              <div className="form-section">
                <Title level={4} className="section-title">Đổi mật khẩu</Title>
                <Text type="secondary" className="section-description">
                  Để đảm bảo an toàn, vui lòng sử dụng mật khẩu có ít nhất 8 ký tự bao gồm chữ, số và ký tự đặc biệt.
                </Text>
                
                <Form.Item 
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="input-icon" />} 
                    placeholder="Nhập mật khẩu hiện tại"
                    size="large"
                  />
                </Form.Item>

                <Form.Item 
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                    { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, 
                      message: 'Mật khẩu phải chứa ít nhất 1 chữ, 1 số và 1 ký tự đặc biệt' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="input-icon" />} 
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                  />
                </Form.Item>

                <Form.Item 
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="input-icon" />} 
                    placeholder="Xác nhận mật khẩu mới"
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="password-tips">
                <Title level={5}>Mẹo tạo mật khẩu mạnh:</Title>
                <ul>
                  <li>Dùng ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa và chữ thường</li>
                  <li>Thêm số và ký tự đặc biệt</li>
                  <li>Không sử dụng thông tin cá nhân</li>
                  <li>Không dùng mật khẩu cũ</li>
                </ul>
              </div>

              <div className="form-actions">
                <Button 
                  type="primary" 
                  danger 
                  htmlType="submit"
                  loading={loading && activeTab === "password"}
                  size="large"
                  icon={<SafetyOutlined />}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

