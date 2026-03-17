// editors/IELTS/IeltsGroupEditor.tsx
import { useEffect, useState } from "react";
import type { EditorProps } from "../editor.type";
import { toast } from "react-toastify";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import MediaFileInput from "../Shared/MediaFileInput";
import RichTextEditor from "../../../../../tiptap/TiptapEditor";
import AnswerRow from "../../AnswerRow/AnswerRow";

type IeltsVariant = "ielts_reading" | "ielts_listening";

type IeltsQuestion = {
    id?: string;
    content: string;
    explanation: string;
    orderIndex: number;
    questionType: number;
    isAiGraded: boolean;
    sampleAnswer: string;
    maxWords: number;
    answers: {
        id?: string;
        Content: string;
        IsCorrect: boolean;
        OrderIndex: number;
        Feedback: string;
    }[];
};

const IELTS_QUESTION_TYPES = [
    { value: 1,  label: "Multiple Choice",         hasFreeAnswer: false, defaultAnswerCount: 4 },
    { value: 12, label: "True / False / Not Given", hasFreeAnswer: false, defaultAnswerCount: 3 },
    { value: 13, label: "Yes / No / Not Given",     hasFreeAnswer: false, defaultAnswerCount: 3 },
    { value: 5,  label: "Matching Heading",         hasFreeAnswer: false, defaultAnswerCount: 4 },
    { value: 6,  label: "Matching Information",     hasFreeAnswer: false, defaultAnswerCount: 4 },
    { value: 4,  label: "Matching",                 hasFreeAnswer: false, defaultAnswerCount: 4 },
    { value: 7,  label: "Short Answer",             hasFreeAnswer: true,  defaultAnswerCount: 1 },
    { value: 8,  label: "Note Completion",          hasFreeAnswer: true,  defaultAnswerCount: 1 },
    { value: 9,  label: "Form Completion",          hasFreeAnswer: true,  defaultAnswerCount: 1 },
    { value: 11, label: "Sentence Completion",      hasFreeAnswer: true,  defaultAnswerCount: 1 },
    { value: 10, label: "Map Labeling",             hasFreeAnswer: true,  defaultAnswerCount: 1 },
];

const TFNGAnswers = (prefix: string) => [
    { Content: `${prefix} True`,      IsCorrect: false, OrderIndex: 1, Feedback: "" },
    { Content: `${prefix} False`,     IsCorrect: false, OrderIndex: 2, Feedback: "" },
    { Content: `${prefix} Not Given`, IsCorrect: false, OrderIndex: 3, Feedback: "" },
];

const MCQAnswers = () => [
    { Content: "A. ", IsCorrect: false, OrderIndex: 1, Feedback: "" },
    { Content: "B. ", IsCorrect: false, OrderIndex: 2, Feedback: "" },
    { Content: "C. ", IsCorrect: false, OrderIndex: 3, Feedback: "" },
    { Content: "D. ", IsCorrect: false, OrderIndex: 4, Feedback: "" },
];

function createEmptyQuestion(orderIndex: number, questionType = 1): IeltsQuestion {
    const typeConfig = IELTS_QUESTION_TYPES.find(t => t.value === questionType)!;
    return {
        content: "",
        explanation: "",
        orderIndex,
        questionType,
        isAiGraded: typeConfig.hasFreeAnswer,
        sampleAnswer: "",
        maxWords: typeConfig.hasFreeAnswer ? 3 : 0,
        answers: questionType === 12 || questionType === 13
            ? TFNGAnswers(questionType === 13 ? "Yes /" : "")
            : typeConfig.hasFreeAnswer
                ? [{ Content: "", IsCorrect: true, OrderIndex: 1, Feedback: "" }]
                : MCQAnswers(),
    };
}

type Props = EditorProps & { variant: IeltsVariant };

export const IeltsGroupEditor: React.FC<Props> = ({
    variant,
    categories = [],
    difficulties = [],
    onSave,
    onCancel,
    initialData,
    isEdit,
    saving: externalSaving,
}) => {
    const isListening = variant === "ielts_listening";

    const [categoryId, setCategoryId]   = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [groupContent, setGroupContent] = useState(""); // passage hoặc transcript
    const [tags, setTags]               = useState(isListening ? "ielts,listening" : "ielts,reading");
    const [saving, setSaving]           = useState(false);
    const [audioFile, setAudioFile]     = useState<File | null>(null);
    const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
    const [questions, setQuestions]     = useState<IeltsQuestion[]>([
        createEmptyQuestion(1, 1),
    ]);

    // ── Load edit data ──────────────────────────────────────
    useEffect(() => {
        if (!initialData || !isEdit) return;
        const d = initialData.data;

        setCategoryId(d.categoryId ?? "");
        setDifficultyId(d.difficultyId ?? "");
        setGroupContent(d.passage ?? d.content ?? "");

        // audio
        const audioMedia = d.media?.find(m => m.type === "audio" || m.mediaType === "audio");
        if (audioMedia?.url) setExistingAudioUrl(audioMedia.url);

        if (Array.isArray(d.questions) && d.questions.length > 0) {
            const mapped: IeltsQuestion[] = d.questions.map((q: any, idx: number) => ({
                id:           q.id,
                content:      q.content ?? "",
                explanation:  q.explanation ?? "",
                orderIndex:   q.orderIndex ?? idx + 1,
                questionType: q.questionType ?? 1,
                isAiGraded:   q.isAiGraded ?? false,
                sampleAnswer: q.sampleAnswer ?? "",
                maxWords:     q.maxWords ?? 3,
                answers: (q.answers ?? []).map((a: any, aIdx: number) => ({
                    id:         a.id,
                    Content:    a.content ?? a.Content ?? "",
                    IsCorrect:  !!(a.isCorrect ?? a.IsCorrect),
                    OrderIndex: a.orderIndex ?? a.OrderIndex ?? aIdx + 1,
                    Feedback:   a.feedback ?? a.Feedback ?? "",
                })),
            })).sort((a: IeltsQuestion, b: IeltsQuestion) => a.orderIndex - b.orderIndex);
            setQuestions(mapped);
        }
    }, [isEdit, initialData]);

    // ── Helpers ─────────────────────────────────────────────
    const addQuestion = () => {
        setQuestions(prev => [...prev, createEmptyQuestion(prev.length + 1)]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx)
            .map((q, i) => ({ ...q, orderIndex: i + 1 })));
    };

    const updateQuestion = (idx: number, field: keyof IeltsQuestion, value: any) => {
        setQuestions(prev => {
            const next = [...prev];
            (next[idx] as any)[field] = value;
            return next;
        });
    };

    // Khi đổi questionType → reset answers phù hợp
    const changeQuestionType = (idx: number, typeValue: number) => {
        const typeConfig = IELTS_QUESTION_TYPES.find(t => t.value === typeValue)!;
        setQuestions(prev => {
            const next = [...prev];
            next[idx] = {
                ...next[idx],
                questionType: typeValue,
                isAiGraded:   typeConfig.hasFreeAnswer,
                maxWords:     typeConfig.hasFreeAnswer ? 3 : 0,
                answers: typeValue === 12 || typeValue === 13
                    ? TFNGAnswers(typeValue === 13 ? "Yes /" : "")
                    : typeConfig.hasFreeAnswer
                        ? [{ Content: "", IsCorrect: true, OrderIndex: 1, Feedback: "" }]
                        : MCQAnswers(),
            };
            return next;
        });
    };

    const updateAnswer = (qIdx: number, aIdx: number, updated: any) => {
        setQuestions(prev => {
            const next = [...prev];
            next[qIdx].answers[aIdx] = updated;
            return next;
        });
    };

    const selectCorrectAnswer = (qIdx: number, aIdx: number) => {
        setQuestions(prev => {
            const next = [...prev];
            next[qIdx].answers = next[qIdx].answers.map((a, i) => ({
                ...a, IsCorrect: i === aIdx,
            }));
            return next;
        });
    };

    // ── Validate ────────────────────────────────────────────
    const validate = (): boolean => {
        if (!categoryId) { toast.error("Vui lòng chọn Section / Passage"); return false; }
        if (!difficultyId) { toast.error("Vui lòng chọn độ khó"); return false; }

        if (isListening && !audioFile && !existingAudioUrl) {
            toast.error("IELTS Listening phải có file audio"); return false;
        }

        if (!isListening && !groupContent.trim()) {
            toast.error("Vui lòng nhập đoạn văn (Passage)"); return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) {
                toast.error(`Câu hỏi ${i + 1}: Chưa nhập nội dung`); return false;
            }

            const typeConfig = IELTS_QUESTION_TYPES.find(t => t.value === q.questionType)!;

            if (typeConfig.hasFreeAnswer) {
                // Fill-in: phải có sampleAnswer
                if (!q.sampleAnswer?.trim()) {
                    toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập đáp án mẫu`); return false;
                }
            } else {
                // MCQ/Matching: phải có đúng 1 đáp án đúng
                const correct = q.answers.filter(a => a.IsCorrect).length;
                if (correct !== 1) {
                    toast.error(`Câu hỏi ${i + 1}: Phải có đúng 1 đáp án đúng`); return false;
                }
            }
        }
        return true;
    };

    // ── Save ────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);

        try {
            const fd = new FormData();
            if (initialData?.data?.id) fd.append("Id", initialData.data.id);

            fd.append("CategoryId",   categoryId);
            fd.append("DifficultyId", difficultyId);

            // Passage hoặc Transcript
            if (isListening) {
                fd.append("Transcript", groupContent);
                if (audioFile) fd.append("GroupAudioFile", audioFile);
            } else {
                fd.append("GroupContent", groupContent);
            }

            // Tags
            tags.split(",").map(t => t.trim()).filter(Boolean)
                .forEach((tag, i) => fd.append(`Tags[${i}]`, tag));

            // Questions
            questions.forEach((q, qi) => {
                if (q.id)  fd.append(`Questions[${qi}].Id`, q.id);

                fd.append(`Questions[${qi}].Content`,      q.content);
                fd.append(`Questions[${qi}].Explanation`,  q.explanation || "");
                fd.append(`Questions[${qi}].QuestionType`, q.questionType.toString());
                fd.append(`Questions[${qi}].DefaultScore`, "1");
                fd.append(`Questions[${qi}].ShuffleAnswers`, "false");
                fd.append(`Questions[${qi}].OrderIndex`,   q.orderIndex.toString());
                fd.append(`Questions[${qi}].IsAiGraded`,   q.isAiGraded.toString());

                if (q.isAiGraded) {
                    // Fill-in: lưu đáp án đúng vào SampleAnswer + 1 Answer
                    fd.append(`Questions[${qi}].SampleAnswer`, q.sampleAnswer || "");
                    fd.append(`Questions[${qi}].MaxWords`,     q.maxWords.toString());

                    // Vẫn append 1 answer IsCorrect=true để backend chấm
                    fd.append(`Questions[${qi}].Answers[0].Content`,   q.sampleAnswer || "");
                    fd.append(`Questions[${qi}].Answers[0].IsCorrect`, "true");
                    fd.append(`Questions[${qi}].Answers[0].OrderIndex`, "1");
                } else {
                    // MCQ/Matching: append toàn bộ answers
                    q.answers.forEach((a, ai) => {
                        if (a.id) fd.append(`Questions[${qi}].Answers[${ai}].Id`, a.id);
                        fd.append(`Questions[${qi}].Answers[${ai}].Content`,    a.Content);
                        fd.append(`Questions[${qi}].Answers[${ai}].IsCorrect`,  a.IsCorrect.toString());
                        fd.append(`Questions[${qi}].Answers[${ai}].OrderIndex`, a.OrderIndex.toString());
                        fd.append(`Questions[${qi}].Answers[${ai}].Feedback`,   a.Feedback || "");
                    });
                }
            });

            await onSave({ mode: "group", payload: fd });
        } catch (err: any) {
            toast.error(err?.message || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className={isListening ? "fa-solid fa-headphones" : "fa-solid fa-book-open"}></i>
                    {" "}{isListening ? "IELTS Listening – Section" : "IELTS Reading – Passage"}
                </h3>
                <p className="editor-hint">
                    {isListening
                        ? "🎧 Audio + nhiều loại câu hỏi (MCQ, Form/Note Completion, Matching...)"
                        : "📋 Đoạn văn + nhiều loại câu hỏi (MCQ, T/F/NG, Matching, Short Answer...)"}
                </p>
            </div>

            <div className="editor-body">
                <BaseQuestionForm
                    categoryId={categoryId}
                    difficultyId={difficultyId}
                    categories={categories}
                    difficulties={difficulties}
                    onCategoryChange={setCategoryId}
                    onDifficultyChange={setDifficultyId}
                    content=""
                    onContentChange={() => {}}
                    shuffle={false}
                    onShuffleChange={() => {}}
                    explanation=""
                    tags={tags}
                    onTagsChange={setTags}
                    showContent={false}  // ← tắt content ở BaseForm, tự render riêng bên dưới
                />

                {/* Audio — Listening only */}
                {isListening && (
                    <div className="form__full">
                        <MediaFileInput
                            label="File Audio (bắt buộc)"
                            accept="audio/*"
                            existingUrl={existingAudioUrl}
                            file={audioFile}
                            setFile={setAudioFile}
                        />
                    </div>
                )}

                {/* Transcript / Passage */}
                <div className="form__full">
                    <label className="form-label fw-bold">
                        {isListening ? "Transcript (tùy chọn)" : "Đoạn văn – Passage (bắt buộc)"}
                    </label>
                    <RichTextEditor
                        value={groupContent}
                        onChange={setGroupContent}
                        maxHeight="300px"
                    />
                </div>

                {/* Questions */}
                {questions.map((q, qIdx) => {
                    const typeConfig = IELTS_QUESTION_TYPES.find(t => t.value === q.questionType)!;
                    return (
                        <div key={qIdx} className="group__question__child card mb-4 p-3 border">
                            {/* Question header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    <i className="fa-solid fa-circle-question"></i> Question {qIdx + 1}
                                </h5>
                                {questions.length > 1 && (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeQuestion(qIdx)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>

                            {/* Question Type selector */}
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Loại câu hỏi</label>
                                <select
                                    className="form-select"
                                    value={q.questionType}
                                    onChange={e => changeQuestionType(qIdx, Number(e.target.value))}
                                >
                                    {IELTS_QUESTION_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Question content */}
                            <div className="row mb-3">
                                <div className="col-md-7">
                                    <label className="form-label fw-bold">Nội dung câu hỏi</label>
                                    <RichTextEditor
                                        key={`q-content-${qIdx}`}
                                        value={q.content}
                                        onChange={val => updateQuestion(qIdx, "content", val)}
                                        maxHeight="200px"
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label fw-bold">Giải thích (tùy chọn)</label>
                                    <RichTextEditor
                                        key={`q-explanation-${qIdx}`}
                                        value={q.explanation}
                                        onChange={val => updateQuestion(qIdx, "explanation", val)}
                                        maxHeight="200px"
                                    />
                                </div>
                            </div>

                            {/* Fill-in: SampleAnswer + MaxWords */}
                            {typeConfig.hasFreeAnswer ? (
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            Đáp án đúng (Sample Answer)
                                            <span className="text-danger"> *</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="VD: Receptionist"
                                            value={q.sampleAnswer}
                                            onChange={e => updateQuestion(qIdx, "sampleAnswer", e.target.value)}
                                        />
                                        <small className="text-muted">
                                            Dùng để chấm điểm tự động (case-insensitive)
                                        </small>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Số từ tối đa</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={1} max={10}
                                            value={q.maxWords}
                                            onChange={e => updateQuestion(qIdx, "maxWords", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-end">
                                        <span className="badge bg-info text-dark p-2">
                                            <i className="fa-solid fa-robot"></i> Tự động chấm
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* MCQ / Matching: answers table */
                                <div className="question__child__answers">
                                    <label className="form-label fw-bold">Đáp án</label>
                                    <table className="answer-table table table-bordered table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: 60 }}>#</th>
                                                <th>Nội dung đáp án</th>
                                                <th style={{ width: 100, textAlign: "center" }}>Đúng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {q.answers.map((a, aIdx) => (
                                                <AnswerRow
                                                    key={aIdx}
                                                    index={aIdx}
                                                    answer={a}
                                                    questionIndex={qIdx}
                                                    isSelected={a.IsCorrect}
                                                    onChange={updated => updateAnswer(qIdx, aIdx, updated)}
                                                    onSelect={() => selectCorrectAnswer(qIdx, aIdx)}
                                                    canRemove={false}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add question button */}
                <div className="text-center mb-3">
                    <button className="btn btn-outline-primary" onClick={addQuestion}>
                        <i className="fa-solid fa-plus"></i> Thêm câu hỏi
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="editor-footer">
                <button className="btn btn-default" onClick={onCancel} disabled={saving}>
                    Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || externalSaving}>
                    <i className="fa-solid fa-save"></i>{" "}
                    {isEdit ? "Cập nhật" : "Lưu câu hỏi"}
                </button>
            </div>
        </div>
    );
};