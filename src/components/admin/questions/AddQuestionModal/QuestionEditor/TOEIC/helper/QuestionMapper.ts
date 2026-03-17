import type {
  AnswerDto,
  MediaDto,
  QuestionGroupDetailDto,
  SingleQuestionDetailDto
} from "../../../../components/Quesion.config";
import type { EditorFormData } from "../../editor.type";

export const mapSingleDtoToEditorData = (
  dto: SingleQuestionDetailDto
): EditorFormData => ({
  mode: "single",
  data: {
    id:             dto.id,
    categoryId:     dto.categoryId,
    content:        dto.content ?? "",
    questionType:   String(dto.questionType),  // ← cast sang string cho khớp EditorFormData
    difficultyId:   dto.difficultyId ?? "",
    defaultScore:   dto.defaultScore,
    shuffleAnswers: dto.shuffleAnswers ?? false,
    explanation:    dto.explanation ?? undefined,
    isActive:       dto.isActive ?? true,

    // IELTS / Writing / Speaking fields
    isAiGraded:   (dto as any).isAiGraded ?? false,
    sampleAnswer: (dto as any).sampleAnswer ?? undefined,
    minWords:     (dto as any).minWords ?? undefined,
    maxWords:     (dto as any).maxWords ?? undefined,
    promptTypes:  (dto as any).promptTypes ?? undefined,

    media: dto.media?.map(mapMediaDtoToEditor) ?? [],
    answers: dto.answers
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(mapAnswerDtoToEditor),
  },
});

export const mapGroupDtoToEditorData = (
  dto: QuestionGroupDetailDto
): EditorFormData => ({
  mode: "group",
  data: {
    id:             dto.id,
    categoryId:     dto.categoryId,
    content:        dto.content ?? "",
    passage:        dto.content ?? "",         // alias cho IELTS Reading
    transcript:     (dto as any).transcript ?? undefined, // IELTS Listening
    questionType:   "GROUP",
    difficultyId:   dto.difficultyId ?? dto.questions?.[0]?.difficultyId ?? "",
    defaultScore:   dto.questions?.[0]?.defaultScore ?? 0,
    shuffleAnswers: false,
    explanation:    dto.explanation ?? undefined,
    isActive:       dto.isActive ?? true,
    media:          dto.media?.map(mapMediaDtoToEditor) ?? [],
    answers:        [],

    // ← flat object, KHÔNG wrap {mode, data}
    questions: dto.questions
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(q => ({
        id:             q.id,
        content:        q.content ?? "",
        questionType:   typeof q.questionType === "number"
                          ? q.questionType
                          : Number(q.questionType) || 1,
        difficultyId:   q.difficultyId,
        defaultScore:   q.defaultScore,
        shuffleAnswers: q.shuffleAnswers ?? false,
        explanation:    q.explanation ?? undefined,
        orderIndex:     q.orderIndex ?? 0,

        // IELTS fill-in fields
        isAiGraded:   (q as any).isAiGraded ?? false,
        sampleAnswer: (q as any).sampleAnswer ?? undefined,
        minWords:     (q as any).minWords ?? undefined,
        maxWords:     (q as any).maxWords ?? undefined,

        answers: q.answers
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map(mapAnswerDtoToEditor),
      })),
  },
});

const mapAnswerDtoToEditor = (a: AnswerDto) => ({
  id:         a.id,
  content:    a.content,
  isCorrect:  a.isCorrect,
  feedback:   a.feedback ?? undefined,
  orderIndex: a.orderIndex,
});

const mapMediaDtoToEditor = (m: MediaDto) => ({
  id:   m.id,
  url:  m.url,
  type: m.mediaType as "audio" | "image",
});