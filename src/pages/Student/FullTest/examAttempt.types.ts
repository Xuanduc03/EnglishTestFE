// types/examAttempt.ts

// ============================================
// SHARED
// ============================================
export interface AnswerOption {
  id: string;
  content: string;
  orderIndex: number;
}

export interface PartSummary {
  partName: string;
  total: number;
  correct: number;
  score: number;
}

// ============================================
// START EXAM
// POST /api/exam-attempts/start
// ============================================
export interface StartExamCommand {
  examId: string;
}

export interface ExamAttemptDto {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  totalQuestions: number;
  sections: ExamSectionPreview[];
  questions: ExamQuestionPreview[]; // computed flat list
}

export interface ExamSectionPreview {
  sectionId: string;
  sectionName: string;
  skillType: string;
  orderIndex: number;
  instructions?: string;
  questions: ExamQuestionPreview[];
}

export interface ExamQuestionPreview {
  examQuestionId: string;
  questionId: string;
  orderIndex: number;
  point: number;
  content?: string;
  questionType: number;
  hasAudio: boolean;
  hasImage: boolean;
  audioUrl?: string;
  imageUrl?: string;
  groupId?: string;
  groupContent?: string;
  groupAudioUrl?: string;
  groupImageUrl?: string;
  answers: AnswerOption[];
}

export interface StartExamResponse {
  success: boolean;
  data: ExamAttemptDto;
}

// ============================================
// SAVE ANSWER
// POST /api/exam-attempts/auto-save
// ============================================
export interface SaveAnswerCommand {
  attemptId: string;
  examQuestionId: string;
  selectedAnswerId: string;
  timeSpentSeconds?: number;
}

// ============================================
// SUBMIT EXAM
// POST /api/exam-attempts/{attemptId}/submit
// ============================================
export interface SubmitExamResult {
  attemptId: string;
  submittedAt: string;

  // Điểm TOEIC chuẩn ETS
  listeningCorrect: number;
  listeningScore: number;    // 5 - 495
  readingCorrect: number;
  readingScore: number;      // 5 - 495
  totalScore: number;        // 10 - 990

  // Thống kê chung
  maxScore: number;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  durationSeconds: number;

  partSummaries: PartSummary[];
}

export interface SubmitExamResponse {
  success: boolean;
  data: SubmitExamResult;
}

// ============================================
// GET RESULT
// GET /api/exam-attempts/{attemptId}/result
// ============================================
export interface SectionResultDto {
  sectionId: string;
  sectionName: string;           // "Part 1" → "Part 7"
  skillCode: string;             // "LISTENING" | "READING"
  skillName: string;             // "Phần Nghe" | "Phần đọc hiểu"
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;                 // % đúng của Part
  toeicConvertedScore: number | null;
}

export interface ExamResultDto {
  attemptId: string;
  examTitle: string;
  examCode: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;

  // Thống kê câu trả lời
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  rawScore: number;
  maxScore: number;
  scorePercent: number;

  // Điểm TOEIC
  isToeic: boolean;
  listeningCorrect: number | null;
  listeningScore: number | null;   // 5 - 495
  readingCorrect: number | null;
  readingScore: number | null;     // 5 - 495
  totalToeicScore: number | null;  // 10 - 990

  sectionResults: SectionResultDto[];
}

export interface ExamResultResponse {
  success: boolean;
  data: ExamResultDto;
}

// ============================================
// RESUME
// GET /api/exam-attempts/{attemptId}/resume
// ============================================
export interface ResumeExamDto {
  attemptId: string;
  examId: string;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  sections: ExamSectionPreview[];
  questions: ExamQuestionPreview[];
}

export interface ResumeExamResponse {
  success: boolean;
  data: ResumeExamDto;
}

// ============================================
// IN PROGRESS
// GET /api/exam-attempts/in-progress
// ============================================
export interface InProgressAttemptDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  startedAt: string;
  expiresAt?: string;
  timeLimitSeconds: number;
  totalQuestions: number;
  answeredCount: number;
}

export interface InProgressResponse {
  success: boolean;
  data: InProgressAttemptDto[];
}

// ============================================
// HISTORY
// GET /api/exam-attempts/history
// ============================================
export type AttemptStatus = 'InProgress' | 'Submitted' | 'TimedOut' | 'Abandoned';

export interface ExamHistoryItem {
  attemptId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  listeningScore: number | null;
  readingScore: number | null;
  totalScore: number | null;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number | null;
}

export interface ExamHistoryResponse {
  success: boolean;
  data: {
    items: ExamHistoryItem[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

// ============================================
// REVIEW
// GET /api/exam-attempts/{attemptId}/review
// ============================================
export interface ReviewAnswerDto {
  examQuestionId: string;
  questionId: string;
  orderIndex: number;
  content?: string;
  selectedAnswerId: string | null;
  correctAnswerId: string | null;
  isCorrect: boolean;
  isAnswered: boolean;
  point: number;
  answers: AnswerOption[];
  groupContent?: string;
  groupAudioUrl?: string;
  explanation?: string;
}

export interface ReviewSectionDto {
  sectionId: string;
  sectionName: string;
  skillCode: string;
  skillName: string;
  totalQuestions: number;
  correctAnswers: number;
  questions: ReviewAnswerDto[];
}

export interface ExamReviewDto {
  attemptId: string;
  examTitle: string;
  examCode: string;
  submittedAt: string;
  totalScore: number | null;
  listeningScore: number | null;
  readingScore: number | null;
  sections: ReviewSectionDto[];
}

export interface ExamReviewResponse {
  success: boolean;
  data: ExamReviewDto;
}

// ============================================
// COMPLETED ATTEMPTS (Tab Lịch Sử)
// GET /api/exam-attempts/completed
// ============================================
export interface CompletedAttemptDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: string;       // ISO 8601
  totalScore: number;        // điểm đạt được
  maxScore: number;          // điểm tối đa
  scorePercent: number;      // % điểm
  correctAnswers: number;
  totalQuestions: number;
}

// ── Analytics ─────────────────────────────────────────────────
export interface ExamAnalyticsDto {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  scoreTrend: number;          // + tăng / - giảm so với lần trước
  partAnalytics: PartAnalyticsDto[];
  strengths: string[];         // Part làm tốt ≥ 70%
  weaknesses: string[];        // Part làm kém < 50%
  suggestions: ImprovementSuggestionDto[];
  scoreHistory: ScoreHistoryDto[];
}
 
export interface PartAnalyticsDto {
  partName: string;            // "Part 1", "Part 2"...
  skill: string;               // "Listening" / "Reading"
  accuracyPercent: number;     // % đúng trung bình
  totalAttempted: number;
  totalCorrect: number;
  trendPercent: number;        // So với lần trước
  level: 'Strong' | 'Average' | 'Weak';
}
 
export interface ImprovementSuggestionDto {
  partName: string;
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  actionUrl: string;
}
 
export interface ScoreHistoryDto {
  attemptDate: string;
  score: number;
  maxScore: number;
  percent: number;
  examTitle: string;
}