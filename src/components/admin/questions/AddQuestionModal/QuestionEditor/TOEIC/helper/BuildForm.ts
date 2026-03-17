import type { EditorFormData } from "../../editor.type";

export const buildSingleFormData = (data: EditorFormData): FormData => {
  const fd = new FormData();
  const d = data.data;

  fd.append("CategoryId",   d.categoryId);
  fd.append("Content",      d.content);
  fd.append("QuestionType", d.questionType ?? "SingleChoice");

  if (d.difficultyId)               fd.append("DifficultyId",   d.difficultyId);
  if (d.defaultScore !== undefined)  fd.append("DefaultScore",   String(d.defaultScore));
  if (d.shuffleAnswers !== undefined) fd.append("ShuffleAnswers", String(d.shuffleAnswers));
  if (d.explanation)                 fd.append("Explanation",    d.explanation);
  if (d.isActive !== undefined)      fd.append("IsActive",       String(d.isActive));
  if (d.isAiGraded !== undefined)    fd.append("IsAiGraded",     String(d.isAiGraded));
  if (d.sampleAnswer)                fd.append("SampleAnswer",   d.sampleAnswer);
  if (d.minWords !== undefined)      fd.append("MinWords",       String(d.minWords));
  if (d.maxWords !== undefined)      fd.append("MaxWords",       String(d.maxWords));
  if (d.promptTypes !== undefined)   fd.append("PromptTypes",    String(d.promptTypes));

  d.media?.forEach(m => {
    if (m.file) {
      if (m.type === "audio") fd.append("AudioFile", m.file);
      if (m.type === "image") fd.append("ImageFile", m.file);
    }
    if (m.url) {
      if (m.type === "audio") fd.append("AudioUrl", m.url);
      if (m.type === "image") fd.append("ImageUrl", m.url);
    }
  });

  d.answers.forEach((a, idx) => {
    if (a.id)       fd.append(`Answers[${idx}].Id`,         a.id);
    fd.append(`Answers[${idx}].Content`,    a.content);
    fd.append(`Answers[${idx}].IsCorrect`,  String(a.isCorrect));
    fd.append(`Answers[${idx}].OrderIndex`, String(a.orderIndex ?? idx + 1));
    if (a.feedback) fd.append(`Answers[${idx}].Feedback`,   a.feedback);
  });

  return fd;
};

export const buildGroupFormData = (data: EditorFormData): FormData => {
  const fd = new FormData();
  const d = data.data;

  fd.append("CategoryId", d.categoryId);

  // Passage hoặc Transcript — IELTS vs TOEIC
  if (d.transcript)       fd.append("Transcript",    d.transcript);
  if (d.passage)          fd.append("GroupContent",  d.passage);
  else if (d.content)     fd.append("GroupContent",  d.content);

  if (d.explanation)             fd.append("Explanation",  d.explanation);
  if (d.isActive !== undefined)  fd.append("IsActive",     String(d.isActive));
  if (d.difficultyId)            fd.append("DifficultyId", d.difficultyId);

  // Group media
  d.media?.forEach(m => {
    if (m.file) {
      if (m.type === "audio") fd.append("GroupAudioFile", m.file);
      if (m.type === "image") fd.append("GroupImageFile", m.file);
    }
    if (m.url) {
      if (m.type === "audio") fd.append("GroupAudioUrl", m.url);
      if (m.type === "image") fd.append("GroupImageUrl", m.url);
    }
  });

  // ← q là flat object (không có .data wrapper)
  d.questions?.forEach((q, qi) => {
    if (q.id)  fd.append(`Questions[${qi}].Id`, q.id);

    fd.append(`Questions[${qi}].Content`,        q.content);
    fd.append(`Questions[${qi}].QuestionType`,   String(q.questionType ?? 1));
    fd.append(`Questions[${qi}].DefaultScore`,   String(q.defaultScore ?? 1));
    fd.append(`Questions[${qi}].ShuffleAnswers`, String(q.shuffleAnswers ?? false));
    fd.append(`Questions[${qi}].OrderIndex`,     String(q.orderIndex ?? qi + 1));

    if (q.explanation)  fd.append(`Questions[${qi}].Explanation`,  q.explanation);

    // IELTS fill-in fields
    if (q.isAiGraded !== undefined)
      fd.append(`Questions[${qi}].IsAiGraded`,   String(q.isAiGraded));
    if (q.sampleAnswer)
      fd.append(`Questions[${qi}].SampleAnswer`, q.sampleAnswer);
    if (q.maxWords !== undefined)
      fd.append(`Questions[${qi}].MaxWords`,     String(q.maxWords));
    if (q.minWords !== undefined)
      fd.append(`Questions[${qi}].MinWords`,     String(q.minWords));

    q.answers.forEach((a, ai) => {
      if (a.id)       fd.append(`Questions[${qi}].Answers[${ai}].Id`,         a.id);
      fd.append(`Questions[${qi}].Answers[${ai}].Content`,    a.content);
      fd.append(`Questions[${qi}].Answers[${ai}].IsCorrect`,  String(a.isCorrect));
      fd.append(`Questions[${qi}].Answers[${ai}].OrderIndex`, String(a.orderIndex ?? ai + 1));
      if (a.feedback) fd.append(`Questions[${qi}].Answers[${ai}].Feedback`,   a.feedback);
    });
  });

  return fd;
};