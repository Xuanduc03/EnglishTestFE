import type { ICrudService, PaginationParams } from "../../../components/shared/crud/type";
import { api } from "../../../configs/axios-custom";
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "./category.config";

export interface CategoryParams extends PaginationParams {
    keyword?: string;
    codeType?: string;
    status?: boolean;
    createFrom?: string; // yyyy-MM-dd
    createTo?: string;
    parentId?: string;
}

export const categorieservice: ICrudService<CategoryDto> & {
    getByCodeType: (codeType: string, parentId: string) => Promise<CategoryDto[]>;
    getRootIdByCodeType(codeType: string): Promise<string | null>;
    getSelectCategory: (
        parentId?: string
    ) => Promise<{ label: string; value: string }[]>;
} = {
    getAll: async (params: CategoryParams) => {
        const res = await api.get('/api/categories', {
            params: {
                // Pagination
                page: params.page ?? 1,
                pageSize: params.pageSize ?? 10,

                // SEARCH
                ...(params.keyword?.trim()
                    ? { keyword: params.keyword.trim() }
                    : {}),

                // FILTER
                ...(params.codeType
                    ? { codeType: params.codeType }
                    : {}),

                ...(params.status !== undefined
                    ? { status: params.status }
                    : {}),

                ...(params.parentId ? { parentId: params.parentId } : {}),

                ...(params.createFrom ? { createFrom: params.createFrom } : {}),
                ...(params.createTo ? { createTo: params.createTo } : {}),
            }
        });

        return res.data;
    },

    getById: async (id: string | number) => {
        const res = await api.get(`/api/categories/${id}`);
        return res.data;
    },
    create: async (data: Partial<CreateCategoryDto>) => {
        // Lưu ý: data create thường không có ID, dùng Omit hoặc Partial đều được
        return await api.post('/api/categories', data);
    },

    update: async (id: string | number, data: Partial<UpdateCategoryDto>) => {
        return await api.put(`/api/categories/${id}`, data);
    },

    delete: async (id: string | number) => {
        await api.delete(`/api/categories/${id}`);
    },

    getByCodeType: async (codeType: string, parentId: string): Promise<CategoryDto[]> => {
        const res = await api.get('/api/categories/code-type', {
            params: { codeType, parentId }
        });

        return res.data?.data ?? [];
    },

    // Hàm tách logic tìm id cha
    getRootIdByCodeType: async (codeType: string) => {
        const res = await api.get('/api/categories', {
            params: {
                codeType: codeType,
                parentId: null, // Tìm cấp cao nhất
                page: 1,
                pageSize: 1
            }
        });

        const items = res.data?.items || res.data?.data?.items || [];

        return items[0]?.id || null;
    },

    getSelectCategory: async (codeType?: string) => {
        const res = await api.get('/api/categories/select', { params: { codeType } });
        return res.data?.data || [];
    }
};