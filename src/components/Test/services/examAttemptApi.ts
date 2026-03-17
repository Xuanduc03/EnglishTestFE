// src/services/examAttempt.service.ts
import { api } from '../../../configs/axios-custom';
import type {
  ExamAttemptDto,
  ExamResultDto,
  SubmitExamResult,
  InProgressAttemptDto,
  SaveAnswerCommand,
  StartExamCommand,
  ExamSectionPreview,
  ExamQuestionPreview,
  ExamHistoryItem,
  ExamReviewDto,
  ExamAnalyticsDto,
} from '../../../pages/Student/FullTest/examAttempt.types';

// ── Helpers ────────────────────────────────────────────────────
export const flattenQuestions = (
  sections: ExamSectionPreview[]
): ExamQuestionPreview[] =>
  sections
    .flatMap(s => s.questions)
    .sort((a, b) => a.orderIndex - b.orderIndex);

export const parseExamData = (raw: any): ExamAttemptDto | null => {
  if (!raw) return null;
  if (raw.sections?.length && !raw.questions?.length) {
    raw.questions = flattenQuestions(raw.sections);
  }
  return raw as ExamAttemptDto;
};

// ── Service ────────────────────────────────────────────────────
class ExamAttemptService {

  /** POST /api/exam-attempts/start */
  async startExam(command: StartExamCommand): Promise<ExamAttemptDto> {
    const response = await api.post('/api/exam-attempts/start', command);
    return parseExamData(response.data?.data ?? response.data)!;
  }

  /** POST /api/exam-attempts/auto-save */
  async saveAnswer(command: SaveAnswerCommand): Promise<void> {
    await api.post('/api/exam-attempts/auto-save', command);
  }

  /**
   * POST /api/exam-attempts/{attemptId}/submit
   * Trả về SubmitExamResult — điểm TOEIC ngay sau khi nộp
   */
  async submitExam(attemptId: string): Promise<SubmitExamResult> {
    const response = await api.post(`/api/exam-attempts/${attemptId}/submit`);
    return response.data?.data ?? response.data;
  }

  /**
   * GET /api/exam-attempts/{attemptId}/result
   * Trả về ExamResultDto — kết quả chi tiết theo section
   */
  async getExamResult(attemptId: string): Promise<ExamResultDto> {
    const response = await api.get(`/api/exam-attempts/${attemptId}/result`);
    return response.data?.data ?? response.data;
  }

  /** GET /api/exam-attempts/{attemptId}/resume */
  async resumeExam(attemptId: string): Promise<ExamAttemptDto> {
    const response = await api.get(`/api/exam-attempts/${attemptId}/resume`);
    return parseExamData(response.data?.data ?? response.data)!;
  }

  /** GET /api/exam-attempts/in-progress */
  async getInProgressAttempts(): Promise<InProgressAttemptDto[]> {
    const response = await api.get('/api/exam-attempts/in-progress');
    return response.data?.data ?? response.data;
  }

  /** GET /api/exam-attempts/history */
  async getHistory(params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: ExamHistoryItem[]; meta: any }> {
    const response = await api.get('/api/exam-attempts/history', { params });
    return response.data?.data ?? response.data;
  }

  /** GET /api/exam-attempts/{attemptId}/review */
  async getReview(attemptId: string): Promise<ExamReviewDto> {
    const response = await api.get(`/api/exam-attempts/${attemptId}/review`);
    return response.data?.data ?? response.data;
  }


  // Phân tích bài học người dùng 
  async getAnalytics(lastN = 5): Promise<ExamAnalyticsDto> {
  const res = await api.get('/api/exam-attempts/analytics', { params: { lastN } });
  return res.data?.data ?? res.data;
}
}

export const examAttemptService = new ExamAttemptService();