// editors/toeic/ToeicPart5Editor.tsx

import React, { useEffect, useState } from "react";
import type { EditorProps } from "../editor.type";
import AnswerRow from "../../AnswerRow/AnswerRow";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import { toast } from "react-toastify";

type AnswerDto = {
    Content: string;
    IsCorrect: boolean;
    OrderIndex: number;
};

export const ToeicPart5Editor: React.FC<EditorProps> = ({ categories = [], difficulties = [], onSave, onCancel, initialData, isEdit }) => {
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [content, setContent] = useState("");
    const [explanation, setExplanation] = useState("");
    const [tags, setTags] = useState("toeic,part5,grammar");
    const [shuffle, setShuffle] = useState(false);
    const [saving, setSaving] = useState(false);

    const [answers, setAnswers] = useState<AnswerDto[]>([
        { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
        { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
        { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
        { Content: "(D) ", IsCorrect: false, OrderIndex: 4 },
    ]);

    useEffect(() => {
        if (initialData && isEdit && initialData.mode === 'single') {
            console.log('📝 Part5 Editor loading data:', initialData.data);

            const data = initialData.data;

            setCategoryId(data.categoryId || "");
            setDifficultyId(data.difficultyId || "");
            setContent(data.content || "");
            setExplanation(data.explanation || "");
            setShuffle(data.shuffleAnswers || false);

            // Load answers
            if (data.answers && data.answers.length > 0) {
                setAnswers(data.answers.map(a => ({
                    Content: a.content,
                    IsCorrect: a.isCorrect,
                    OrderIndex: a.orderIndex || 0,
                })));
            }
        }
    }, [initialData, isEdit]);


    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        if (!content.trim()) {
            toast.error("Vui lòng nhập nội dung câu hỏi");
            return false;
        }

        const correctCount = answers.filter(a => a.IsCorrect).length;
        if (correctCount !== 1) {
            toast.error("Phải có đúng 1 đáp án đúng");
            return false;
        }

        if (answers.some(a => !a.Content.trim())) {
            toast.error("Có đáp án chưa nhập nội dung");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("QuestionType", "SingleChoice");
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("Content", content);
            formData.append("DefaultScore", "1");
            formData.append("ShuffleAnswers", String(shuffle));
            formData.append("Explanation", explanation || "");
            formData.append("IsActive", "true");
            formData.append("IsPublic", "true");

            answers.forEach((a, idx) => {
                formData.append(`answers[${idx}].content`, a.Content);
                formData.append(`answers[${idx}].isCorrect`, String(a.IsCorrect));
                formData.append(`answers[${idx}].orderIndex`, String(idx));
                formData.append(`answers[${idx}].feedback`, "");
            });


            const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
            formData.append("TagsJson", JSON.stringify(tagArray));

            await onSave({
                mode: "single",
                payload: formData,
            });
        } catch (err: any) {
            console.error(err?.message || "Lỗi khi lưu Part 5");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className="fa-solid fa-pen"></i> TOEIC Part 5 – Incomplete Sentences
                </h3>
                <p className="editor-hint">
                    📋 1 câu có chỗ trống + 4 đáp án (Grammar / Vocabulary)
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
                    content={content}
                    onContentChange={setContent}
                    shuffle={shuffle}
                    onShuffleChange={setShuffle}
                    explanation={explanation}
                    onExplanationChange={setExplanation}
                    tags={tags}
                    onTagsChange={setTags}
                />

                <div className="form-group">
                    <label>
                        Answers (4 đáp án) <span className="required">*</span>
                    </label>

                    <table className="answer-table">
                        <tbody>
                            {answers.map((a, idx) => (
                                <AnswerRow
                                    key={idx}
                                    index={idx}
                                    answer={a}
                                    questionIndex={0}
                                    isSelected={a.IsCorrect}
                                    onSelect={() =>
                                        setAnswers(answers.map((x, i) => ({
                                            ...x,
                                            IsCorrect: i === idx,
                                        })))
                                    }
                                    onChange={(updated) => {
                                        const next = [...answers];
                                        next[idx] = updated;
                                        setAnswers(next);
                                    }}
                                    canRemove={false}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
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
