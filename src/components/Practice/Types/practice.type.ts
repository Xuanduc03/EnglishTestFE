// ============================================
// PRACTICE TYPES - Match Backend DTOs
// ============================================

// Media (Image/Audio)
export interface PracticeMediaDto {
  id: string;
  url: string;
  type: 'image' | 'audio';
  orderIndex: number;
  description?: string;
}

// Answer option
export interface PracticeAnswerDto {
  id: string;
  content: string;
  orderIndex: number;
  answerLabel: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  media: PracticeMediaDto[];
}

// Multiple passages (Part 7 Double/Triple)
export interface GroupPassageDto {
  id: string;
  content: string;
  orderIndex: number;
  title?: string;
  passageType?: string;
}

// Question
export interface PracticeQuestionDto {
  audioUrl: any;
  imageUrl: any;
  hasAudio: any;
  hasImage: any;
  questionId: string;
  orderIndex: number;
  questionNumber: number;
  partNumber: number;
  groupId?: string;
  groupContent?: string;
  groupMedia?: PracticeMediaDto[];
  totalQuestionsInGroup?: number;
  questionIndexInGroup?: number;
  passages?: GroupPassageDto[];
  explanation?: string;
  content: string;
  media: PracticeMediaDto[];
  answers: PracticeAnswerDto[];
  selectedAnswerId?: string;
  isCorrect?: boolean;
  isMarkedForReview: boolean;
}

// Part info
export interface PracticePartDto {
  partId: string;
  partName: string;
  partNumber: number;
  partDescription?: string;
  questions: PracticeQuestionDto[];
}

// Practice session
export interface PracticeSessionDto {
  sessionId: string;
  title: string;
  totalQuestions: number;
  duration: number;
  parts: PracticePartDto[];
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreatePracticeRequest {
  partIds: string[];
  questionsPerPart: number;
  isTimed: boolean;
  timeLimitMinutes?: number;
}

export interface SubmitPracticeAnswerRequest {
  sessionId: string;
  questionId: string;
  answerId?: string;
  isMarkedForReview?: boolean;
}

export interface AnswerSubmitItem {
  questionId: string;
  answerId: string | null;
  isMarkedForReview: boolean;
}

export interface SubmitPracticeRequest {
  sessionId: string;
  answers: AnswerSubmitItem[];
  totalTimeSeconds: number;
}

export interface AbandonPracticeRequest {
  sessionId: string;
  answers: AnswerSubmitItem[];
  totalTimeSeconds: number;
}

// ============================================
// RESULT TYPES
// ============================================

export interface PartResultDto {
  partName: string;
  partNumber: number;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  averageTimePerQuestion: number;
}

export interface PracticeResultDto {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  accuracyPercentage: number;
  totalTime: string; // TimeSpan từ C# → string "00:18:30"
  partResults: Record<string, PartResultDto>;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctAnswerId?: string;
  explanation?: string;
}

// ============================================
// PRACTICE HISTORY
// ============================================

// FIX: dùng const object thay enum — tránh lỗi erasableSyntaxOnly
export const PracticeStatus = {
  InProgress: 0,
  Submitted:  1,
  Abandoned:  2,
  TimedOut:   3,
} as const;

export type PracticeStatus = typeof PracticeStatus[keyof typeof PracticeStatus];

export interface PracticeHistoryDto {
  sessionId: string;
  title: string;
  startedAt: string;
  submittedAt?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  score: number;
  status: PracticeStatus; // 0 | 1 | 2 | 3
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ============================================
// IN-PROGRESS
// ============================================

export interface InProgressPracticeDto {
  // Backend trả AttemptId, không phải sessionId
  attemptId: string;
  title: string;
  categoryName: string;
  progress: number;        // 0-100, đã tính sẵn
  startedAt: string;
  lastUpdated: string;     // UpdatedAt từ backend
  timeLimitSeconds: number;
  actualTimeSeconds: number;
  // Fallback fields (phòng thay đổi backend)
  sessionId?: string;
  categoryId?: string;
  totalQuestions?: number;
  answeredCount?: number;
}

// ============================================
// REVIEW
// ============================================

export interface ReviewAnswerDto {
  answerId: string;
  content: string;
  isCorrect: boolean;
  isSelected: boolean;
  orderIndex: number;
}

export interface ReviewQuestionDto {
  questionId: string;
  questionNumber: number;
  partNumber: number;
  partName: string;
  content: string;
  explanation?: string;
  isCorrect: boolean;
  isAnswered: boolean;
  isMarkedForReview: boolean;
  selectedAnswerId?: string;
  correctAnswerId: string;
  answers: ReviewAnswerDto[];
  imageUrl?: string;
  audioUrl?: string;
}

// ============================================
// STATISTICS
// ============================================

export interface PracticeStatistics {
  totalPractices: number;
  totalQuestions: number;
  overallAccuracy: number;
  averageScore: number;
  totalTimeSpent: string;
  partStatistics: Record<string, {
    accuracy: number;
    totalQuestions: number;
  }>;
  recentProgress: Array<{
    date: string;
    accuracy: number;
  }>;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface PracticeState {
  session: PracticeSessionDto | null;
  currentQuestionIndex: number;
  answers: Map<string, string>;
  markedForReview: Set<string>;
  startTime: Date;
  timeSpent: number;
  isSubmitting: boolean;
}

export interface QuestionTimingInfo {
  questionId: string;
  startTime: Date;
  timeSpent: number;
}