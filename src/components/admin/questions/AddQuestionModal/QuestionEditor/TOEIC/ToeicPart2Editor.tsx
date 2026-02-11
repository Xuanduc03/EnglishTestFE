// editors/toeic/ToeicPart2Editor.tsx

import React, { useEffect, useRef, useState } from "react";
import type { EditorProps } from "../editor.type";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import AnswerRow from "../../AnswerRow/AnswerRow";
import { toast } from "react-toastify";

export const ToeicPart2Editor: React.FC<EditorProps> = ({ categories = [],
    difficulties = [],
    onSave,
    onCancel, initialData, isEdit }) => {
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [content, setContent] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [explanation, setExplanation] = useState("");
    const [tags, setTags] = useState("toeic,part2,listening");

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState("");
    const audioInputRef = useRef<HTMLInputElement | null>(null);

    // Part 2 có 3 đáp án
    const [answers, setAnswers] = useState([
        { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
        { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
        { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
    ]);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData && isEdit && initialData.mode === 'single') {
            console.log('📝 Part2 Editor loading data:', initialData.data);

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

            if (data.media && data.media.length > 0) {
                console.log('📎 Existing media:', data.media);
            }
        }
    }, [initialData, isEdit]);

    const validate = (): string | null => {
        if (!audioFile && !audioUrl) {
            return ("Part 2 yêu cầu có Audio");
        }

        const correctCount = answers.filter((a) => a.IsCorrect).length;
        if (correctCount !== 1) {
            return ("Phải có đúng 1 đáp án đúng");
        }

        const emptyAnswers = answers.filter((a) => !a.Content.trim());
        if (emptyAnswers.length > 0) {
            return ("Có đáp án chưa nhập nội dung");
        }
        return null;
    }

    // --- Submit ---
    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            
            // 1. Basic Info
            formData.append("Id", initialData?.data?.id || ""); // ✅ Quan trọng cho Update
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("Content", content || "Listen to the question"); // Part 2 thường ko có text câu hỏi
            formData.append("QuestionType", "SingleChoice");
            formData.append("DefaultScore", "1");
            formData.append("ShuffleAnswers", String(shuffle));
            formData.append("IsActive", "true");
            formData.append("Explanation", explanation || "");

            // 2. Tags
            if (tags) {
                tags.split(",").forEach((tag, idx) => {
                    formData.append(`Tags[${idx}]`, tag.trim());
                });
            }

            // 3. Audio File
            if (audioFile) {
                formData.append("AudioFile", audioFile, audioFile.name);
            }

            // 4. Answers
            answers.forEach((a, idx) => {
                formData.append(`Answers[${idx}].Content`, a.Content);
                formData.append(`Answers[${idx}].IsCorrect`, String(a.IsCorrect)); 
                formData.append(`Answers[${idx}].OrderIndex`, String(a.OrderIndex));
            });

            await onSave({
                mode: "single",
                payload: formData,
            });

            // toast.success xử lý ở parent hoặc service rồi
        } catch (err: any) {
            toast.error("Lỗi: " + (err?.message || "Không xác định"));
        } finally {
            setSaving(false);
        }
    };

    const selectCorrectAnswer = (index: number) => {
        setAnswers(prev =>
            prev.map((a, i) => ({
                ...a,
                IsCorrect: i === index,
            }))
        );
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className="fa-solid fa-comment"></i> TOEIC Part 2 - Question-Response
                </h3>
                <div className="editor-hint">
                    📋 Yêu cầu: 1 audio câu hỏi + 3 đáp án (KHÔNG có audio cho từng đáp án)
                </div>
            </div>

            <div className="editor-body">
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
                    onExplanationChange={setExplanation}
                    tags={tags}
                    onTagsChange={setTags}
                    showContent={false}
                />

                <div className="form-group">
                    <label className="form-label">
                        Question Audio <span className="required">*</span>
                    </label>
                    <div className="file-upload-box">
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={() => audioInputRef.current?.click()}
                        >
                            <i className="fa-solid fa-music"></i> Chọn Audio
                        </button>
                        <input
                            ref={audioInputRef}
                            type="file"
                            accept="audio/*"
                            hidden
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        />
                        {audioFile && <span className="file-name">✓ {audioFile.name}</span>}

                        {/* ✅ Show existing media */}
                        {isEdit && !audioFile && initialData?.mode === 'single' && initialData.data.media?.find(m => m.type === 'audio') && (
                            <div className="existing-media">
                                <audio controls src={initialData.data.media.find(m => m.type === 'audio')?.url} />
                                <small>Audio hiện tại (upload mới để thay đổi)</small>
                            </div>
                        )}
                        <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Hoặc dán Audio URL"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Answers (3 đáp án) <span className="required">*</span>
                    </label>
                    <table className="answer-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>STT</th>
                                <th>Nội dung</th>
                                <th style={{ width: 100 }}>Đúng</th>
                                <th style={{ width: 80 }}>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {answers.map((answer, idx) => (
                                <AnswerRow
                                    key={idx}
                                    index={idx}
                                    answer={answer}
                                    questionIndex={0}
                                    isSelected={answer.IsCorrect}
                                    onSelect={() => selectCorrectAnswer(idx)}
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
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                    <i className="fa-solid fa-save"></i> {isEdit ? 'Cập nhật' : 'Lưu câu hỏi'}

                </button>
            </div>
        </div>
    );
};