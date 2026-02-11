// editors/toeic/ToeicPart6Editor.tsx

import React, { useEffect, useState } from "react";
import type { EditorProps } from "../editor.type";
import AnswerRow from "../../AnswerRow/AnswerRow";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import { toast } from "react-toastify";
import RichTextEditor from "../../../../../tiptap/TiptapEditor";

type Part6Question = {
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

export const ToeicPart6Editor: React.FC<EditorProps> = ({ categories = [],
    difficulties = [],
    onSave,
    onCancel, initialData, isEdit }) => {
    const [content, setContent] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [explanation, setExplanation] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [groupContent, setGroupContent] = useState("");
    const [tags, setTags] = useState("toeic,part6,reading");
    const [saving, setSaving] = useState(false);


    const [questions, setQuestions] = useState<Part6Question[]>([
        createEmptyQuestion(1),
        createEmptyQuestion(2),
        createEmptyQuestion(3),
        createEmptyQuestion(4),
    ]);

    function createEmptyQuestion(orderIndex: number): Part6Question {
        return {
            content: `Question ${orderIndex}`,
            explanation: "",
            orderIndex,
            answers: [
                { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
                { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
                { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
                { Content: "(D) ", IsCorrect: false, OrderIndex: 4 },
            ],
        };
    };

    useEffect(() => {
        if (!initialData || !isEdit || initialData.mode !== "group") return;

        const data = initialData.data;
        console.log("📝 Part6 Editor loading data:", data);

        setCategoryId(data.categoryId ?? "");
        setDifficultyId(data.difficultyId ?? "");

        setGroupContent(data.content ?? "");
        setContent(data.content ?? "");

        setExplanation(data.explanation ?? "");

        if (Array.isArray(data.questions) && data.questions.length > 0) {
            const mappedQuestions = data.questions.map((wrapper: any, idx: number): Part6Question => {

                const q = wrapper.data;

                return {
                    id: q.id,
                    content: q.content ?? "",
                    explanation: q.explanation ?? "",
                    orderIndex: q.orderIndex || idx + 1,

                    answers: (q.answers ?? []).map((a: any) => ({
                        id: a.id,
                        Content: a.content,
                        IsCorrect: !!a.isCorrect,
                        OrderIndex: a.orderIndex,
                    })),
                };
            });


            mappedQuestions.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
            debugger;
            setQuestions(mappedQuestions);
        }

    }, [isEdit, initialData]);

    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        if (!groupContent.trim()) {
            toast.error("Vui lòng nhập đoạn văn cần hoàn thành");
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) {
                toast.error(`Câu hỏi ${i + 1} chưa nhập nội dung`);
                return false;
            }

            const correctCount = q.answers.filter(a => a.IsCorrect).length;
            if (correctCount !== 1) {
                toast.error(`Câu hỏi ${i + 1} phải có đúng 1 đáp án đúng`);
                return false;
            }
        }

        return true;
    };

    const updateQuestionField = (questionIndex: number, field: keyof Part6Question, value: any) => {
        const updatedQuestions = [...questions];
        (updatedQuestions[questionIndex] as any)[field] = value;
        setQuestions(updatedQuestions);
    }

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("Id", initialData?.data?.id || "");
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("GroupContent", groupContent || "");

            questions.forEach((q, qIndex) => {
                
                if (q.id) {
                    formData.append(`Questions[${qIndex}].Id`, q.id)
                }
                formData.append(`Questions[${qIndex}].Explanation`, q.explanation);
                formData.append(`Questions[${qIndex}].Content`, q.content);
                formData.append(`Questions[${qIndex}].QuestionType`, "SingleChoice");
                formData.append(`Questions[${qIndex}].DefaultScore`, "5"); // Sửa thành 5 cho chuẩn TOEIC
                formData.append(`Questions[${qIndex}].ShuffleAnswers`, "false");

                // Answers nested
                q.answers.forEach((a, aIndex) => {
                    if (a.id) {
                        formData.append(`Questions[${qIndex}].Answers[${aIndex}].Id`, a.id);
                    }
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].Content`, a.Content);
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].IsCorrect`, a.IsCorrect.toString());
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].OrderIndex`, a.OrderIndex.toString());
                });

                // Tags
                const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
                tagArray.forEach((tag, index) => {
                    formData.append(`Questions[${qIndex}].Tags[${index}]`, tag);
                });
            });



            await onSave({
                mode: "group",
                payload: formData,
            });
        } catch (err: any) {
            toast.error(err?.message || "Lỗi khi lưu Part 6");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className="fa-solid fa-file-lines"></i> TOEIC Part 6 – Text Completion
                </h3>
                <p className="editor-hint">
                    📋 1 đoạn văn với 4 chỗ trống + 4 câu hỏi, mỗi câu 4 đáp án
                </p>
            </div>

            <div className="editor-body">
                {/* CATEGORY & DIFFICULTY */}
                <BaseQuestionForm
                    categoryId={categoryId}
                    difficultyId={difficultyId}
                    categories={categories}
                    difficulties={difficulties}
                    onCategoryChange={setCategoryId}
                    onDifficultyChange={setDifficultyId}
                    onContentChange={setContent}
                    shuffle={shuffle}
                    onShuffleChange={setShuffle}
                    explanation={explanation}
                    tags={tags}
                    onTagsChange={setTags}
                    showContent={true}
                />

                {/* PASSAGE */}
                <div className="form-group">
                    <label>
                        Đoạn văn <span className="required">*</span>
                    </label>
                    <div className="editor-hint-box">
                        💡 Tip: Đánh dấu chỗ trống bằng <strong>[1]</strong>, <strong>[2]</strong>, <strong>[3]</strong>, <strong>[4]</strong>
                    </div>
                    <div className="tiptap-editor-wrapper">
                        <RichTextEditor
                            value={groupContent}
                            onChange={setGroupContent}
                        />
                    </div>
                </div>

                {/* TAGS */}
                <div className="form-group">
                    <label>Tags</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="toeic, part6, reading"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                {/* QUESTIONS LOOP */}
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="group__question__child card mb-4 p-3 border">
                        {/* Header: Tiêu đề + Nội dung câu hỏi + Giải thích */}
                        <div className="question__child__header mb-3">
                            <h5 className="question__child__title mb-3">
                                <i className="fa-solid fa-circle-question"></i> Question {qIdx + 1} / Gap [{qIdx + 1}]
                            </h5>

                            <div className="row">
                                <div className="col-md-7">
                                    <label className="form-label fw-bold">Nội dung câu hỏi</label>
                                    <RichTextEditor
                                        value={q.content}
                                        onChange={(newContent) => updateQuestionField(qIdx, 'content', newContent)}
                                        maxHeight="200px"
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label fw-bold">Giải thích (tùy chọn)</label>
                                    <div className="tiptap-editor-wrapper">
                                        <RichTextEditor
                                            value={q.explanation}
                                            onChange={(newContent) => updateQuestionField(qIdx, 'explanation', newContent)}
                                            maxHeight="200px"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Đáp án - Đặt ra ngoài div header */}
                        <div className="question__child__answers">
                            <label className="form-label fw-bold">Đáp án</label>
                            <table className="answer-table table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '60px' }}>#</th>
                                        <th>Nội dung đáp án</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Đúng</th>
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
                                            onChange={(updated: any) => {
                                                const next = [...questions];
                                                next[qIdx].answers[aIdx] = updated;
                                                setQuestions(next);
                                            }}
                                            onSelect={() => {
                                                const next = [...questions];
                                                next[qIdx].answers = q.answers.map((x, i) => ({
                                                    ...x,
                                                    IsCorrect: i === aIdx,
                                                }));
                                                setQuestions(next);
                                            }}
                                            canRemove={false}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="editor-footer">
                <button className="btn btn-default" onClick={onCancel} disabled={saving}>
                    Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <i className="fa-solid fa-save"></i> {isEdit ? 'Cập nhật' : 'Lưu câu hỏi'}
                </button>
            </div>
        </div>
    );
};

export default ToeicPart6Editor;