import { api } from '../../../../configs/axios-custom';
import { IeltsQuestionType, type IeltsReviewResult, type IeltsStartExamResult, type IeltsSubmitResult, type SaveFillInAnswerPayload, type SaveMcqAnswerPayload } from '../../types/ieltsExam.types';


// Helper: phân loại fill-in để gọi đúng endpoint
// ❌ Trong IeltsFullTestPage.tsx — thiếu MapLabeling
const isFillIn = (type: IeltsQuestionType) => ([
    IeltsQuestionType.FormCompletion,
    IeltsQuestionType.NoteCompletion,
    IeltsQuestionType.SentenceCompletion,
    IeltsQuestionType.ShortAnswer,
    // MapLabeling bị thiếu!
] as IeltsQuestionType[]).includes(type);
export const ieltsAttemptService = {

    // ── 1. BẮT ĐẦU BÀI THI ──────────────────────────────────
    startExam: async (payload: {
        examId: string;
    }): Promise<IeltsStartExamResult> => {
        const res = await api.post('/api/ielts/attempts/start', payload);
        return res.data?.data ?? res.data;
    },

    // ── 2. RESUME (F5 / mở lại tab) ─────────────────────────
    // Gọi lại start với cùng examId — backend check active attempt
    // và trả về lại data nếu còn InProgress
    resumeExam: async (attemptId: string): Promise<IeltsStartExamResult> => {
        const res = await api.get(`/api/ielts/attempts/${attemptId}/resume`);
        return res.data?.data ?? res.data;
    },

    // ── 3. LƯU ĐÁP ÁN MCQ
    saveMcqAnswer: async (payload: SaveMcqAnswerPayload): Promise<void> => {
        await api.post(
            `/api/ielts/attempts/${payload.attemptId}/answers/mcq`,  // ← sửa
            {
                examQuestionId: payload.examQuestionId,
                selectedAnswerId: payload.selectedAnswerId,
                timeSpentSeconds: payload.timeSpentSeconds ?? 0,
            }
        );
    },

    // ── 4. LƯU ĐÁP ÁN FILL-IN
    saveFillInAnswer: async (payload: SaveFillInAnswerPayload): Promise<void> => {
        await api.post(
            `/api/ielts/attempts/${payload.attemptId}/answers/fill-in`,  // ← sửa
            {
                examQuestionId: payload.examQuestionId,
                textAnswer: payload.textAnswer.trim(),
                timeSpentSeconds: payload.timeSpentSeconds ?? 0,
            }
        );
    },

    // ── 5. SMART SAVE — tự chọn đúng endpoint theo questionType ──
    saveAnswer: async (
        questionType: IeltsQuestionType,
        payload: SaveMcqAnswerPayload | SaveFillInAnswerPayload
    ): Promise<void> => {
        if (isFillIn(questionType)) {
            await ieltsAttemptService.saveFillInAnswer(payload as SaveFillInAnswerPayload);
        } else {
            await ieltsAttemptService.saveMcqAnswer(payload as SaveMcqAnswerPayload);
        }
    },

    // ── 6. NỘP BÀI ──────────────────────────────────────────
    submitExam: async (payload: {
        attemptId: string;
        isAutoSubmit?: boolean;
    }): Promise<IeltsSubmitResult> => {
        const res = await api.post(
            `/api/ielts/attempts/${payload.attemptId}/submit`,
            {
                attemptId: payload.attemptId,
                isAutoSubmit: payload.isAutoSubmit ?? false,
            }
        );
        return res.data?.data ?? res.data;
    },

    // ── 7. AUTO SUBMIT (hết giờ) ─────────────────────────────
    autoSubmit: async (attemptId: string, userId: string): Promise<IeltsSubmitResult> => {
        return ieltsAttemptService.submitExam({
            attemptId,
            isAutoSubmit: true,
        });
    },

    // ── 9. REVIEW BÀI LÀM ─────────────────────────────────────
    //
    // Chỉ gọi được sau khi bài đã Submitted.
    // Trả về toàn bộ chi tiết: đáp án đúng, bài làm user,
    // isCorrect từng câu, transcript Listening, band scores.
    //
    reviewExam: async (attemptId: string): Promise<IeltsReviewResult> => {
        const res = await api.get(`/api/ielts/attempts/${attemptId}/review`);
        return res.data?.data ?? res.data;
    },
};