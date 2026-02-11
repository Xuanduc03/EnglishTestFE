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
  name: string; // "Part 1", "Listening Section"
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
  status: string; // Mặc định tạo là Draft
}

// Payload cập nhật thông tin chung (Rename, đổi giờ...)
export interface UpdateExamDto extends ExamBaseDto {
  status: string;
}

// [UC-21] Payload tạo đề TỰ ĐỘNG (Sinh từ ma trận)
export interface GenerateExamDto extends ExamBaseDto {
  matrixId: string; // ID ma trận cấu hình
  randomSeed?: number; // Tùy chọn để test
}

// Thêm câu hỏi vào đề (Add Question to Exam)
export interface AddQuestionToExamDto {
  examId: string;
  sectionId?: string; // Nếu đề chia section thì bắt buộc
  questionIds: string[]; // Chọn 1 lúc nhiều câu
  defaultPoint?: number; // Điểm mặc định, mặc định là 5.0
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

// Type cho trạng thái đề thi (nếu muốn type chặt chẽ hơn)
export type ExamStatus = 'Draft' | 'Published' | 'Archived' | 'Deleted';

// Có thể cập nhật lại interface ExamSummaryDto và các DTO khác để sử dụng type trên
// export interface ExamSummaryDto extends ExamBaseDto {
//   id: string;
//   totalScore: number;
//   status: ExamStatus;      // Sử dụng type union
//   questionCount: number;
//   version: number;
//   createdAt: Date | string;
// }

// Helper type cho việc tạo mới exam (có thể bỏ qua status)
export type ExamCreatePayload = Omit<CreateExamDto, 'status'> & {
  status?: ExamStatus;
};

// Helper type cho việc cập nhật exam (có thể chỉ cập nhật một số trường)
export type ExamUpdatePayload = Partial<UpdateExamDto>;