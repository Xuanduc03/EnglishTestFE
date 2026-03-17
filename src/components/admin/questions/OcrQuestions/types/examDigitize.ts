// ── Extract (Gemini response) ─────────────────────────────
export interface ExtractedAnswer {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface ExtractedQuestion {
  orderIndex: number;
  questionText: string;
  questionType: number;
  isAiGraded: boolean;
  sampleAnswer: string | null;
  maxWords: number | null;
  answers: ExtractedAnswer[];
}

export interface ExtractedExamDto {
  examType: string;
  passageTitle?: string | null;
  passageContent?: string | null;
  sectionTitle?: string | null;
  instructions?: string | null;
  partNumber?: number | null;
  questions: ExtractedQuestion[];
}

export interface ExtractResponse {
  success: boolean;
  data: ExtractedExamDto;
}

// ── Save (confirm → DB) ───────────────────────────────────
export interface SaveDigitizedExamCommand {
  categoryId: string;
  difficultyId?: string;
  audioUrl?: string;
  extractedData: ExtractedExamDto;
  tags: string[];
}

export interface SaveDigitizedExamResponse {
  success: boolean;
  data: { groupId: string };
}

// ── Exam type options ─────────────────────────────────────
export interface ExamTypeOption {
  value: string;
  label: string;
  icon: string;
}

export const EXAM_TYPE_OPTIONS: ExamTypeOption[] = [
  { value: "IELTS_READING",   label: "IELTS Reading",   icon: "📖" },
  { value: "IELTS_LISTENING", label: "IELTS Listening", icon: "🎧" },
  { value: "TOEIC_READING",   label: "TOEIC Reading",   icon: "📄" },
  { value: "TOEIC_LISTENING", label: "TOEIC Listening", icon: "🔊" },
];

// Question type labels
export const QUESTION_TYPE_LABEL: Record<number, string> = {
  1:  "Multiple Choice",
  3:  "Fill in Blank",
  4:  "Matching",
  5:  "Matching Heading",
  6:  "Matching Information",
  7:  "Short Answer",
  8:  "Note Completion",
  9:  "Form Completion",
  10: "Map Labeling",
  11: "Sentence Completion",
  12: "True/False/Not Given",
  13: "Yes/No/Not Given",
};