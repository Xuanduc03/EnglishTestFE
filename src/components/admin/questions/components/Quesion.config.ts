// ==================== VIEW (READ) ====================

export interface QuestionListDto {
  id: string;
  categoryId: string;
  categoryName: string; // ✨ THÊM: Để hiển thị trên bảng
  groupId?: string | null;
  content: string;
  difficultyName: string;
  questionType: string;
  createAt: string;
  difficultyLevel: number;
  isActive: boolean;
  isPublic: boolean;

  answerCount: number; // ✨ THÊM: Để hiện badge số lượng
  createdAt: string;
}

export interface MediaDto {
  id: string;
  url: string;
  mediaType: "audio" | "image";
}

export interface AnswerDto {
  id: string;
  content: string;
  isCorrect: boolean;
  feedback?: string;
  orderIndex: number;
}

export interface SingleQuestionDetailDto {
  id: string;
  categoryId: string;

  content: string;
  questionType: string;
  difficultyId: string;
  defaultScore: number;
  shuffleAnswers: boolean;
  explanation?: string;
  isActive: boolean;

  media: MediaDto[];
  answers: AnswerDto[];
}


export interface QuestionGroupDetailDto {
  id: string;
  categoryId: string;
  difficultyId: string;
  content: string;        // passage
  explanation?: string;
  transcript?: string;
  mediaJson?: string;

  isActive: boolean;

  media: MediaDto[];
  questions: GroupQuestionItemDto[];
}

export interface GroupQuestionFormData {
  id?: string;

  content: string;
  questionType: QuestionType;
  difficultyId: string;
  defaultScore: number;
  shuffleAnswers: boolean;

  explanation?: string;

  media: {
    id?: string;
    url?: string;
    type: "audio" | "image";
  }[];

  answers: {
    id?: string;
    content: string;
    isCorrect: boolean;
    feedback?: string;
    orderIndex: number;
  }[];
}


export interface GroupQuestionItemDto {
  id: string;
  content: string;
  questionType: QuestionType;
  difficultyId: string;
  defaultScore: number;
  shuffleAnswers: boolean;
  explanation?: string;
  isActive: boolean;
  media: MediaDto[];
  answers: AnswerDto[];
}


export interface CreateSingleQuestionCommand {
  CategoryId: string; // GUID string
  Content: string;
  QuestionType?: string;
  difficultyId?: string | null;
  DefaultScore?: number;
  ShuffleAnswers?: boolean;
  Explanation?: string | null;
  AudioFile?: File | null;
  AudioUrl?: string | null;
  ImageFile?: File | null;
  ImageUrl?: string | null;
  Answers: CreateAnswerWithFileDto[];
  Tags?: string[];
}
export interface CreateAnswerWithFileDto {
  Content: string;
  IsCorrect: boolean;
  Feedback?: string | null;
  OrderIndex: number;
}

export interface QuestionInGroupDto {
  id: string;
  content: string;
  questionType: string;
  difficultyLevel: number;
  defaultScore: number;
  shuffleAnswers: boolean;
  explanation?: string;

  answers: AnswerDto[];
}

// ==================== CREATE / UPDATE (WRITE) ====================

export interface UpdateAnswerDto {
  id?: string;
  content: string;
  isCorrect: boolean;
  feedback?: string;
  orderIndex: number;
}

export interface SaveSingleQuestionDto {
  id?: string;
  categoryId: string;

  content: string;
  questionType: string;
  difficultyLevel: number;
  defaultScore: number;
  shuffleAnswers: boolean;
  explanation?: string;
  isActive: boolean;
  mediaIds?: string[];

  answers: UpdateAnswerDto[];
}


// ==================== OTHER CONFIGS ====================
export const QuestionType = {
  SingleChoice: "SingleChoice",      // TOEIC Part 1,2,5
  MultipleChoice: "MultipleChoice",  // IELTS MCQ
  ShortAnswer: "ShortAnswer",        // IELTS completion
  Group: "Group",                    // TOEIC Part 3,4,6,7
} as const;

export type QuestionType =
  typeof QuestionType[keyof typeof QuestionType];

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;

  hasQuestionContent: boolean;
  answerMode: "single" | "multiple" | "none";

  minAnswers?: number;
  maxAnswers?: number;

  allowAudio?: boolean;
  allowImage?: boolean;

  allowExplanation?: boolean;
}
