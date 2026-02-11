import { api } from "../../../configs/axios-custom";
import type {
  ProfileResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse
} from "./profile.types";

export const ProfileService = {
  // Lấy thông tin profile
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const res = await api.get('/api/students/me');
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Cập nhật thông tin profile (với file upload)
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    try {
      const formData = new FormData();
      
      // Thêm các trường text
      if (data.fullname) formData.append('fullname', data.fullname);
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      if (data.gender) formData.append('gender', data.gender);
      if (data.birthDate) formData.append('birthDate', 
        typeof data.birthDate === 'string' ? data.birthDate : data.birthDate.toISOString()
      );
      
      // Thêm file nếu có
      if (data.avatarFile) {
        formData.append('avatarFile', data.avatarFile);
      }

      const res = await api.post('/api/students/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Cập nhật profile không có file (chỉ thông tin cơ bản)
  updateProfileInfo: async (data: Omit<UpdateProfileRequest, 'avatarFile'>): Promise<ProfileResponse> => {
    try {
      const res = await api.put('/api/students/profile', data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile info');
    }
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
      const res = await api.post('/api/students/change-password', data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Upload avatar riêng
  uploadAvatar: async (file: File): Promise<ProfileResponse> => {
    try {
      const formData = new FormData();
      formData.append('avatarFile', file);
      
      const res = await api.post('/api/students/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  }
};