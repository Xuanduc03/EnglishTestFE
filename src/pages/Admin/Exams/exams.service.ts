import type { PaginationParams } from "../../../components/shared/crud/type";
import { api } from "../../../configs/axios-custom";
import type {
  ExamSummaryDto,
  ExamDetailDto,
  CreateExamDto,
  UpdateExamDto,
  CreateExamSectionDto,
  AddQuestionToExamDto
} from "./exam.types";

export interface ExamParams extends PaginationParams {
  keyword?: string;
  status?: string;
  type?: number;
  category?: number;
  scope?: number;
}

export const ExamService = {
  // ============================================
  // CRUD CƠ BẢN (CHO SCREEN 1: DANH SÁCH)
  // ============================================

  getAll: async (params: ExamParams) => {
    const res = await api.get('/api/exams', {
      params: {
        pageIndex: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.keyword && { keyword: params.keyword }),
        ...(params.status && params.status !== 'all' && { status: params.status }),
        ...(params.type && { type: params.type }),
        ...(params.category && { category: params.category }),
        ...(params.scope && { scope: params.scope })
      }
    });
    return res.data;
  },

  getById: async (id: string | number): Promise<any> => {
    const res = await api.get(`/api/exams/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: any) => {
    return await api.post('/api/exams', data);
  },

  update: async (id: string | number, data: any) => {
    return await api.put(`/api/exams/${id}`, data);
  },

  delete: async (id: string | number) => {
    await api.delete(`/api/exams/${id}`);
  },

  // ============================================
  // EXAM ACTIONS (PUBLISH, ARCHIVE...)
  // ============================================

  publish: async (id: string) => {
    return await api.post(`/api/exams/${id}/publish`);
  },

  // PATCH /api/exams/{id}/status
  changeStatus: async (id: string, newStatus: number, reason?: string) => {
    return await api.patch(`/api/exams/${id}/status`, { newStatus, reason });
  },

  duplicate: async (id: string, newCode: string, newTitle: string) => {
    return await api.post(`/api/exams/${id}/status`, {
      newCode,
      newTitle
    });
  },

  // ============================================
  // SECTION MANAGEMENT (CHO SCREEN 2: CẤU TRÚC)
  // ============================================

  addSection: async (examId: string, data: CreateExamSectionDto) => {
    return await api.post(`/api/exams/${examId}/sections`, data);
  },

  updateSection: async (sectionId: string, data: Partial<CreateExamSectionDto>) => {
    return await api.put(`/api/exams/sections/${sectionId}`, data);
  },

  deleteSection: async (examId: string, sectionId: string) => {
    return await api.delete(`/api/exams/${examId}/sections/${sectionId}`);
  },

  // xóa nhiều câu hỏi trong section
  // Trong ExamService, thêm:
  bulkDeleteQuestions: async (examId: string, examQuestionIds: string[]) => {
    return await api.delete(`/api/exams/${examId}/questions`, {
      data: examQuestionIds // axios gửi body trong DELETE cần đặt trong data
    });
  },

  // ============================================
  // QUESTION MANAGEMENT (CHO SCREEN 2: CẤU TRÚC)
  // ============================================
  
  addQuestionsToSection: async (
    examId: string,
    sectionId: string,
    data: AddQuestionToExamDto
  ) => {
    return await api.post(
      `/api/exams/${examId}/sections/${sectionId}/questions`,
      data
    );
  },

  removeQuestion: async (examId: string, examQuestionId: string) => {
    return await api.delete(`/api/exams/${examId}/questions/${examQuestionId}`);
  },

  reorderQuestions: async (
    examId: string,
    sectionId: string,
    items: { examQuestionId: string; orderIndex: number }[]
  ) => {
    return await api.put(
      `/api/exams/${examId}/sections/${sectionId}/questions/reorder`,
      { items }
    );
  },

  updateQuestionPoint: async (
    examId: string,
    examQuestionId: string,
    point: number
  ) => {
    return await api.patch(
      `/api/exams/${examId}/questions/${examQuestionId}/point`,
      { point }
    );
  }
};