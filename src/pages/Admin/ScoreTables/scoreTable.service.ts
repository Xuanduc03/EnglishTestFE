import type { PaginationParams, PaginatedResult } from "../../../components/shared/crud/type"; // Import từ file definition chung
import { api } from "../../../configs/axios-custom";
import type { 
  ScoreTableListItem, 
  ScoreTableDetail, 
  UpsertScoreTableRequest, 
  ConversionRule
} from "./scoreTable.types";

// Định nghĩa Params
export interface ScoreTableParams extends PaginationParams {
  keyword?: string;
  examId?: string;
  categoryId?: string;
}

export const ScoreTableService = {
  
  /**
   * GET /api/score-table
   * Sửa lỗi: Phải trả về Promise<PaginatedResult<T>> khớp với ICrudService
   */
  getAll: async (params: ScoreTableParams): Promise<PaginatedResult<ScoreTableListItem>> => {
    // 1. Gọi API
    const res = await api.get('/api/score-table', { params });

    // 2. Lấy dữ liệu từ response
    // Cấu trúc Controller trả về: { success: true, data: { items: [], totalCount: 10, ... } }
    // Axios bọc thêm 1 lớp .data nữa -> res.data.data
    const responseData = res.data?.data; 

    // 3. Map về chuẩn của ICrudService ({ data, total })
    return {
      data: responseData?.items || [],       // Backend trả 'items', ICrud cần 'data'
      total: responseData?.totalCount || 0   // Backend trả 'totalCount', ICrud cần 'total'
    };
  },

  /**
   * GET /api/score-table/{id}
   */
  getById: async (id: string | number): Promise<ScoreTableDetail> => {
    const res = await api.get(`/api/score-table/${id}`);
    return res.data?.data; // Unwrap data
  },

  /**
   * CREATE
   */
  create: async (data: Partial<UpsertScoreTableRequest>) => {
    const res = await api.post('/api/score-table', data);
    return res.data;
  },

  /**
   * UPDATE
   */
  update: async (id: string | number, data: Partial<UpsertScoreTableRequest>) => {
    const res = await api.put(`/api/score-table/${id}`, data);
    return res.data;
  },

  /**
   * DELETE
   */
  delete: async (id: string | number) => {
    await api.delete(`/api/score-table/${id}`);
  },

  // --- Các hàm phụ trợ khác (không bắt buộc theo ICrudService) ---

  upsertRule: (id: string, rule: ConversionRule) => {
    return api.patch(`/api/score-table/${id}/rules`, rule);
  },

  deleteRule: (id: string, correctAnswers: number) => {
    return api.delete(`/api/score-table/${id}/rules/${correctAnswers}`);
  }
};