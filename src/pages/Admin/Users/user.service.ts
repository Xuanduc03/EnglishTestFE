import type { PaginationParams } from "../../../components/shared/crud/type";
import { api } from "../../../configs/axios-custom";
import type { UserListDto, UserUpdateDto } from "./user.type";

export interface UserParams extends PaginationParams {
  keyword?: string;
  role?: string;
}

export const UserService = {
  getAll: async (params: UserParams) => {
    const res = await api.get('/api/users', {
      params: {
        pageIndex: params.page ?? 1,
        pageSize: params.pageSize ?? 10,

        ...(params.keyword && { keyword: params.keyword }),
        ...(params.roleIds?.length && { roleIds: params.roleIds }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.isEmailVerified !== undefined && {
          isEmailVerified: params.isEmailVerified
        }),
        ...(params.includeDeleted && { includeDeleted: true })
      }
    });

    return res.data;
  },

  getById: async (id: string | number) => {
    const res = await api.get(`/api/users/${id}`);
    const data = res.data?.data || res.data;
    if (data && data.roles) {
        data.roleIds = data.roles.map((r: any) => r.id);
    }
    
    return data;
  },
  create: async (data: Partial<UserListDto>) => {
    return await api.post('/api/users', data);
  },

  update: async (id: string | number, data: Partial<UserUpdateDto>) => {
    return await api.put(`/api/users/${id}`, data);
  },

  delete: async (id: string | number) => {
    await api.delete(`/api/users/${id}`);
  },
};