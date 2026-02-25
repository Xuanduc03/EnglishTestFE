import type { AnswerDto, MediaDto, QuestionGroupDetailDto, SingleQuestionDetailDto } from "../../../../components/Quesion.config";
import type { EditorFormData } from "../../editor.type";

export const mapSingleDtoToEditorData = (
  dto: SingleQuestionDetailDto
): EditorFormData => {
  return {
    mode: "single",
    data: {
      id: dto.id, // ✅ Thêm id
      categoryId: dto.categoryId,
      content: dto.content ?? "",
      questionType: dto.questionType,

      difficultyId: dto.difficultyId,
      defaultScore: dto.defaultScore,
      shuffleAnswers: dto.shuffleAnswers ?? false, 
      explanation: dto.explanation ?? undefined,
      isActive: dto.isActive ?? true,

      media:
        dto.media?.map(m => ({
          id: m.id, 
          url: m.url,
          type: m.mediaType,
        })) ?? [],

      answers: dto.answers
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map(a => ({
          id: a.id,
          content: a.content,
          isCorrect: a.isCorrect,
          feedback: a.feedback ?? undefined,
          orderIndex: a.orderIndex,
        })),
    },
  };
};

export const mapGroupDtoToEditorData = (
  dto: QuestionGroupDetailDto
): EditorFormData => ({
  mode: "group",
  data: {
    id: dto.id,
    categoryId: dto.categoryId,
    content: dto.content ?? "",
    questionType: "GROUP",
    difficultyId: dto.difficultyId ?? dto.questions?.[0]?.difficultyId ?? "",
    defaultScore: dto.questions?.[0]?.defaultScore ?? 0,
    shuffleAnswers: false,
    explanation: dto.explanation ?? undefined,
    isActive: dto.isActive ?? true,
    media: dto.media?.map(mapMediaDtoToEditor) ?? [],
    answers: [],
    questions: dto.questions.map(q => ({
      mode: "single",
      data: {
        id: q.id,
        categoryId: dto.categoryId,
        content: q.content,
        questionType: q.questionType,
        difficultyId: q.difficultyId,
        defaultScore: q.defaultScore,
        shuffleAnswers: q.shuffleAnswers ?? false,
        explanation: q.explanation ?? undefined,
        isActive: q.isActive ?? true,
        media: q.media?.map(mapMediaDtoToEditor) ?? [],
        answers: q.answers
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map(mapAnswerDtoToEditor),
      }
    })),
  },
});

const mapAnswerDtoToEditor = (a: AnswerDto) => ({
  id: a.id,
  content: a.content,
  isCorrect: a.isCorrect,
  feedback: a.feedback ?? undefined,
  orderIndex: a.orderIndex,
});

const mapMediaDtoToEditor = (m: MediaDto) => ({
  id: m.id,
  url: m.url,
  type: m.mediaType as "audio" | "image", // ✅ Type cast an toàn
});