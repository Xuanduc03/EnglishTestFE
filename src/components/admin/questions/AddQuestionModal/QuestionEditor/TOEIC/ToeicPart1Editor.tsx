// editors/toeic/ToeicPart1Editor.tsx

import React, { useEffect, useState } from "react";
import AnswerRow from "../../AnswerRow/AnswerRow";
import type { EditorProps } from "../editor.type";
import type { CreateAnswerWithFileDto } from "../../../components/Quesion.config";
import { toast } from "react-toastify";
import '../TOEIC/style/ToeicEditor.scss';
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";

export const ToeicPart1Editor: React.FC<EditorProps> = ({
    categories = [],
    difficulties = [],
    onSave,
    onCancel,
    initialData,
    isEdit }) => {


    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [explanation, setExplanation] = useState("");
    const [tags, setTags] = useState("toeic,part1,grammar");
    const [shuffle, setShuffle] = useState(false);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>();
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>();
    const [content, setContent] = useState("");
    const [answers, setAnswers] = useState<CreateAnswerWithFileDto[]>([
        { Content: "(A) ", IsCorrect: false, OrderIndex: 1 },
        { Content: "(B) ", IsCorrect: false, OrderIndex: 2 },
        { Content: "(C) ", IsCorrect: false, OrderIndex: 3 },
        { Content: "(D) ", IsCorrect: false, OrderIndex: 4 },
    ]);

    useEffect(() => {
        if (initialData && isEdit && initialData.mode === 'single') {
            const data = initialData.data;
            console.log('📥 Loading Data Part 1:', data);

            // 1. Map các trường cơ bản
            setCategoryId(data.categoryId || "");
            setDifficultyId(data.difficultyId || "");
            setContent(data.content || "");
            setExplanation(data.explanation || "");
            setShuffle(data.shuffleAnswers || false);

            // 2. Xử lý Media (Quan trọng: Check cả 'mediaType' và 'type')
            if (Array.isArray(data.media)) {
                const audioMedia = data.media.find((m: any) =>
                    (m.mediaType && m.mediaType.toLowerCase() === 'audio') ||
                    (m.type && m.type.toLowerCase() === 'audio')
                );
                if (audioMedia) {
                    setExistingAudioUrl(audioMedia.url);
                }

                // Tìm file Image
                const imageMedia = data.media.find((m: any) =>
                    (m.mediaType && m.mediaType.toLowerCase() === 'image') ||
                    (m.type && m.type.toLowerCase() === 'image')
                );
                if (imageMedia) {
                    setExistingImageUrl(imageMedia.url);
                }
            }

            // 3. Xử lý Answers
            if (Array.isArray(data.answers) && data.answers.length > 0) {
                const mappedAnswers = data.answers.map((a: any) => ({
                    // Strip HTML tag nếu có
                    Content: a.content ? a.content.replace(/<[^>]+>/g, '').trim() : "",
                    IsCorrect: a.isCorrect,
                    OrderIndex: a.orderIndex || 0,
                }));
                mappedAnswers.sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);
                setAnswers(mappedAnswers);
            }
        }
    }, [initialData, isEdit]);

    const validate = (): string | null => {
        if (!categoryId || !difficultyId) {
            return "Vui lòng chọn danh mục và độ khó";
        }
        const hasAudio = audioFile || existingAudioUrl;
        if (!hasAudio) return "Câu hỏi Part 1 bắt buộc phải có Audio";

        const hasImage = imageFile || existingImageUrl;
        if (!hasImage) return "Câu hỏi Part 1 bắt buộc phải có Hình ảnh";

        const correctCount = answers.filter(a => a.IsCorrect).length;
        if (correctCount !== 1) return "Phải chọn chính xác 1 đáp án đúng";

        return null;
    };


    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        const formData = new FormData();
        formData.append("Id", initialData?.data?.id || "");
        formData.append("CategoryId", categoryId);
        formData.append("DifficultyId", difficultyId);

        const defaultContent = "Look at the picture and listen to the sentences.";
        const cleanContent = content?.replace(/<p><\/p>/g, "").trim();

        formData.append("Content", cleanContent || defaultContent);
        formData.append("QuestionType", "SingleChoice");
        formData.append("ShuffleAnswers", String(shuffle));
        formData.append("Explanation", explanation || "");
        formData.append("IsActive", "true");

        if (tags) {
            tags.split(",").forEach((tag, idx) => {
                formData.append(`Tags[${idx}]`, tag.trim());
            });
        }
        // 3. Xử lý Files (Quan trọng)
        if (audioFile) {
            formData.append("AudioFile", audioFile);
        }
        if (imageFile) {
            formData.append("ImageFile", imageFile);
        }

        answers.forEach((ans, index) => {
            formData.append(`Answers[${index}].Content`, ans.Content);
            formData.append(`Answers[${index}].IsCorrect`, String(ans.IsCorrect));
            formData.append(`Answers[${index}].OrderIndex`, String(ans.OrderIndex));
        });

        console.log("📦 FORM DATA SENT:");
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
        await onSave({ mode: "single", payload: formData });
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
                    <i className="fa-solid fa-image"></i> TOEIC Part 1 - Photos
                </h3>
                <p className="editor-hint">
                    📋 Yêu cầu: 1 ảnh + 1 audio + 4 đáp án (mỗi đáp án có audio riêng)
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
                    explanation={explanation}
                    onExplanationChange={setExplanation}
                    shuffle={shuffle}
                    onShuffleChange={setShuffle}
                    tags={tags}
                    onTagsChange={setTags}
                />
                {/* Audio Upload */}
                <div className="form-group">
                    <label className="required-label">Question Audio (Bắt buộc)</label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    />

                    {/* Logic hiển thị: Nếu chưa chọn file mới VÀ có link file cũ thì hiện file cũ */}
                    {!audioFile && existingAudioUrl && (
                        <div className="existing-media" style={{ marginTop: 5, padding: 5, background: '#f5f5f5', borderRadius: 4 }}>
                            <audio controls src={existingAudioUrl} style={{ width: '100%', height: 40 }} />
                            <small style={{ color: 'green' }}>✓ Audio hiện tại đang dùng</small>
                        </div>
                    )}

                    {audioFile && <span className="file-name" style={{ color: 'blue' }}>➤ File mới: {audioFile.name}</span>}
                </div>

                {/* Image Upload */}
                <div className="form-group">
                    <label className="required-label">Question Image (Bắt buộc)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />

                    {/* Logic hiển thị Preview thông minh */}
                    <div className="media-preview mt-2">
                        {imageFile ? (
                            <img src={URL.createObjectURL(imageFile)} alt="preview" style={{ maxWidth: 200, border: '2px solid blue' }} />
                        ) : existingImageUrl ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={existingImageUrl} alt="current" style={{ maxWidth: 200, opacity: 0.9 }} />
                                <span style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 5px', fontSize: 11 }}>Ảnh hiện tại</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Answers */}
                <div className="form-group">
                    <label>Answers (4 đáp án, mỗi đáp án có audio)</label>
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
                            canRemove={false} // TOEIC Part 1 KHÔNG cho xóa
                        />
                    ))}
                </div>
            </div>

            <div className="bottom-action-bar">
                <div className="action-bar-content">
                    <div className="action-info">
                        <i className="fa-solid fa-info-circle"></i>
                        <span>Đã điền {audioFile && imageFile ? '2/2' : audioFile || imageFile ? '1/2' : '0/2'} file bắt buộc</span>
                    </div>
                    <div className="action-buttons">
                        <button className="btn btn-text" onClick={onCancel}>
                            Hủy
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <i className="fa-solid fa-save"></i> {isEdit ? 'Cập nhật' : 'Lưu câu hỏi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};