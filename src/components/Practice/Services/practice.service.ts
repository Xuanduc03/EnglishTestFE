// practice.service.ts

import { api } from '../../../configs/axios-custom';
import type { CategoryDto } from '../../../pages/Admin/Categories/category.config';
import type {
  CreatePracticeRequest,
  PracticeSessionDto,
  SubmitPracticeAnswerRequest,
  SubmitAnswerResult,
  PracticeResultDto,
  PracticeHistoryDto,
  PaginatedResult,
  PracticeStatistics,
} from '../Types/practice.type';

export const PracticeService = {
  // ============================================
  // 1. START PRACTICE SESSION
  // ============================================

  /**
   * Tạo session practice mới
   * POST /api/practice/start
   */
  startPractice: async (request: CreatePracticeRequest): Promise<PracticeSessionDto> => {
    const res = await api.post('/api/practice/start', request);
    return res.data?.data || res.data;
  },

  // ============================================
  // 2. SUBMIT ANSWER
  // ============================================

  /**
   * Submit câu trả lời cho 1 question
   * POST /api/practice/answer
   */
  submitAnswer: async (request: SubmitPracticeAnswerRequest): Promise<SubmitAnswerResult> => {
    const res = await api.post('/api/practice/answer', request);
    return res.data?.data || res.data;
  },

  // ============================================
  // 3. SUBMIT PRACTICE SESSION
  // ============================================

  /**
   * Submit toàn bộ practice session
   * POST /api/practice/{sessionId}/submit
   */
  submitPractice: async (sessionId: string): Promise<PracticeResultDto> => {
    const res = await api.post(`/api/practice/${sessionId}/submit`);
    return res.data?.data || res.data;
  },

  // ============================================
  // 4. GET PRACTICE RESULT
  // ============================================

  /**
   * Lấy kết quả practice
   * GET /api/practice/{sessionId}/result
   */
  getResult: async (sessionId: string): Promise<PracticeResultDto> => {
    const res = await api.get(`/api/practice/${sessionId}/result`);
    return res.data?.data || res.data;
  },

  // ============================================
  // 5. GET PRACTICE HISTORY
  // ============================================

  /**
   * Lấy lịch sử practice
   * GET /api/practice/history?categoryId=xxx&page=1&pageSize=10
   */
  getHistory: async (params: {
    categoryId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<PracticeHistoryDto>> => {
    const res = await api.get('/api/practice/history', { params });

    // Backend trả về data và pagination riêng
    return {
      items: res.data?.data || [],
      totalCount: res.data?.pagination?.total || 0,
      pageIndex: res.data?.pagination?.page || 1,
      pageSize: res.data?.pagination?.pageSize || 10,
      totalPages: res.data?.pagination?.totalPages || 0,
      hasPrevious: (res.data?.pagination?.page || 1) > 1,
      hasNext: (res.data?.pagination?.page || 1) < (res.data?.pagination?.totalPages || 0)
    };
  },

  // ============================================
  // 6. GET PRACTICE STATISTICS
  // ============================================

  /**
   * Lấy thống kê practice của user
   * GET /api/practice/statistics
   */
  getStatistics: async (): Promise<PracticeStatistics> => {
    const res = await api.get('/api/practice/statistics');
    return res.data?.data || res.data;
  },

  // ============================================
  // 7. ABANDON PRACTICE
  // ============================================

  /**
   * Bỏ practice giữa chừng
   * POST /api/practice/{sessionId}/abandon
   */
  abandonPractice: async (sessionId: string): Promise<void> => {
    await api.post(`/api/practice/${sessionId}/abandon`);
  },

  // ============================================
  // 8. RESUME PRACTICE
  // ============================================

  /**
   * Resume practice session đang dở
   * GET /api/practice/{sessionId}/resume
   */
  resumePractice: async (sessionId: string): Promise<PracticeSessionDto> => {
    const res = await api.get(`/api/practice/${sessionId}/resume`);
    return res.data?.data || res.data;
  },

  // ============================================
  // HELPER: Get Category Tree (existing)
  // ============================================

  /**
   * Lấy danh sách skills và parts
   * GET /api/categories/tree/{parentId}
   */
  getByCodeType: async (
    codeType: string,
    parentId?: string
  ): Promise<CategoryDto[]> => {

    const params: any = { codeType };

    if (parentId) {
      params.parentId = parentId;
    }

    const res = await api.get('/api/categories/code-type', { params });

    return res?.data?.data ?? [];
  }
};