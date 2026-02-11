import { Modal, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "./Profile.scss";
import { api } from "../../configs/axios-custom";

interface SimpleProfileProps {
  openModalFromOutside?: boolean;
  onCloseModalFromOutside?: () => void;
  handleCancel?: () => void;
  setUser?: (value: string) => void;
  setIsModalProfileVisible?: (value: boolean) => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

const SimpleProfile: React.FC<SimpleProfileProps> = ({
  openModalFromOutside,
  onCloseModalFromOutside,
  handleCancel,
  setUser,
  setIsModalProfileVisible,
  onEditProfile,
  onChangePassword,
  onLogout,
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (openModalFromOutside) {
      fetchUserInfo();
    }
  }, [openModalFromOutside]);


  const fetchUserInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.userId;
      if (!userId) return;

      const res = await api.get(`/api/users/profile/${userId}`);
      setUserInfo(res.data.data);
    } catch (error) {
      console.error("Fetch profile failed", error);
    }
  };

  const handleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
    if (onCloseModalFromOutside) {
      onCloseModalFromOutside();
    }
    if (setIsModalProfileVisible) {
      setIsModalProfileVisible(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
    if (onChangePassword) {
      onChangePassword();
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
    if (onLogout) {
      onLogout();
    }
  };

  const confirmLogout = () => {
    // Xử lý logout
    console.log("Logging out...");
    if (setUser) {
      setUser("");
    }
    setIsLogoutModalOpen(false);
    handleClose();
  };

  return (
    <>
      <Modal
        title="Hồ sơ cá nhân"
        open={openModalFromOutside}
        onCancel={handleClose}
        width={500}
        footer={null}
        centered
        className="simple-profile-modal"
      >
        <div className="simple-profile">
          {/* Header với thông tin chào hỏi */}
          <div className="profile-header">
            <Typography.Text className="greeting">Chào buổi chiều</Typography.Text>
            <Typography.Text className="user-group">
              {userInfo?.fullname || "Đang tải..."}
            </Typography.Text>
            <Typography.Text className="last-login">
              Lần đăng nhập gần nhất {userInfo?.lastLogin || "—"}
            </Typography.Text>
          </div>

          <div className="divider" />

          {/* Thông tin cá nhân */}
          <div className="profile-info">
            <InfoItem label="Họ và tên" value={userInfo?.fullname} required />
            <InfoItem label="Email" value={userInfo?.email} />
            <InfoItem label="Số điện thoại" value={userInfo?.phone} />
            <InfoItem label="Trạng thái" value={userInfo?.isActive ? "Đang hoạt động" : "Ngừng hoạt động"} required />
          </div>

          <div className="divider" />

          {/* Các action */}
          <div className="profile-actions">
            <ActionItem
              icon="edit"
              title="Chỉnh sửa hồ sơ"
              color="#1E3A8A"
              onClick={handleEditProfile}
            />
            <ActionItem
              icon="key"
              title="Đổi mật khẩu"
              color="#B47D10"
              onClick={handleChangePassword}
            />
            <ActionItem
              icon="logout"
              title="Đăng xuất hệ thống"
              color="#EE0033"
              onClick={handleLogout}
            />
          </div>
        </div>
      </Modal>

      {/* Modal chỉnh sửa hồ sơ */}
      <Modal
        title="Chỉnh sửa hồ sơ"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <div>Form chỉnh sửa hồ sơ ở đây</div>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal
        title="Đổi mật khẩu"
        open={isChangePasswordModalOpen}
        onCancel={() => setIsChangePasswordModalOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <div>Form đổi mật khẩu ở đây</div>
      </Modal>

      {/* Modal xác nhận logout */}
      <Modal
        title="Xác nhận đăng xuất"
        open={isLogoutModalOpen}
        onOk={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        centered
      >
        <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
      </Modal>
    </>
  );
};

// Component con cho mỗi thông tin
const InfoItem: React.FC<{ label: string; value?: string; required?: boolean }> = ({
  label,
  value,
  required,
}) => (
  <div className="info-item">
    <Typography.Text className="label">
      {label}
      {required && <span className="required">*</span>}
    </Typography.Text>
    <Typography.Text className="value">{value || "—"}</Typography.Text>
  </div>
);

// Component con cho mỗi action
const ActionItem: React.FC<{
  icon: "edit" | "key" | "logout";
  title: string;
  color: string;
  onClick: () => void;
}> = ({ icon, title, color, onClick }) => {
  const renderIcon = () => {
    switch (icon) {
      case "edit":
        return (
          <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
            <path
              d="M11.8169 3.44943H3.46756C2.83488 3.44943 2.22811 3.70076 1.78074 4.14813C1.33336 4.5955 1.08203 5.20227 1.08203 5.83495V22.5337C1.08203 23.1663 1.33336 23.7731 1.78074 24.2205C2.22811 24.6679 2.83488 24.9192 3.46756 24.9192H20.1663C20.7989 24.9192 21.4057 24.6679 21.8531 24.2205C22.3005 23.7731 22.5518 23.1663 22.5518 22.5337V14.1843M20.7626 1.66028C21.2372 1.18577 21.8807 0.919189 22.5518 0.919189C23.2229 0.919189 23.8664 1.18577 24.3409 1.66028C24.8155 2.13479 25.082 2.77836 25.082 3.44943C25.082 4.12049 24.8155 4.76406 24.3409 5.23857L13.0097 16.5698L8.23862 17.7626L9.43138 12.9915L20.7626 1.66028Z"
              stroke={color}
              strokeWidth="1.4"
            />
          </svg>
        );
      case "key":
        return (
          <svg width="20" height="20" viewBox="0 0 29 29" fill="none">
            <path
              d="M9.25 9.25L10.452 10.2809M22.939 28L13.5273 18.7221C11.706 19.4279 9.52995 19.1507 7.50843 18.5593C2.69407 17.1509 -0.0505646 12.1619 1.37811 7.41594C2.80679 2.67 7.86778 -0.0356348 12.6821 1.37274C17.4965 2.78112 20.2411 7.77018 18.8125 12.5161L18.5883 13.733L28 23.0109V28H22.939Z"
              stroke={color}
              strokeWidth="1.4"
            />
          </svg>
        );
      case "logout":
        return (
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path
              d="M19.7917 17.1507C19.0618 17.1507 18.4743 17.7445 18.4743 18.4681V23.75C18.4743 24.4798 17.8805 25.0674 17.1569 25.0674H13.1986V5.27572C13.1986 4.15006 12.4811 3.14193 11.3988 2.76465L11.0091 2.63477H17.1569C17.8867 2.63477 18.4743 3.22852 18.4743 3.95215V7.91048C18.4743 8.6403 19.0618 9.22786 19.7917 9.22786C20.5215 9.22786 21.109 8.63411 21.109 7.91048V3.95833C21.109 1.77506 19.334 0 17.1507 0H2.96875C2.91927 0 2.87598 0.0247396 2.8265 0.0309245C2.76465 0.0247396 2.7028 0 2.63476 0C1.18131 0 0 1.18132 0 2.64095V26.3909C0 27.5166 0.717448 28.5247 1.7998 28.902L9.73502 31.543C10.0072 31.6234 10.2731 31.6667 10.5514 31.6667C12.0049 31.6667 13.1924 30.4853 13.1924 29.0257V27.7083H17.1507C19.334 27.7083 21.109 25.9333 21.109 23.75V18.4743C21.109 17.7445 20.5215 17.1507 19.7917 17.1507Z"
              fill={color}
            />
            <path
              d="M31.2764 12.2584L26.0007 6.98271C25.6234 6.60543 25.0544 6.4941 24.5658 6.6982C24.071 6.90231 23.7493 7.38473 23.7493 7.91663V11.875H18.4736C17.7438 11.875 17.1562 12.4687 17.1562 13.1923C17.1562 13.916 17.75 14.5097 18.4736 14.5097H23.7493V18.4681C23.7493 19 24.071 19.4824 24.5658 19.6865C25.0605 19.8906 25.6296 19.7793 26.0007 19.402L31.2764 14.1263C31.7959 13.6129 31.7959 12.778 31.2764 12.2584Z"
              fill={color}
            />
          </svg>
        );
    }
  };

  return (
    <div className="action-item" onClick={onClick}>
      <div className="action-icon" style={{ color }}>
        {renderIcon()}
      </div>
      <Typography.Text className="action-title">{title}</Typography.Text>
      <RightOutlined className="action-arrow" />
    </div>
  );
};

export default SimpleProfile;