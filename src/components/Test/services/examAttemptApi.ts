// src/services/examAttempt.service.ts
import { api } from '../../../configs/axios-custom';
import type { ExamAttemptDto, ExamResultDto, InProgressAttemptDto, SaveAnswerCommand, StartExamCommand } from '../types/examAttempt.types';

class ExamAttemptService {
    /**
     * Bắt đầu bài thi mới
     */
    async startExam(command: StartExamCommand) {
        const response = await api.post('/api/exam-attempts/start', command);
        return response.data.data as ExamAttemptDto;
    }

    /**
     * Tự động lưu câu trả lời
     */
    async saveAnswer(command: SaveAnswerCommand) {
        const response = await api.post('/api/exam-attempts/auto-save', command);
        return response.data.data;
    }

    /**
     * Nộp bài thi
     */
    async submitExam(attemptId: string) {
        const response = await api.post(`/api/exam-attempts/${attemptId}/submit`);
        return response.data.data as ExamResultDto;
    }

    /**
     * Tiếp tục bài thi đang dở
     */
    async resumeExam(attemptId: string) {
        const response = await api.get(`/api/exam-attempts/${attemptId}/resume`);
        return response.data.data as ExamAttemptDto;
    }

    /**
     * Lấy danh sách bài thi đang làm dở
     */
    async getInProgressAttempts() {
        const response = await api.get('/api/exam-attempts/in-progress');
        return response.data.data as InProgressAttemptDto[];
    }

    /**
     * Lấy kết quả bài thi đã nộp
     */
    async getExamResult(attemptId: string) {
        const response = await api.get(`/api/exam-attempts/${attemptId}/result`);
        return response.data.data as ExamResultDto;
    }
}

export const examAttemptService = new ExamAttemptService();