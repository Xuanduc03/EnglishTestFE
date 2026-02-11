import type { StateCreator } from "zustand";

// DTO Types matching your C# classes
export type RegisterDto = {
  email: string;
  password: string;
  username: string;
  phone?: string | null;
};

export type LoginResultDto = {
  userId: string; // Guid in C# maps to string in TS
  username: string;
  email: string;
  roles: string[];
  token: string;
  refreshToken: string;
  expiredAt: Date;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type RoleDetailDto = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
};

export type UserStatsDto = {
  totalLoginCount?: number;
  lastActiveAt?: Date;
  profileCompletion?: number;
  // Add other stats fields as needed
};

export type UserDetailDto = {
  id: string;
  email: string;
  username: string;
  fullname: string;
  phone?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isDeleted: boolean;
  failedLoginAttempts: number;
  lockoutEnd?: Date | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  roles: RoleDetailDto[];
  permissions: string[];
  stats?: UserStatsDto | null;
};

// Slice State
export interface AuthState {
  // Authentication State
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshToken: string | null;
  
  // User Data
  user: UserDetailDto | null;
  accessToken: string | null;
  expiresAt: Date | null;
  
  // UI State
  isSaveInfo: boolean;
  toastMessage: string | null;
  
  // Actions
  register: (registerData: RegisterDto) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: (logoutRequest?: LogoutRequest) => Promise<void>;
  refreshTokens: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  updateUserProfile: (userData: Partial<UserDetailDto>) => Promise<void>;
  clearError: () => void;
  setToastMessage: (message: string | null) => void;
  setLoading: (loading: boolean) => void;
  rememberMe: (isSaveInfo: boolean, username: string) => void;
  checkAuth: () => Promise<boolean>;

}