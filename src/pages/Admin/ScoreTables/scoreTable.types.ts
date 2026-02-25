// types/scoreTable.ts

// ==========================================
// 1. Shared Types (Dùng chung)
// ==========================================

// Một dòng quy tắc đổi điểm (Map 1-1 với C# ConversionRuleDto)
export interface ConversionRule {
  correctAnswers: number; // Số câu đúng
  score: number;          // Điểm tương ứng
}

// ==========================================
// 2. Response DTOs (Dữ liệu từ API trả về)
// ==========================================

// Chi tiết bảng điểm (Dùng cho trang Edit hoặc View Detail)
// Map với C# ScoreTableDto
export interface ScoreTableDetail {
  id: string;
  examId: string;
  examTitle?: string;         // Tên đề thi (để hiển thị readonly)
  
  categoryId: string;         // ID của kỹ năng (thay cho SkillType)
  categoryName?: string;      // Tên kỹ năng: "Listening", "Reading" (để hiển thị)

  // QUAN TRỌNG: Backend trả về List, FE dùng Array để dễ .map() render bảng
  conversionRules: ConversionRule[]; 

  createdAt: string;          // ISO Date
  updatedAt: string;          // ISO Date
}

// DTO rút gọn cho danh sách (Dùng cho trang Table quản lý)
// Map với C# ScoreTableListDto
export interface ScoreTableListItem {
  id: string;
  examId: string;
  examTitle?: string;
  
  categoryName?: string;      // Hiển thị "Listening"
  
  totalRules: number;         // Số lượng dòng quy đổi (VD: 50 dòng)
  createdAt: string;
}

// Wrapper cho phân trang (nếu dùng chung BaseResponse)
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// 3. Request DTOs (Dữ liệu gửi lên API)
// ==========================================

// Dùng chung cho cả Create (POST) và Update (PUT)
// Map với C# UpdateScoreTableCommand / CreateScoreTableCommand
export interface UpsertScoreTableRequest {
  id?: string;                // Có nếu là Update
  examId: string;             // Bắt buộc chọn đề thi
  categoryId: string;         // Bắt buộc chọn kỹ năng (Reading/Listening)
  
  // Gửi mảng object lên, Backend sẽ tự lo việc convert sang JSON
  conversionRules: ConversionRule[]; 
}

// ==========================================
// 4. Query Params (Filter trên URL)
// ==========================================

// Map với C# GetScoreTablesQuery
export interface ScoreTableQueryParams {
  examId?: string;
  categoryId?: string;        // Filter theo kỹ năng
  keyword?: string;           // Tìm theo tên đề hoặc tên kỹ năng
  page?: number;
  pageSize?: number;
}