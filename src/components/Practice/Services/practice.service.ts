// practice.service.ts

import { api } from '../../../configs/axios-custom';
import type { CategoryDto } from '../../../pages/Admin/Categories/category.config';
import type {
  CreatePracticeRequest,
  PracticeSessionDto,
  SubmitPracticeRequest,
  PracticeResultDto,
  PracticeHistoryDto,
  PaginatedResult,
  AbandonPracticeRequest,
  InProgressPracticeDto,
  ReviewQuestionDto,
} from '../Types/practice.type';

export const PracticeService = {
  // ============================================
  // 1. START PRACTICE SESSION
  // POST /api/practice/start
  // ============================================
  startPractice: async (request: CreatePracticeRequest): Promise<PracticeSessionDto> => {
    const res = await api.post('/api/practice/start', request);
    return res.data?.data || res.data;
  },

  // ============================================
  // 2. SUBMIT PRACTICE SESSION
  // POST /api/practice/{sessionId}/submit
  // ============================================
  submitPractice: async (request: SubmitPracticeRequest): Promise<PracticeResultDto> => {
    const res = await api.post(`/api/practice/${request.sessionId}/submit`, {
      answers: request.answers,
      totalTimeSeconds: request.totalTimeSeconds,
    });
    return res.data?.data || res.data;
  },

  // ============================================
  // 3. GET PRACTICE RESULT
  // GET /api/practice/{sessionId}/result
  // ============================================
  getResult: async (sessionId: string): Promise<PracticeResultDto> => {
    const res = await api.get(`/api/practice/${sessionId}/result`);
    return res.data?.data || res.data;
  },

  // ============================================
  // 4. GET PRACTICE HISTORY
  // GET /api/practice/history?categoryId=xxx&page=1&pageSize=10
  // ============================================
  getHistory: async (params: {
    categoryId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<PracticeHistoryDto>> => {
    const res = await api.get('/api/practice/history', { params });
    return {
      items: res.data?.data || [],
      totalCount: res.data?.pagination?.total || 0,
      pageIndex: res.data?.pagination?.page || 1,
      pageSize: res.data?.pagination?.pageSize || 10,
      totalPages: res.data?.pagination?.totalPages || 0,
      hasPrevious: (res.data?.pagination?.page || 1) > 1,
      hasNext: (res.data?.pagination?.page || 1) < (res.data?.pagination?.totalPages || 0),
    };
  },

  // ============================================
  // 5. ABANDON PRACTICE (lưu nháp giữa chừng)
  // POST /api/practice/{sessionId}/abandon
  // Backend nhận AbandonPracticeCommand { SessionId, Answers, TotalTimeSeconds }
  // ============================================
  abandonPractice: async (request: AbandonPracticeRequest): Promise<boolean> => {
    const res = await api.post(`/api/practice/${request.sessionId}/abandon`, {
      sessionId: request.sessionId,
      answers: request.answers,
      totalTimeSeconds: request.totalTimeSeconds,
    });
    return res.data?.success ?? true;
  },

  // ============================================
  // 6. GET IN-PROGRESS PRACTICES
  // GET /api/practice/in-progress
  // ============================================
  getInProgressPractices: async (): Promise<InProgressPracticeDto[]> => {
    const res = await api.get('/api/practice/in-progress');
    return res.data?.data || [];
  },

  // ============================================
  // 7. RESUME PRACTICE
  // GET /api/practice/{sessionId}/resume
  // ============================================
  resumePractice: async (sessionId: string): Promise<PracticeSessionDto> => {
    const res = await api.get(`/api/practice/${sessionId}/resume`);
    return res.data?.data || res.data;
  },

  // ============================================
  // 8. GET REVIEW
  // GET /api/practice/{sessionId}/review
  // ============================================
  getReview: async (sessionId: string): Promise<ReviewQuestionDto[]> => {
    const res = await api.get(`/api/practice/${sessionId}/review`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.questions)) return data.questions;
    return [];
  },

  // ============================================
  // HELPER: Get Category/Part list
  // GET /api/categories/code-type?codeType=xxx
  // ============================================
  getByCodeType: async (
    codeType: string,
    parentId?: string
  ): Promise<CategoryDto[]> => {
    const params: Record<string, string> = { codeType };
    if (parentId) params.parentId = parentId;
    const res = await api.get('/api/categories/code-type', { params });
    return res?.data?.data ?? [];
  },
};