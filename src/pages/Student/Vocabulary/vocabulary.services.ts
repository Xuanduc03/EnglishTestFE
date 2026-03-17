// vocabulary.service.ts
import { api } from "../../../configs/axios-custom";
import type {
    VocabTodayResultDto,
    VocabReviewResultDto,
    VocabSessionSummaryDto,
    PaginatedVocabResult,
    ReviewRequest,
    GetVocabWordsParams,
} from "./vocabulary.types";

/**
 *  
 */
export const VocabularyService = {
    getToday: async (maxCards = 20): Promise<VocabTodayResultDto> => {
        const res = await api.get("/api/vocabulary/today", { params: { maxCards } });
        return res.data?.data || res.data;
    },

    review: async (data: ReviewRequest): Promise<VocabReviewResultDto> => {
        const res = await api.post("/api/vocabulary/review", data);
        return res.data?.data || res.data;
    },

    remembered: (wordId: string) =>
        VocabularyService.review({ wordId, remembered: true }),

    forgotten: (wordId: string) =>
        VocabularyService.review({ wordId, remembered: false }),

    getSummary: async (date?: string): Promise<VocabSessionSummaryDto> => {
        const res = await api.get("/api/vocabulary/summary", {
            params: date ? { date } : undefined,
        });
        return res.data?.data || res.data;
    },

    getWords: async (params: GetVocabWordsParams = {}): Promise<PaginatedVocabResult> => {
        const res = await api.get("/api/vocabulary/words", {
            params: {
                pageIndex: params.pageIndex ?? 1,
                pageSize: params.pageSize ?? 20,
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.status && params.status !== "all" && { status: params.status }),
            },
        });
        return res.data?.data || res.data;
    },
};