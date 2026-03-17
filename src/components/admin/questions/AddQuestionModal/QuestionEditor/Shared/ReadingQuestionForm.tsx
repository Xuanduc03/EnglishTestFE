// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import type { EditorProps } from "../editor.type";
import { toast } from "react-toastify";
import { BaseQuestionForm } from "./BaseQuestionForm";
import MediaFileInput from "./MediaFileInput";
import RichTextEditor from "../../../../../tiptap/TiptapEditor";
import AnswerRow from "../../AnswerRow/AnswerRow";

type SharedQuestion = {
    id?: string;
    content: string;
    explanation: string;
    orderIndex: number;
    answers: {
        id?: string;
        Content: string;
        IsCorrect: boolean;
        OrderIndex: number;
    }[];
};

// ─────────────────────────────────────────────
// Config theo variant
// ─────────────────────────────────────────────

const VARIANT_CONFIG = {
    part6: {
        icon: "fa-solid fa-file-lines",
        title: "TOEIC Part 6 – Text Completion",
        hint: "📋 1 đoạn văn với các chỗ trống + câu hỏi, mỗi câu 4 đáp án",
        defaultTags: "toeic,part6,reading",
        defaultQuestionCount: 4,
        minQuestions: 2,
        maxQuestions: 6,
        showImage: false,
        defaultScore: "5",
        passageLabel: "Đoạn văn cần hoàn thành",
        passageEmptyError: "Vui lòng nhập đoạn văn cần hoàn thành",
    },
    part7: {
        icon: "fa-solid fa-newspaper",
        title: "TOEIC Part 7 – Reading Comprehension",
        hint: "📋 1 đoạn văn + 2-5 câu hỏi, mỗi câu 4 đáp án (có thể có hình ảnh)",
        defaultTags: "toeic,part7,reading",
        defaultQuestionCount: 3,
        minQuestions: 2,
        maxQuestions: 5,
        showImage: true,
        defaultScore: "1",
        passageLabel: "Đoạn văn đọc hiểu",
        passageEmptyError: "Vui lòng nhập đoạn văn đọc hiểu",
    },

     ielts_reading: {
        icon: "fa-solid fa-book-open",
        title: "IELTS Reading – Passage",
        hint: "📋 1 đoạn văn + nhiều loại câu hỏi (MCQ, T/F/NG, Matching, Short Answer...)",
        defaultTags: "ielts,reading",
        defaultQuestionCount: 5,
        minQuestions: 1,
        maxQuestions: 14,
        showImage: false,
        defaultScore: "1",
        passageLabel: "Đoạn văn (Passage)",
        passageEmptyError: "Vui lòng nhập đoạn văn",
    },

    ielts_listening: {
        icon: "fa-solid fa-headphones",
        title: "IELTS Listening – Section",
        hint: "🎧 1 đoạn audio + nhiều loại câu hỏi (MCQ, Form/Note Completion, Matching...)",
        defaultTags: "ielts,listening",
        defaultQuestionCount: 5,
        minQuestions: 1,
        maxQuestions: 10,
        showImage: false,
        showAudio: true,
        defaultScore: "1",
        passageLabel: "Transcript (script bài nghe)",
        passageEmptyError: "",  // transcript không bắt buộc
    },
} as const;

type PartVariant = "part6" | "part7" | "ielts_reading" | "ielts_listening";

type Part6And7EditorProps = EditorProps & {
    /**
     * "part6" → Text Completion (cố định 4 câu, không có ảnh, tag toeic,part6,reading)
     * "part7" → Reading Comprehension (2-5 câu động, có ảnh optional, tag toeic,part7,reading)
     */
    variant: PartVariant;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function createEmptyQuestion(orderIndex: number): SharedQuestion {
    return {
        content: "",
        explanation: "",
        orderIndex,
        answers: [
            { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
            { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
            { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
            { Content: "(D) ", IsCorrect: false, OrderIndex: 4 },
        ],
    };
}

function mapIncomingQuestions(rawQuestions: any[]): SharedQuestion[] {
    return rawQuestions
        .map((wrapper: any, idx: number): SharedQuestion => {
            const q = wrapper.data ?? wrapper; // hỗ trợ cả 2 dạng data shape
            return {
                id: q.id,
                content: q.content ?? "",
                explanation: q.explanation ?? "",
                orderIndex: q.orderIndex ?? idx + 1,
                answers: (q.answers ?? []).map((a: any) => ({
                    id: a.id,
                    Content: a.content ?? a.Content ?? "",
                    IsCorrect: !!(a.isCorrect || a.IsCorrect),
                    OrderIndex: a.orderIndex ?? a.OrderIndex ?? 1,
                })),
            };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export const ReadingQuestionFormEditor: React.FC<Part6And7EditorProps> = ({
    variant,
    categories = [],
    difficulties = [],
    onSave,
    onCancel,
    initialData,
    isEdit,
}) => {
    const cfg = VARIANT_CONFIG[variant];

    // ── Common state ──
    const [shuffle, setShuffle] = useState(false);
    const [explanation, setExplanation] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [groupContent, setGroupContent] = useState("");
    const [tags, setTags] = useState<string>(cfg.defaultTags);
    const [saving, setSaving] = useState(false);

    // ── Questions state ──
    const [questionCount, setQuestionCount] = useState<number>(cfg.defaultQuestionCount);
    const [questions, setQuestions] = useState<SharedQuestion[]>(() =>
        Array.from({ length: cfg.defaultQuestionCount }, (_, i) => createEmptyQuestion(i + 1))
    );

    // ── Image state (chỉ dùng cho Part 7) ──
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    // ─────────────────────────────────────────
    // Load initialData khi edit
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!initialData || !isEdit || initialData.mode !== "group") return;

        const data = initialData.data;
        console.log(`📝 Part ${variant} Editor loading data:`, data);

        setCategoryId(data.categoryId ?? "");
        setDifficultyId(data.difficultyId ?? "");
        setGroupContent(data.content ?? "");
        setExplanation(data.explanation ?? "");

        // Image (Part 7)
        if (cfg.showImage && (data as any).imageUrl) {
            setExistingImageUrl((data as any).imageUrl);
        }

        if (Array.isArray(data.questions) && data.questions.length > 0) {
            const mapped = mapIncomingQuestions(data.questions);
            setQuestions(mapped);
            setQuestionCount(mapped.length);
        }
    }, [isEdit, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─────────────────────────────────────────
    // Sync số lượng câu hỏi khi questionCount thay đổi
    // ─────────────────────────────────────────
    useEffect(() => {
        if (questionCount === questions.length) return;

        if (questionCount > questions.length) {
            const added = Array.from(
                { length: questionCount - questions.length },
                (_, i) => createEmptyQuestion(questions.length + i + 1)
            );
            setQuestions((prev) => [...prev, ...added]);
        } else {
            setQuestions((prev) => prev.slice(0, questionCount));
        }
    }, [questionCount]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─────────────────────────────────────────
    // Helpers cập nhật question
    // ─────────────────────────────────────────
    const updateQuestionField = (
        qIdx: number,
        field: keyof SharedQuestion,
        value: any
    ) => {
        setQuestions((prev) => {
            const next = [...prev];
            (next[qIdx] as any)[field] = value;
            return next;
        });
    };

    const updateAnswer = (qIdx: number, aIdx: number, updated: any) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[qIdx].answers[aIdx] = updated;
            return next;
        });
    };

    const selectCorrectAnswer = (qIdx: number, aIdx: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[qIdx].answers = next[qIdx].answers.map((a, i) => ({
                ...a,
                IsCorrect: i === aIdx,
            }));
            return next;
        });
    };

    // ─────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────
    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        if (!groupContent.trim()) {
            toast.error(cfg.passageEmptyError);
            return false;
        }

        if (questions.length === 0) {
            toast.error("Phải có ít nhất 1 câu hỏi");
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) {
                toast.error(`Câu hỏi ${i + 1} chưa nhập nội dung`);
                return false;
            }
            const correctCount = q.answers.filter((a) => a.IsCorrect).length;
            if (correctCount !== 1) {
                toast.error(`Câu hỏi ${i + 1} phải có đúng 1 đáp án đúng`);
                return false;
            }
        }

        return true;
    };

    // ─────────────────────────────────────────
    // Save
    // ─────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("Id", initialData?.data?.id || "");
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("GroupContent", groupContent);
            formData.append("ShuffleAnswers", "false");

            // Image (Part 7 only)
            if (cfg.showImage && imageFile) {
                formData.append("ImageFile", imageFile);
            }

            const tagArray = tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            questions.forEach((q, qIndex) => {
                if (q.id) {
                    formData.append(`Questions[${qIndex}].Id`, q.id);
                }
                formData.append(`Questions[${qIndex}].Content`, q.content);
                formData.append(`Questions[${qIndex}].Explanation`, q.explanation || "");
                formData.append(`Questions[${qIndex}].QuestionType`, "SingleChoice");
                formData.append(`Questions[${qIndex}].DefaultScore`, cfg.defaultScore);
                formData.append(`Questions[${qIndex}].ShuffleAnswers`, "false");

                q.answers.forEach((a, aIndex) => {
                    if (a.id) {
                        formData.append(
                            `Questions[${qIndex}].Answers[${aIndex}].Id`,
                            a.id
                        );
                    }
                    formData.append(
                        `Questions[${qIndex}].Answers[${aIndex}].Content`,
                        a.Content
                    );
                    formData.append(
                        `Questions[${qIndex}].Answers[${aIndex}].IsCorrect`,
                        a.IsCorrect.toString()
                    );
                    formData.append(
                        `Questions[${qIndex}].Answers[${aIndex}].OrderIndex`,
                        a.OrderIndex.toString()
                    );
                });

                // Tags: Part 6 gắn per-question, Part 7 gắn ở root (giữ đúng cấu trúc API cũ)
                if (variant === "part6") {
                    tagArray.forEach((tag, tIdx) => {
                        formData.append(`Questions[${qIndex}].Tags[${tIdx}]`, tag);
                    });
                }
            });

            // Part 7: tags ở root level
            if (variant === "part7") {
                tagArray.forEach((tag, tIdx) => {
                    formData.append(`Tags[${tIdx}]`, tag);
                });
            }

            await onSave({ mode: "group", payload: formData });
        } catch (err: any) {
            toast.error(err?.message || `Lỗi khi lưu ${cfg.title}`);
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────

    // Build select options từ min→max
    const questionCountOptions = Array.from(
        { length: cfg.maxQuestions - cfg.minQuestions + 1 },
        (_, i) => cfg.minQuestions + i
    );

    return (
        <div className="editor-container">
            {/* HEADER */}
            <div className="editor-header">
                <h3>
                    <i className={cfg.icon}></i> {cfg.title}
                </h3>
                <p className="editor-hint">{cfg.hint}</p>
            </div>

            <div className="editor-body">
                {/* BASE FORM: Category, Difficulty, GroupContent, Tags */}
                <BaseQuestionForm
                    categoryId={categoryId}
                    difficultyId={difficultyId}
                    categories={categories}
                    difficulties={difficulties}
                    onCategoryChange={setCategoryId}
                    onDifficultyChange={setDifficultyId}
                    content={groupContent}
                    onContentChange={setGroupContent}
                    shuffle={shuffle}
                    onShuffleChange={setShuffle}
                    explanation={explanation}
                    tags={tags}
                    onTagsChange={setTags}
                    showContent={true}
                />

                {/* IMAGE + QUESTION COUNT */}
                <div className="form__full">
                    {/* Image – chỉ hiển thị cho Part 7 */}
                    {cfg.showImage && (
                        <MediaFileInput
                            label="Hình ảnh (Charts, Forms, Tables...)"
                            accept="image/*"
                            existingUrl={existingImageUrl}
                            file={imageFile}
                            setFile={setImageFile}
                        />
                    )}

                    {/* Số lượng câu hỏi */}
                    <div className="form-group">
                        <label className="form-label">Số lượng câu hỏi</label>
                        <select
                            className="form-control"
                            style={{ width: 150 }}
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                        >
                            {questionCountOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n} câu hỏi
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* QUESTIONS LOOP */}
                {questions.map((q, qIdx) => (
                    <div
                        key={qIdx}
                        className="group__question__child card mb-4 p-3 border"
                    >
                        {/* Header: tiêu đề câu hỏi */}
                        <div className="question__child__header mb-3">
                            <h5 className="question__child__title mb-3">
                                <i className="fa-solid fa-circle-question"></i>{" "}
                                Question {qIdx + 1}
                                {variant === "part6" && ` / Gap [${qIdx + 1}]`}
                            </h5>

                            <div className="row">
                                <div className="col-md-7">
                                    <label className="form-label fw-bold">
                                        Nội dung câu hỏi
                                    </label>
                                    <RichTextEditor
                                        key={`q-content-${qIdx}`}
                                        value={q.content}
                                        onChange={(val) =>
                                            updateQuestionField(qIdx, "content", val)
                                        }
                                        maxHeight="200px"
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label fw-bold">
                                        Giải thích (tùy chọn)
                                    </label>
                                    <RichTextEditor
                                     key={`q-explanation-${qIdx}`}
                                        value={q.explanation}
                                        onChange={(val) =>
                                            updateQuestionField(qIdx, "explanation", val)
                                        }
                                        maxHeight="200px"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Answers table */}
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
                                            onChange={(updated: any) =>
                                                updateAnswer(qIdx, aIdx, updated)
                                            }
                                            onSelect={() =>
                                                selectCorrectAnswer(qIdx, aIdx)
                                            }
                                            canRemove={false}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="editor-footer">
                <button
                    className="btn btn-default"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Hủy
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <i className="fa-solid fa-save"></i>{" "}
                    {isEdit ? "Cập nhật" : "Lưu câu hỏi"}
                </button>
            </div>
        </div>
    );
};

export default ReadingQuestionFormEditor;