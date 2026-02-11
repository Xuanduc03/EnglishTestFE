// editors/toeic/ToeicPart3Editor.tsx

import React, { useEffect, useRef, useState } from "react";
import type { EditorProps } from "../editor.type";
import AnswerRow from "../../AnswerRow/AnswerRow";
import { toast } from "react-toastify";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";

type Part3Question = {
    id?: string;
    content: string;
    orderIndex: number;
    answers: {
        id?: string;
        Content: string;
        IsCorrect: boolean;
        OrderIndex: number;
    }[];
};


export const ToeicPart3Editor: React.FC<EditorProps> = ({ categories = [],
    difficulties = [],
    onSave,
    onCancel, initialData, isEdit }) => {
    const audioRef = useRef<HTMLInputElement | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [explanation, setExplanation] = useState("");
    const [groupContent, setGroupContent] = useState(""); // Nội dung đoạn hội thoại (optional)
    const [transcript, setTranscript] = useState(""); // Transcript audio
    const [tags, setTags] = useState("toeic,part3,listening");

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const [questions, setQuestions] = useState<Part3Question[]>([
        createEmptyQuestion(1),
        createEmptyQuestion(2),
        createEmptyQuestion(3),
    ]);

    function createEmptyQuestion(orderIndex: number): Part3Question {
        return {
            content: "",
            orderIndex,
            answers: [
                { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
                { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
                { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
                { Content: "(D) ", IsCorrect: false, OrderIndex: 4 },
            ],
        };
    }

    // Load initial data khi edit
    useEffect(() => {
        if (!initialData || !isEdit || initialData.mode !== "group") return;

        const data = initialData.data;
        console.log("📝 Part3 Editor loading data:", data);

        setCategoryId(data.categoryId ?? "");
        setDifficultyId(data.difficultyId ?? "");
        setGroupContent(data.content ?? "");
        setExplanation(data.explanation ?? "");

        // map group.questions -> Part3Question
        if (Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions(
                data.questions.map((q: any, idx: number): Part3Question => ({
                    id: q.data?.id,
                    content: q.data?.content ?? "",
                    orderIndex: idx + 1,
                    answers: (q.data?.answers ?? []).map((a: any) => ({
                        id: a.id,
                        Content: a.content,
                        IsCorrect: !!a.isCorrect,
                        isCorrect: !!a.isCorrect,
                        OrderIndex: a.orderIndex,
                    })),
                }))
            );
        }

    }, [initialData, isEdit]);


    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        // Khi edit không bắt buộc upload lại audio
        if (!isEdit && !audioFile) {
            toast.error("TOEIC Part 3 bắt buộc có Audio hội thoại");
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

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);

        try {
            const formData = new FormData();

            // GROUP FIELDS (theo CreateQuestionGroupCommand)
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("GroupContent", groupContent || "");
            formData.append("Explanation", explanation || "");
            formData.append("Transcript", transcript || "");
            formData.append("GroupAudioFile", audioFile as File); // Đổi tên field

            // QUESTIONS JSON
            questions.forEach((q, qIndex) => {
                formData.append(`Questions[${qIndex}].Content`, q.content);
                formData.append(`Questions[${qIndex}].QuestionType`, "SingleChoice");
                formData.append(`Questions[${qIndex}].DefaultScore`, "5"); // Sửa thành 5 cho chuẩn TOEIC
                formData.append(`Questions[${qIndex}].ShuffleAnswers`, "false");

                // Answers nested
                q.answers.forEach((a, aIndex) => {
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].Content`, a.Content);
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].IsCorrect`, a.IsCorrect.toString());
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].OrderIndex`, a.OrderIndex.toString());
                    // Feedback nếu có: formData.append(`Questions[${qIndex}].Answers[${aIndex}].Feedback`, a.Feedback || "");
                });
            });

            // TAGS
            const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
            tagArray.forEach((tag, index) => {
                formData.append(`Tags[${index}]`, tag);
            });

            await onSave({
                mode: "group",
                payload: formData,
            });

        } catch (err: any) {
            console.error(err?.message || "Lỗi khi lưu Part 3");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className="fa-solid fa-comments"></i> TOEIC Part 3 – Conversations
                </h3>
                <p className="editor-hint">
                    📋 1 đoạn hội thoại (audio) + 3 câu hỏi, mỗi câu 4 đáp án
                </p>
            </div>

            <div className="editor-body">
                {/* CATEGORY & DIFFICULTY */}
                <BaseQuestionForm
                    categoryId={categoryId}
                    difficultyId={difficultyId}
                    categories={categories}
                    difficulties={difficulties}
                    explanation={explanation}
                    onExplanationChange={setExplanation}
                    onCategoryChange={setCategoryId}
                    onDifficultyChange={setDifficultyId}
                    tags={tags}
                    onTagsChange={setTags}
                    showContent={false} onContentChange={function (content: string): void {
                        throw new Error("Function not implemented.");
                    }} shuffle={false} onShuffleChange={function (shuffle: boolean): void {
                        throw new Error("Function not implemented.");
                    }}
                />


                {/* GROUP CONTENT (Optional) */}
                <div className="form-group">
                    <label>Mô tả hội thoại (tùy chọn)</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        placeholder="VD: Two colleagues discussing a project..."
                        value={groupContent}
                        onChange={(e) => setGroupContent(e.target.value)}
                    />
                </div>

                {/* AUDIO */}
                <div className="form-group">
                    <label>
                        Conversation Audio <span className="required">*</span>
                    </label>
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => audioRef.current?.click()}
                    >
                        <i className="fa-solid fa-music"></i> Chọn Audio
                    </button>
                    <input
                        ref={audioRef}
                        type="file"
                        accept="audio/*"
                        hidden
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    />
                    {audioFile && <span className="file-name">✓ {audioFile.name}</span>}

                    {isEdit && !audioFile && initialData?.mode === 'group' && initialData.data.media?.find(m => m.type === 'audio') && (
                        <div className="existing-media">
                            <audio controls src={initialData.data.media.find(m => m.type === 'audio')?.url} />
                            <small>Audio hiện tại (upload mới để thay đổi)</small>
                        </div>
                    )}
                </div>

                {/* TRANSCRIPT */}
                <div className="form-group">
                    <label>Transcript (tùy chọn)</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Man: Have you finished the report?&#10;Woman: Not yet, I need more data..."
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                    />
                </div>

                {/* TAGS */}
                <div className="form-group">
                    <label>Tags</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="toeic, part3, listening"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                {/* QUESTIONS */}
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="group-question-box">
                        <h4>Question {qIdx + 1}</h4>
                        <div className="form-input-question-group">
                            <label>Nội dung câu hỏi</label>
                            <input
                                className="form-control mb-2 input-question-content"
                                placeholder={`Nội dung câu hỏi ${qIdx + 1}`}
                                value={q.content}
                                onChange={(e) => {
                                    const next = [...questions];
                                    next[qIdx].content = e.target.value;
                                    setQuestions(next);
                                }}
                            />
                        </div>

                        <table className="answer-table">
                            <tbody>
                                {q.answers.map((a, aIdx) => (
                                    <AnswerRow
                                        key={aIdx}
                                        index={aIdx}
                                        answer={a}
                                        questionIndex={qIdx}
                                        onChange={(updated: any) => {
                                            const next = [...questions];
                                            next[qIdx].answers[aIdx] = updated;
                                            setQuestions(next);
                                        }}
                                        onSelect={() => {
                                            setQuestions(prev => {
                                                const next = [...prev];
                                                next[qIdx].answers = next[qIdx].answers.map((x, i) => ({
                                                    ...x,
                                                    IsCorrect: i === aIdx,  // Chỉ set true cho cái click
                                                }));
                                                return next;
                                            });
                                        }}
                                        canRemove={false}
                                    />
                                ))}
                            </tbody>
                        </table>
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

export default ToeicPart3Editor;