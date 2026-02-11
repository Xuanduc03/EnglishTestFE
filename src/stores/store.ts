import {create} from 'zustand';
import type { AuthState } from '../types/user';
import { createAuthSlice } from './auth/slice';

export const useAuthStore = create<AuthState>()((...a) => ({
  ...createAuthSlice(...a),
}));
