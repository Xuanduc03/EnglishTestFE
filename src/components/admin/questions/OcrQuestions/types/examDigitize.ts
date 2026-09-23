// ── QType — SYNC 100% với C# QuestionTypeEnum backend ────────
// SingleChoice=1, MultipleChoice=2, FillBlank=3
// Matching=4, MatchingHeading=5, MatchingInformation=6, MatchingSentenceEnds=7
// TrueFalseNotGiven=8, YesNoNotGiven=9
// ShortAnswer=10, NoteCompletion=11, FormCompletion=12
// TableCompletion=13, SummaryCompletion=14, SentenceCompletion=15, MapLabeling=16

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
  explanation?: string;
  answers: ExtractedAnswer[];
  audioUrl?: string | null;
  imageUrl?: string | null;
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

export interface SaveDigitizedExamCommand {
  categoryId: string;
  difficultyId?: string;
  audioFile?: File | null;
  imageFile?: File | null;
  audioUrl?: string;
  imageUrl?: string;
  extractedData: ExtractedExamDto;
  tags: string[];
}

export interface SaveDigitizedExamResponse {
  success: boolean;
  data: { groupId: string };
}

export interface ExamTypeOption {
  value: string;
  label: string;
  icon: string;
}

export const EXAM_TYPE_OPTIONS: ExamTypeOption[] = [
  { value: 'IELTS_READING', label: 'IELTS Reading', icon: '📖' },
  { value: 'IELTS_LISTENING', label: 'IELTS Listening', icon: '🎧' },
  { value: 'TOEIC_READING', label: 'TOEIC Reading', icon: '📄' },
  { value: 'TOEIC_LISTENING', label: 'TOEIC Listening', icon: '🔊' },
  { value: 'KET_READING_WRITING', label: 'KET Reading & Writing', icon: '✏️' },
  { value: 'KET_LISTENING', label: 'KET Listening', icon: '👂' },
];

// ── QType — khớp 100% C# QuestionTypeEnum ────────────────────
export const QType = {
  // TOEIC
  SingleChoice: 1,
  MultipleChoice: 2,
  FillBlank: 3,

  // IELTS Matching
  Matching: 4,
  MatchingHeading: 5,
  MatchingInformation: 6,
  MatchingSentenceEnds: 7,

  // IELTS True/False
  TrueFalseNotGiven: 8,
  YesNoNotGiven: 9,

  // Completion
  ShortAnswer: 10,
  NoteCompletion: 11,
  FormCompletion: 12,
  TableCompletion: 13,
  SummaryCompletion: 14,
  SentenceCompletion: 15,
  MapLabeling: 16,
} as const;

export const QUESTION_TYPE_LABEL: Record<number, string> = {
  [QType.SingleChoice]: 'Single Choice',
  [QType.MultipleChoice]: 'Multiple Choice',
  [QType.FillBlank]: 'Fill in the Blank',
  [QType.Matching]: 'Matching',
  [QType.MatchingHeading]: 'Matching Headings',
  [QType.MatchingInformation]: 'Matching Information',
  [QType.MatchingSentenceEnds]: 'Matching Sentence Ends',
  [QType.TrueFalseNotGiven]: 'True / False / Not Given',
  [QType.YesNoNotGiven]: 'Yes / No / Not Given',
  [QType.ShortAnswer]: 'Short Answer',
  [QType.NoteCompletion]: 'Note Completion',
  [QType.FormCompletion]: 'Form Completion',
  [QType.TableCompletion]: 'Table Completion',
  [QType.SummaryCompletion]: 'Summary Completion',
  [QType.SentenceCompletion]: 'Sentence Completion',
  [QType.MapLabeling]: 'Map / Diagram Labeling',
};

export const FILL_IN_TYPES = new Set<number>([
  QType.ShortAnswer, QType.NoteCompletion, QType.FormCompletion,
  QType.TableCompletion, QType.SummaryCompletion, QType.SentenceCompletion,
  QType.MapLabeling, QType.FillBlank,
]);

export const MCQ_TYPES = new Set<number>([
  QType.SingleChoice, QType.MultipleChoice,
]);

export const TFNG_TYPES = new Set<number>([
  QType.TrueFalseNotGiven, QType.YesNoNotGiven,
]);

export const MATCHING_TYPES = new Set<number>([
  QType.Matching, QType.MatchingHeading,
  QType.MatchingInformation, QType.MatchingSentenceEnds,
]);

export const isFillInType = (t: number): boolean => FILL_IN_TYPES.has(t);
export const isTfngType = (t: number): boolean => TFNG_TYPES.has(t);
export const isMcqType = (t: number): boolean => MCQ_TYPES.has(t);
export const isMatchingType = (t: number): boolean => MATCHING_TYPES.has(t);

// normalizeQuestionType — chỉ fallback khi type không hợp lệ
export const normalizeQuestionType = (
  q: ExtractedQuestion,
  examType: string,
): number => {
  const t = q.questionType;
  const isValid = FILL_IN_TYPES.has(t) || MCQ_TYPES.has(t)
    || TFNG_TYPES.has(t) || MATCHING_TYPES.has(t);

  if (examType === 'IELTS_LISTENING' && !isValid)
    return QType.NoteCompletion; // 11
  if (examType === 'KET_READING_WRITING' && !isValid)
    return QType.SingleChoice;          // 1 — Part 1/3/4/5 đều MCQ

  if (examType === 'KET_LISTENING' && !isValid)
    return QType.FormCompletion;
  return t;
};