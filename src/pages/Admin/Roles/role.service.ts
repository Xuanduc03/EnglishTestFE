import { data } from "react-router-dom";
import { api } from "../../../configs/axios-custom"
import type { CreateRolePayload, RoleDto, RoleParams, UpdateRolePayload } from "./role.type"
import type { ICrudService } from "../../../components/shared/crud/type";

export const RoleService: ICrudService<RoleDto> & {
    getAllPermissions: () => Promise<any[]>,
    getSelectRole: () => Promise<any[]>
} = {
    // 1. GET ALL ROLES
    getAll: async () => {
        const res = await api.get('/api/roles');
        return res.data;
    },

    // 2. GET BY ID (Quan trọng: Map permissions -> permissionIds cho Form Edit)
    getById: async (id: string | number) => {
        const res = await api.get(`/api/roles/${id}`);
        const data = res.data?.data || res.data;

        if (data && data.permissions) {
            data.permissionIds = data.permissions.map((p: any) => p.id);
        }

        return data;
    },

    // 3. CREATE
    create: async (data: Partial<CreateRolePayload>) => {
        return await api.post('/api/roles', data);
    },

    // 4. UPDATE
    update: async (id: string | number, data: Partial<UpdateRolePayload>) => {
        return await api.put(`/api/roles/${id}`, data);
    },

    // 5. DELETE
    delete: async (id: string | number) => {
        await api.delete(`/api/roles/${id}`);
    },

    // 6. HELPER: Lấy danh sách tất cả quyền (để nạp vào Select)
    getAllPermissions: async () => {
        // Giả sử API lấy list permissions là /api/permissions
        const res = await api.get('/api/permissions');
        const items = res.data?.data?.items || res.data || [];

        // Map về dạng { label, value } cho Form Select
        return items.map((p: any) => ({
            label: `${p.module ? `[${p.module}] ` : ''}${p.name}`, // VD: [User] Create
            value: p.id
        }));
    },

    getSelectRole: async () => {
        const res = await api.get("/api/roles/select-role");
        return res.data?.data ?? [];
    }
}