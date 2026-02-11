
// data response from api be
export interface Category {
    id: string;
    codeType: string;
    code: string;
    name: string;
    description?: string;
    status: boolean;
    orderIndex: number;
    parentId?: string | null;
    children?: Category[]; // Đệ quy cho cây danh mục
}

// data request to api be
export interface CategoryPayload {
    codeType: string;
    code: string;
    name: string;
    description?: string;
    status: boolean;
    orderIndex: number;
    parentId?: string | null;
}

// parameters for listing categories
export interface CategoryParams {
    keyword?: string;
    codeType?: string;
    page?: number;
    pageSize?: number;
}