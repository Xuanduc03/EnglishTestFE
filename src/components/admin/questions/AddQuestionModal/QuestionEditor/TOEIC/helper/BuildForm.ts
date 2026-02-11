import type { EditorFormData } from "../../editor.type";

export const buildSingleFormData = (data: EditorFormData): FormData => {
  const fd = new FormData();

  const editData = data.data;

  fd.append("CategoryId", editData.categoryId);
  fd.append("Content", editData.content);
  fd.append("QuestionType", editData.questionType ?? "SingleChoice");

  if (editData.difficultyId)
    fd.append("DifficultyId", editData.difficultyId);
  if (editData.defaultScore !== undefined)
    fd.append("DefaultScore", String(editData.defaultScore));

  if (editData.shuffleAnswers !== undefined)
    fd.append("ShuffleAnswers", String(editData.shuffleAnswers));

  if (editData.explanation)
    fd.append("Explanation", editData.explanation);

  if (editData.isActive !== undefined)
    fd.append("IsActive", String(editData.isActive));
  // Media
  editData.media?.forEach((m) => {
    if (m.file) {
      if (m.type === "audio") fd.append("AudioFile", m.file);
      if (m.type === "image") fd.append("ImageFile", m.file);
    }
    if (m.url) {
      if (m.type === "audio") fd.append("AudioUrl", m.url);
      if (m.type === "image") fd.append("ImageUrl", m.url);
    }
  });

  // Answers
  editData.answers.forEach((a, idx) => {
    if (a.id) fd.append(`Answers[${idx}].Id`, a.id);
    fd.append(`Answers[${idx}].Content`, a.content);
    fd.append(`Answers[${idx}].IsCorrect`, String(a.isCorrect));
    fd.append(`Answers[${idx}].OrderIndex`, String(a.orderIndex));
    if (a.feedback)
      fd.append(`Answers[${idx}].Feedback`, a.feedback);
  });

  return fd;
};


export const buildGroupFormData = (data: EditorFormData): FormData => {
  const fd = new FormData();

  const editDataGroup = data.data;
  fd.append("CategoryId", editDataGroup.categoryId);
  fd.append("Content", editDataGroup.passage ?? "");

  if (editDataGroup.explanation)
    fd.append("Explanation", editDataGroup.explanation);

  if (editDataGroup.isActive !== undefined)
    fd.append("IsActive", String(editDataGroup.isActive));

  // Group media
  editDataGroup.media?.forEach((m) => {
    if (m.file) {
      if (m.type === "audio") fd.append("AudioFile", m.file);
      if (m.type === "image") fd.append("ImageFile", m.file);
    }
  });

  // Questions in group
  editDataGroup.questions?.forEach((q, qIdx) => {
    fd.append(`Questions[${qIdx}].Content`, q.data.content);
    fd.append(
      `Questions[${qIdx}].QuestionType`,
      q.data.questionType ?? "SingleChoice"
    );

    if (q.data.difficultyId)
      fd.append(`Questions[${qIdx}].DifficultyId`, q.data.difficultyId);

    if (q.data.defaultScore !== undefined)
      fd.append(
        `Questions[${qIdx}].DefaultScore`,
        String(q.data.defaultScore)
      );

    if (q.data.explanation)
      fd.append(
        `Questions[${qIdx}].Explanation`,
        q.data.explanation
      );

    q.data.answers.forEach((a, aIdx) => {
      if (a.id)
        fd.append(
          `Questions[${qIdx}].Answers[${aIdx}].Id`,
          a.id
        );

      fd.append(
        `Questions[${qIdx}].Answers[${aIdx}].Content`,
        a.content
      );
      fd.append(
        `Questions[${qIdx}].Answers[${aIdx}].IsCorrect`,
        String(a.isCorrect)
      );
      fd.append(
        `Questions[${qIdx}].Answers[${aIdx}].OrderIndex`,
        String(a.orderIndex)
      );
    });
  });

  return fd;
};
