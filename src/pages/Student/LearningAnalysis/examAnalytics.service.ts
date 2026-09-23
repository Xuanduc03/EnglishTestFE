// services/examAnalytics.service.ts
import { api } from '../../../configs/axios-custom';
import type { ExamAnalyticsDto } from './examAnalytics.types';


export const examAnalyticsService = {
    /**
     * Lấy dữ liệu phân tích năng lực của User
     * @param userId - ID của người dùng
     * @param lastN - Phân tích N lần thi gần nhất (mặc định 5)
     */
    getAnalytics: async (userId: string, lastN: number = 5): Promise<ExamAnalyticsDto> => {
        try {
            const response = await api.get(`/api/exam-attempts/analytics`, {
                params: {
                    userId: userId,
                    lastN: lastN
                }
            });

            // Tùy theo base wrapper backend của bác, thường là response.data hoặc response.data.data
            return response.data.data || response.data;
        } catch (error) {
            console.error("Lỗi khi fetch Analytics:", error);
            throw error;
        }
    }
};