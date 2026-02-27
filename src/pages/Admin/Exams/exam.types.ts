// Các trường cơ bản của Exam
export interface ExamBaseDto {
  code: string; // ETS-2024-01
  title: string;
  description?: string;
  duration: number; // Phút
  price?: number;
}

// DTO nhẹ: Dùng cho màn hình "Danh sách đề thi" (Table)
export interface ExamSummaryDto extends ExamBaseDto {
  id: string;
  totalScore: number;
  status: string;      // "Draft", "Published"
  questionCount: number;  // Tổng số câu hỏi
  version: number;
  createdAt: Date | string;
}

// DTO cho từng Câu hỏi trong đề (Mapping)
export interface ExamQuestionDto {
  id: string;           // ID của ExamQuestion (Bảng trung gian)
  questionId: string;   // ID câu hỏi gốc trong kho
  contentPreview: string;
  questionType: string;
  difficultyName: string;
  point: number;      // Điểm số của câu này trong đề
  orderIndex: number;    // Thứ tự câu (1, 2, 3...)
}

// DTO cho từng Phần thi (Section)
export interface ExamSectionDto {
  id: string;
  categoryId: string; 
  name?: string;
  instructions?: string;
  orderIndex: number;
  questions: ExamQuestionDto[];
}

// DTO nặng: Dùng cho màn hình "Cấu trúc đề thi" (Chi tiết)
// Chứa cả Sections và Questions bên trong
export interface ExamDetailDto extends ExamSummaryDto {
  sections: ExamSectionDto[];
}

// [UC-22] Payload tạo đề thi THỦ CÔNG (Đơn giản nhất)
// Chỉ tạo vỏ đề, chưa thêm câu hỏi vội
export interface CreateExamDto extends ExamBaseDto {
  type?: number;           // ExamType
  category?: number;       // ExamCategory
  scope?: number;          // ExamScope
  level?: number;          // ExamLevel
  status?: number;         // ExamStatus (mặc định Draft = 0)
}

// Payload cập nhật thông tin chung (Rename, đổi giờ...)
export interface UpdateExamDto extends Partial<CreateExamDto> {
  status: number;
}

// [UC-21] Payload tạo đề TỰ ĐỘNG (Sinh từ ma trận)
export interface GenerateExamDto extends ExamBaseDto {
  matrixId: string; // ID ma trận cấu hình
  randomSeed?: number; // Tùy chọn để test
}

// Thêm câu hỏi vào đề (Add Question to Exam)
export interface AddQuestionToExamDto {
  examId: string;
  sectionId: string;
  categoryId: string;
  questionIds: string[];
  defaultPoint?: number;
}

// Cập nhật vị trí/điểm số của câu hỏi trong đề
export interface UpdateExamQuestionOrderDto {
  examQuestionId: string; // ID bảng trung gian
  newOrderIndex: number;
  newPoint?: number;
}

// Tạo Section mới cho đề (Ví dụ: Thêm phần "Speaking")
export interface CreateExamSectionDto {
  examId: string;
  name: string;
  instructions?: string;
  orderIndex: number;
}

// ── Enums (khớp với BE) ──────────────────────────────────────
export const ExamStatus = {
  Draft: 0,
  PendingReview: 1,
  Published: 2,
  Suspended: 3,
  Archived: 99,
} as const;

export const ExamType = {
  TOEIC : 1, IELTS : 2, TOEFL : 3, SAT : 4, Other : 99,
} as const

export const ExamCategory = {
  FullTest       : 1,
  SkillTest      : 2,
  PartTest       : 3,
  MiniTest       : 4,
  DiagnosticTest : 5,
  AssignmentTest : 6,
}  as const;

export const ExamScope = {
  Full           : 1,
  ListeningOnly  : 10, ReadingOnly  : 11,
  WritingOnly    : 12, SpeakingOnly : 13,
  Part1Only : 20, Part2Only : 21, Part3Only : 22,
  Part4Only : 23, Part5Only : 24, Part6Only : 25, Part7Only : 26,
  Part5And6 : 30, Part3And4 : 31, Part1And2 : 32,
  IELTSListeningOnly : 40, IELTSReadingOnly : 41,
  IELTSWritingTask1  : 42, IELTSWritingTask2 : 43,
  Custom : 99,
} as const;

export const ExamLevel = {
  Practice  : 1, MockTest   : 2, Assignment : 3,
  MidTerm   : 4, FinalExam  : 5, Placement  : 6, RealExam : 7,
} as const

// 1. Tạo một Type trích xuất các value từ ExamStatus (0 | 1 | 2 | 3 | 99)
export type ExamStatusValue = typeof ExamStatus[keyof typeof ExamStatus];

// 2. Sửa lại helper type, dùng Type vừa tạo thay vì dùng Object
export type ExamCreatePayload = Omit<CreateExamDto, 'status'> & {
  status?: ExamStatusValue; 
};

// Helper type cho việc cập nhật exam (có thể chỉ cập nhật một số trường)
export type ExamUpdatePayload = Partial<UpdateExamDto>;