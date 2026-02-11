import type { StateCreator } from "zustand";
import type { AuthState, LoginResultDto, LogoutRequest, RegisterDto, UserDetailDto } from "../../types/user";

export const createAuthSlice: StateCreator<AuthState> = (set, get) => ({
  // Initial State
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isSaveInfo: false,
  toastMessage: null,

  // Register Action
  register: async (registerData: RegisterDto) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      set({
        isLoading: false,
        toastMessage: 'Registration successful! Please check your email for verification.'
      });

      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
      throw error;
    }
  },

  // Login Action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const loginResult: LoginResultDto = await response.json();
      const result: LoginResultDto = await response.json();
      const { isSaveInfo } = get();
      saveTokens(result.token, result.refreshToken, isSaveInfo);

      set({
        isAuthenticated: true,
        isLoading: false,
        accessToken: loginResult.token,
        refreshToken: loginResult.refreshToken,
        expiresAt: new Date(loginResult.expiredAt),
        user: {
          id: loginResult.userId,
          email: loginResult.email,
          username: loginResult.username,
          fullname: loginResult.username,
          phone: null,
          isActive: true,
          isEmailVerified: false,
          isDeleted: false,
          failedLoginAttempts: 0,
          lockoutEnd: null,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          roles: loginResult.roles.map(role => ({
            id: role,
            name: role,
            permissions: []
          })),
          permissions: [],
          stats: undefined
        },
        toastMessage: 'Login successful!'
      });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  },

  // Logout Action
  logout: async () => {
    clearTokens();

    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isLoading: false,
    });
  },

  // Refresh Tokens Action
  refreshTokens: async () => {
    const { refreshToken, isSaveInfo } = get();
    if (!refreshToken) throw new Error("No refresh token");

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error("Failed to refresh token");

      const result: LoginResultDto = await response.json();

      saveTokens(result.token, result.refreshToken, isSaveInfo);

      set({
        accessToken: result.token,
        refreshToken: result.refreshToken,
        expiresAt: new Date(result.expiredAt),
      });

    } catch (err) {
      get().logout();
      throw err;
    }
  },

  hydrateAuth: () => {
    const { accessToken, refreshToken } = loadTokens();

    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    }
  },


  // Get User Profile
  getUserProfile: async () => {
    const { accessToken } = get();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    set({ isLoading: true });

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userDetail: UserDetailDto = await response.json();

      // Convert string dates to Date objects properly
      const processedUser: UserDetailDto = {
        ...userDetail,
        lockoutEnd: userDetail.lockoutEnd ? new Date(userDetail.lockoutEnd) : undefined,
        lastLogin: userDetail.lastLogin ? new Date(userDetail.lastLogin) : undefined,
        createdAt: new Date(userDetail.createdAt),
        updatedAt: new Date(userDetail.updatedAt),
        deletedAt: userDetail.deletedAt ? new Date(userDetail.deletedAt) : undefined,
        stats: userDetail.stats ? {
          ...userDetail.stats,
          lastActiveAt: userDetail.stats.lastActiveAt ? new Date(userDetail.stats.lastActiveAt) : undefined,
        } : undefined,
      };

      set({
        user: processedUser,
        isLoading: false,
      });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      });
      throw error;
    }
  },

  // Update User Profile
  updateUserProfile: async (userData: Partial<UserDetailDto>) => {
    const { accessToken } = get();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    set({ isLoading: true });

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser: UserDetailDto = await response.json();

      // Process dates properly
      const processedUser: UserDetailDto = {
        ...updatedUser,
        lockoutEnd: updatedUser.lockoutEnd ? new Date(updatedUser.lockoutEnd) : undefined,
        lastLogin: updatedUser.lastLogin ? new Date(updatedUser.lastLogin) : undefined,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt),
        deletedAt: updatedUser.deletedAt ? new Date(updatedUser.deletedAt) : undefined,
        stats: updatedUser.stats ? {
          ...updatedUser.stats,
          lastActiveAt: updatedUser.stats.lastActiveAt ? new Date(updatedUser.stats.lastActiveAt) : undefined,
        } : undefined,
      };

      set({
        user: processedUser,
        isLoading: false,
        toastMessage: 'Profile updated successfully!'
      });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      });
      throw error;
    }
  },

  // Utility Actions
  clearError: () => set({ error: null }),

  setToastMessage: (message: string | null) => set({ toastMessage: message }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  rememberMe: (isSaveInfo: boolean, username: string) => set({ isSaveInfo }),

  checkAuth: async () => {
    const { accessToken, expiresAt, refreshTokens, logout } = get();

    if (!accessToken || !expiresAt) return false;

    const isExpired = new Date() > new Date(expiresAt);

    if (!isExpired) return true;

    try {
      await refreshTokens();
      return true;
    } catch {
      logout();
      return false;
    }
  },


});

const saveTokens = (access: string, refresh: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  } else {
    sessionStorage.setItem("accessToken", access);
    sessionStorage.setItem("refreshToken", refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

const loadTokens = () => {
  return {
    accessToken:
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken"),
    refreshToken:
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken"),
  };
};
