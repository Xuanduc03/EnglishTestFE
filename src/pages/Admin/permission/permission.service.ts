// src/pages/Admin/Permission/permission.service.ts

import { api } from "../../../configs/axios-custom";
import type { ICrudService } from "../../../components/shared/crud/type";
import type { PermissionDto } from "./permission.type";

export const PermissionService: ICrudService<PermissionDto> = {
  // 1. GET ALL
  // API Backend: GET /api/permissions?module=...
  getAll: async (params) => {
    const res = await api.get('/api/permissions', { params });
    // Backend trả về mảng phẳng: [{id: 1, ...}, {id: 2, ...}]
    // Hook useCrud đã fix ở bước trước sẽ tự hiểu đây là data
    return res.data; 
  },

  // 2. GET BY ID
  getById: async (id) => {
    const res = await api.get(`/api/permissions/${id}`);
    return res.data;
  },

  // 3. CREATE (Nếu hệ thống cho phép tạo quyền động)
  create: async (data) => {
    return await api.post('/api/permissions', data);
  },

  // 4. UPDATE
  update: async (id, data) => {
    return await api.put(`/api/permissions/${id}`, data);
  },

  // 5. DELETE
  delete: async (id) => {
    await api.delete(`/api/permissions/${id}`);
  }
};