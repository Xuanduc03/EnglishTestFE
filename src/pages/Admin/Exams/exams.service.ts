import { toast } from 'react-toastify';
import type { PaginationParams } from "../../../components/shared/crud/type";
import { api } from "../../../configs/axios-custom";
import type {
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

export interface HomeExamParams {
  pageIndex?: number;
  pageSize?: number;
  type?: number; // 1: TOEIC, 2: IELTS
}

const handleError = (err: any) => {
  const msg = err?.response?.data?.message || 'Có lỗi xảy ra!';
  toast.error(msg);
  throw err; // ⚠️ vẫn throw để component xử lý tiếp
};

export const ExamService = {

  getAll: async (params: ExamParams) => {
    try {
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
    } catch (err) {
      handleError(err);
    }
  },

  getById: async (id: string | number): Promise<any> => {
    try {
      const res = await api.get(`/api/exams/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      handleError(err);
    }
  },

  create: async (data: any) => {
    try {
      return await api.post('/api/exams', data);
    } catch (err) {
      handleError(err);
    }
  },

  update: async (id: string | number, data: any) => {
    try {
      return await api.put(`/api/exams/${id}`, data);
    } catch (err) {
      handleError(err);
    }
  },

  delete: async (id: string | number) => {
    try {
      await api.delete(`/api/exams/${id}`);
    } catch (err) {
      handleError(err);
    }
  },

  publish: async (id: string) => {
    try {
      return await api.post(`/api/exams/${id}/publish`);
    } catch (err) {
      handleError(err);
    }
  },

  changeStatus: async (id: string, newStatus: number, reason?: string) => {
    try {
      return await api.patch(`/api/exams/${id}/status`, { newStatus, reason });
    } catch (err) {
      handleError(err);
    }
  },

  duplicate: async (id: string, newCode: string, newTitle: string) => {
    try {
      return await api.post(`/api/exams/${id}/duplicate`, {
        newCode,
        newTitle
      });
    } catch (err) {
      handleError(err);
    }
  },

  getPreview: async (examId: string, showCorrectAnswers = true) => {
    try {
      const res = await api.get(`/api/exams/${examId}/preview`, {
        params: { showCorrectAnswers }
      });
      return res.data?.data || res.data;
    } catch (err) {
      handleError(err);
    }
  },

  addSection: async (examId: string, data: CreateExamSectionDto) => {
    try {
      return await api.post(`/api/exams/${examId}/sections`, data);
    } catch (err) {
      handleError(err);
    }
  },

  updateSection: async (sectionId: string, data: Partial<CreateExamSectionDto>) => {
    try {
      return await api.put(`/api/exams/sections/${sectionId}`, data);
    } catch (err) {
      handleError(err);
    }
  },

  deleteSection: async (examId: string, sectionId: string) => {
    try {
      return await api.delete(`/api/exams/${examId}/sections/${sectionId}`);
    } catch (err) {
      handleError(err);
    }
  },

  bulkDeleteQuestions: async (examId: string, examQuestionIds: string[]) => {
    try {
      return await api.delete(`/api/exams/${examId}/questions`, {
        data: examQuestionIds
      });
    } catch (err) {
      handleError(err);
    }
  },

  addQuestionsToSection: async (
    examId: string,
    sectionId: string,
    data: AddQuestionToExamDto
  ) => {
    try {
      return await api.post(
        `/api/exams/${examId}/sections/${sectionId}/questions`,
        data
      );
    } catch (err) {
      handleError(err);
    }
  },

  removeQuestion: async (examId: string, examQuestionId: string) => {
    try {
      return await api.delete(`/api/exams/${examId}/questions/${examQuestionId}`);
    } catch (err) {
      handleError(err);
    }
  },

  reorderQuestions: async (
    examId: string,
    sectionId: string,
    items: { examQuestionId: string; orderIndex: number }[]
  ) => {
    try {
      return await api.put(
        `/api/exams/${examId}/sections/${sectionId}/questions/reorder`,
        { items }
      );
    } catch (err) {
      handleError(err);
    }
  },

  updateQuestionPoint: async (
    examId: string,
    examQuestionId: string,
    point: number
  ) => {
    try {
      return await api.patch(
        `/api/exams/${examId}/questions/${examQuestionId}/point`,
        { point }
      );
    } catch (err) {
      handleError(err);
    }
  },
  getHomeExams: async (params: HomeExamParams) => {
    try {
      const res = await api.get('/api/exams/home', {
        params: {
          pageIndex: params.pageIndex ?? 1,
          pageSize: params.pageSize ?? 8, // Mặc định lấy 8 đề
          ...(params.type && { type: params.type })
        }
      });
      // Trả về thẳng res.data (chính là object PagedResult có chứa Items, TotalCount...)
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

};