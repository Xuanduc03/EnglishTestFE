export type EditorKey =
  | "TOEIC_PART_1"
  | "TOEIC_PART_2"
  | "TOEIC_PART_3"
  | "TOEIC_PART_4"
  | "TOEIC_PART_5"
  | "TOEIC_PART_6"
  | "TOEIC_PART_7"
  | "TOEIC_WRITING"
  | "TOEIC_SPEAKING"
  | "IELTS_LISTENING"   // Section 1-4 — audio + MCQ/Fill-in
  | "IELTS_READING"; ;


// Cấu hình của từng editor
export interface EditorConfig {
  key: EditorKey;
  label: string;
  icon: string;
  type: "single" | "group"; // Single question hoặc Question Group
  description?: string;
}

// Payload khi submit từ editor
export type EditorSubmitPayload =
  | {
    mode: "single";
    payload: FormData;          // ✅ legacy editor
  }
  | {
    mode: "group";
    payload: FormData;
  }
  | {
    mode: "single";
    payload: EditorFormData;    // ✅ editor mới / edit mode
  }
  | {
    mode: "group";
    payload: EditorFormData;
  };


// Props truyền vào từng editor
export type EditorProps = {
  categories?: Array<{ id: string; name: string }>;
  difficulties?: Array<{ id: string; name: string }>;
  onSave: (data: EditorSubmitPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  initialData?: EditorFormData;
  isEdit?: boolean;
  presetCategoryId?: string;
};

// editor.type.ts
export type SidebarItem = {
  id: string;
  label: string;
  icon?: string;

  // OPTIONAL – chỉ node lá mới dùng
  editorKey?: EditorKey;
  type?: "single" | "group";

  children?: SidebarItem[];
};



// editor.form.type.ts (hoặc editor.type.ts)
export interface EditorFormData {
  mode: string;
  data: {
    id?: string;
    categoryId: string;
    difficultyId: string;
    content: string;
    questionType: string;
    defaultScore: number;
    shuffleAnswers: boolean;
    explanation?: string;
    isActive?: boolean;
    transcript?: string;        // ← IELTS Listening script

    media?: {
      id?: string;
      url?: string;
      file?: string;
      type: "audio" | "image";
      mediaType?: "audio" | "image";
    }[];

    answers: {
      id?: string;
      content: string;
      isCorrect: boolean;
      feedback?: string;
      orderIndex?: number;
    }[];

    // group only
    passage?: string;
    questions?: Array<{         // ← typed rõ hơn
      id?: string;
      content: string;
      questionType: number;
      isAiGraded?: boolean;
      sampleAnswer?: string;
      maxWords?: number;
      minWords?: number;
      defaultScore: number;
      shuffleAnswers: boolean;
      explanation?: string;
      orderIndex?: number;
      answers: {
        id?: string;
        content: string;
        isCorrect: boolean;
        feedback?: string;
        orderIndex: number;
      }[];
    }>;

    // Writing / Speaking
    promptTypes?: number;
    minWords?: number;
    maxWords?: number;
    timeLimitSeconds?: number;
    isAiGraded?: boolean;
    rubricJson?: string;
    sampleAnswer?: string;
    metadataJson?: string;
  };
}