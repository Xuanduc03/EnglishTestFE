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
  // Group info (Part 3,4,6,7)
  groupId?: string;
  groupContent?: string;
  groupMedia?: PracticeMediaDto[];
  totalQuestionsInGroup?: number;
  questionIndexInGroup?: number;
  passages?: GroupPassageDto[];

  explanation?: string;
  // Question content
  content: string;
  media: PracticeMediaDto[];

  // Answers
  answers: PracticeAnswerDto[];

  // User state
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

export interface PracticeHistoryDto {
  sessionId: string;
  title: string;
  startedAt: string;
  submittedAt?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  score: number;
  status: 'InProgress' | 'Submitted' | 'Abandoned' | 'TimedOut';
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


// ==================== SUBMIT ====================

// Submit toàn bộ 1 lần khi nộp bài
export interface SubmitPracticeRequest {
  sessionId: string;
  answers: {
    questionId: string;
    answerId: string | null;
    isMarkedForReview: boolean;
  }[];
  totalTimeSeconds: number;
}

// ==================== RESULT ====================

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
  totalTime: string;
  partResults: Record<string, PartResultDto>;
}