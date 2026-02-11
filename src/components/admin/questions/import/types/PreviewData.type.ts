
/**
 * Type cho câu trả lời
 */
export interface PreviewAnswer {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

/**
 * Type cho lỗi validation
 */
export interface PreviewError {
  code: string;
  message: string;
  row: number | null;
  column: string | null;
  severity: 'error' | 'warning';
}

/**
 * Type cho câu hỏi đơn (Part 1, 2, 5)
 */
export interface PreviewSingleQuestion {
  rowNumber: number;
  categoryId: string;
  content: string | null;
  difficultyId: string | null;
  difficultyName: string | null;
  audioFileName: string | null;
  imageFileName: string | null;
  answers: PreviewAnswer[];
  explanation: string | null;
  tags: string[];
  hasError: boolean;
  errors: PreviewError[];
}

/**
 * Question trong câu hỏi nhóm
 */
export interface PreviewGroupQuestionItem {
  questionNumber: number;
  content: string;
  difficultyId: string | null;
  difficultyName: string | null;
  answers: PreviewAnswer[];
  explanation: string | null;
  hasError: boolean;
  errors: PreviewError[];
}

/**
 * Type cho nhóm câu hỏi (Part 3, 4, 6, 7)
 */
export interface PreviewGroupQuestion {
  startRow: number;
  endRow: number;
  categoryId: string;
  groupTitle: string;
  groupContent: string;
  audioFileName: string | null;
  imageFileName: string | null;
  questions: PreviewGroupQuestionItem[];
  hasError: boolean;
  errors: PreviewError[];
}

/**
 * Union type cho item - có thể là câu hỏi đơn hoặc nhóm câu hỏi
 */
export type PreviewItem = PreviewSingleQuestion | PreviewGroupQuestion;

/**
 * Type cho mỗi Part (mỗi Part là 1 sheet trong Excel)
 */
export interface PreviewPart {
  sheetName: string;
  categoryId: string;
  categoryName: string;
  totalQuestionsOrGroups: number;
  error: string | null;
  items: PreviewItem[];
}

/**
 * Type tổng cho API response
 */
export interface PreviewZipResponse {
  message: string;
  totalProcessed: number;
  data: PreviewPart[];
  missingMediaFiles: string[];
}

// ============================================================================
// TYPE GUARDS - Để phân biệt Single Question vs Group Question
// ============================================================================

/**
 * Type guard để check xem item có phải là PreviewSingleQuestion không
 */
export function isSingleQuestion(item: PreviewItem): item is PreviewSingleQuestion {
  return 'rowNumber' in item;
}

/**
 * Type guard để check xem item có phải là PreviewGroupQuestion không
 */
export function isGroupQuestion(item: PreviewItem): item is PreviewGroupQuestion {
  return 'groupTitle' in item && 'questions' in item;
}

// ============================================================================
// FLATTENED UI DATA STRUCTURE - Để hiển thị dễ dàng hơn
// ============================================================================

/**
 * Flattened question cho UI - dùng cho cả single và group questions
 */
export interface FlattenedQuestion {
  id: string;
  index: number;
  content: string;
  answers: PreviewAnswer[];
  explanation?: string;
  audioFileName?: string;
  imageFileName?: string;
  tags?: string[];
  difficultyName?: string;
  
  // Group info (nếu là câu hỏi nhóm)
  isGroupQuestion: boolean;
  groupTitle?: string;
  groupContent?: string;
  groupStartRow?: number;
  groupEndRow?: number;
  questionNumber?: number; // Số thứ tự trong group (1, 2, 3...)
  
  hasError: boolean;
  errors: string[]; // Simplified error messages
}

/**
 * Part data cho UI
 */
export interface PartData {
  part: number;
  sheetError?: string;
  questions: FlattenedQuestion[];
}