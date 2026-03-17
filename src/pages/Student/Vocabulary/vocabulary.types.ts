// vocabulary.types.ts

// ── Flashcard (mặt trước + mặt sau) ─────────────────────────
export interface FlashcardDto {
  wordId: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  audioUrl?: string;
  imageUrl?: string;

  // Mặt sau
  meaning: string;
  example?: string;
  exampleMeaning?: string;

  // Progress
  timesReviewed: number;
  repetitionCount: number;
  status: VocabStatus;
}

// ── Today's session ──────────────────────────────────────────
export interface VocabTodayResultDto {
  isEmpty: boolean;
  message: string;
  totalDue: number;
  cards: FlashcardDto[];
}

// ── Review result ────────────────────────────────────────────
export interface VocabReviewResultDto {
  wordId: string;
  word: string;
  remembered: boolean;
  nextReviewAt: string;
  newInterval: number;
  newStatus: VocabStatus;
}

// ── Session summary ──────────────────────────────────────────
export interface VocabSessionSummaryDto {
  totalReviewed: number;
  totalRemembered: number;
  totalForgotten: number;
  accuracyPercent: number;
  newWords: number;
  masteredWords: number;
  items: VocabSummaryItemDto[];
}

export interface VocabSummaryItemDto {
  word: string;
  meaning: string;
  remembered: boolean;
  nextIntervalDays: number;
}

// ── Word list ────────────────────────────────────────────────
export interface VocabWordDto {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
  level?: string;
  status?: VocabStatus;
  timesReviewed?: number;
  nextReviewAt?: string;
}

export interface PaginatedVocabResult {
  items: VocabWordDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

// ── Request payloads ─────────────────────────────────────────
export interface ReviewRequest {
  wordId: string;
  remembered: boolean;
}

export interface GetVocabWordsParams {
  keyword?: string;
  status?: VocabStatus | 'all';
  pageIndex?: number;
  pageSize?: number;
}

// ── Enums / Constants ────────────────────────────────────────
export type VocabStatus = 'new' | 'learning' | 'known' | 'mastered';

export const VOCAB_STATUS_CONFIG: Record<VocabStatus, { label: string; color: string }> = {
  new:      { label: 'Chưa học',   color: 'default'    },
  learning: { label: 'Đang học',   color: 'processing' },
  known:    { label: 'Đã biết',    color: 'warning'    },
  mastered: { label: 'Thành thạo', color: 'success'    },
};