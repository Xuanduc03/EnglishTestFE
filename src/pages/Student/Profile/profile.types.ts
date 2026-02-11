export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullname: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  gender?: string;
  birthDate?: string | Date;
  streak: number;
  points: number;
  memberLevel: string;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  avatarPublicId?: string;
}

export interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string | Date;
  avatarFile?: File;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}