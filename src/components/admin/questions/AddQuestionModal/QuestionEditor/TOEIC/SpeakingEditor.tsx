// editors/toeic/SpeakingEditor.tsx
import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { toast } from "react-toastify";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import MediaFileInput from "../Shared/MediaFileInput";
import type { EditorProps } from "../editor.type";

const { Option } = Select;

const SPEAKING_PROMPT_TYPES = [
    { value: "3", label: "IELTS Speaking Part 1 - Short answers" },
    { value: "4", label: "IELTS Speaking Part 2 - Cue card" },
    { value: "5", label: "IELTS Speaking Part 3 - Discussion" },
];

const DEFAULT_SPEAKING_RUBRIC = JSON.stringify({
    criteria: {
        fluency: "Độ trôi chảy và tự nhiên của lời nói",
        pronunciation: "Phát âm rõ ràng và chính xác",
        vocabulary: "Vốn từ vựng đa dạng và phù hợp",
        grammar: "Sử dụng ngữ pháp đa dạng và chính xác"
    },
    scale: "0-10"
}, null, 2);

export const SpeakingEditor: React.FC<EditorProps> = ({
    categories = [],
    difficulties = [],
    onSave,
    onCancel,
    initialData,
    isEdit,
    presetCategoryId,
}) => {
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [content, setContent] = useState("");
    const [explanation, setExplanation] = useState("");
    const [tags, setTags] = useState("speaking,ielts");
    const [shuffle, setShuffle] = useState(false);

    // Speaking-specific
    const [promptType, setPromptType] = useState("3");
    const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(120); // 2 phút
    const [prepTimeSeconds, setPrepTimeSeconds] = useState<number>(60);    // 1 phút chuẩn bị
    const [isAiGraded, setIsAiGraded] = useState(true);
    const [rubricJson, setRubricJson] = useState(DEFAULT_SPEAKING_RUBRIC);
    const [sampleAnswer, setSampleAnswer] = useState("");

    // Audio prompt (câu hỏi dạng audio)
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);

    // Image (Speaking Part 2 - Cue card có thể có ảnh)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    useEffect(() => {
        // Luồng 1: Tạo mới — ưu tiên presetCategoryId từ sidebar
        if (!isEdit && presetCategoryId) {
            setCategoryId(presetCategoryId);
        }

        // Luồng 2: Edit mode — load toàn bộ dữ liệu từ initialData
        if (isEdit && initialData && initialData.mode === "single") {
            const d = initialData.data;
            setCategoryId(d.categoryId || "");
            setDifficultyId(d.difficultyId || "");
            setContent(d.content || "");
            setExplanation(d.explanation || "");
            setShuffle(d.shuffleAnswers || false);
            setTimeLimitSeconds(d.timeLimitSeconds || 120);
            setIsAiGraded(d.isAiGraded ?? true);
            setRubricJson(d.rubricJson || DEFAULT_SPEAKING_RUBRIC);
            setSampleAnswer(d.sampleAnswer || "");
            if (d.promptTypes) setPromptType(String(d.promptTypes));

            if (Array.isArray(d.media)) {
                const audio = d.media.find((m: any) =>
                    m.mediaType?.toLowerCase() === "audio" || m.type?.toLowerCase() === "audio"
                );
                if (audio) setExistingAudioUrl(audio.url ?? null);

                const img = d.media.find((m: any) =>
                    m.mediaType?.toLowerCase() === "image" || m.type?.toLowerCase() === "image"
                );
                if (img) setExistingImageUrl(img.url ?? null);
            }
        }
    }, [presetCategoryId, initialData, isEdit]);

    const validate = (): string | null => {
        if (!categoryId) return "Vui lòng chọn danh mục";
        if (!difficultyId) return "Vui lòng chọn độ khó";
        if (!content?.trim() && !audioFile && !existingAudioUrl)
            return "Câu hỏi Speaking phải có nội dung hoặc audio prompt";
        if (timeLimitSeconds < 30) return "Thời gian ghi âm tối thiểu 30 giây";
        try { JSON.parse(rubricJson); } catch { return "Rubric JSON không hợp lệ"; }
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { toast.error(err); return; }

        const formData = new FormData();
        formData.append("Id", initialData?.data?.id || "");
        formData.append("CategoryId", categoryId);
        formData.append("DifficultyId", difficultyId);
        formData.append("Content", content || "");
        formData.append("QuestionType", "Speaking"); // enum = 6
        formData.append("PromptType", promptType);
        formData.append("ShuffleAnswers", "false");
        formData.append("Explanation", explanation || "");
        formData.append("IsActive", "true");
        formData.append("IsAiGraded", String(isAiGraded));
        formData.append("TimeLimitSeconds", String(timeLimitSeconds));
        formData.append("RubricJson", rubricJson);
        formData.append("SampleAnswer", sampleAnswer || "");

        // Lưu prepTime vào MetadataJson
        formData.append("MetadataJson", JSON.stringify({ prepTimeSeconds }));

        if (tags) {
            tags.split(",").forEach((tag, idx) =>
                formData.append(`Tags[${idx}]`, tag.trim())
            );
        }

        if (audioFile) {
            formData.append("AudioFile", audioFile);
        } else if (existingAudioUrl) {
            formData.append("AudioUrl", existingAudioUrl);
        }

        if (imageFile) {
            formData.append("ImageFile", imageFile);
        } else if (existingImageUrl) {
            formData.append("ImageUrl", existingImageUrl);
        }

        await onSave({ mode: "single", payload: formData });
    };

    const hasCueCard = promptType === "4"; // Part 2 mới có cue card image

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>🎤 Speaking Question Editor</h3>
                <p className="editor-hint">
                    📋 Tạo câu hỏi Speaking — AI sẽ transcribe và chấm bài tự động
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

                {/* Speaking Part Type */}
                <div className="form-group">
                    <label className="form-label">
                        Loại Speaking <span className="required">*</span>
                    </label>
                    <Select
                        value={promptType}
                        onChange={setPromptType}
                        style={{ width: "100%" }}
                    >
                        {SPEAKING_PROMPT_TYPES.map((p) => (
                            <Option key={p.value} value={p.value}>{p.label}</Option>
                        ))}
                    </Select>
                </div>

                {/* Audio prompt (tùy chọn) */}
                <MediaFileInput
                    label="Audio câu hỏi (tùy chọn)"
                    accept="audio/*"
                    existingUrl={existingAudioUrl}
                    file={audioFile}
                    setFile={setAudioFile}
                />

                {/* Cue card image cho Part 2 */}
                {hasCueCard && (
                    <MediaFileInput
                        label="Cue Card Image (Part 2)"
                        accept="image/*"
                        existingUrl={existingImageUrl}
                        file={imageFile}
                        setFile={setImageFile}
                    />
                )}

                {/* Timing */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Thời gian chuẩn bị (giây)
                        </label>
                        <input
                            className="form-control"
                            type="number"
                            min={0}
                            value={prepTimeSeconds}
                            onChange={(e) => setPrepTimeSeconds(Number(e.target.value))}
                        />
                        <small style={{ color: "#888" }}>
                            = {Math.round(prepTimeSeconds / 60)} phút chuẩn bị trước khi ghi âm
                        </small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            Thời gian ghi âm (giây) <span className="required">*</span>
                        </label>
                        <input
                            className="form-control"
                            type="number"
                            min={30}
                            value={timeLimitSeconds}
                            onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                        />
                        <small style={{ color: "#888" }}>
                            = {Math.round(timeLimitSeconds / 60)} phút ghi âm
                        </small>
                    </div>
                </div>

                {/* AI Grading */}
                <div className="form-group">
                    <label className="form-label">AI Chấm điểm</label>
                    <Select
                        value={isAiGraded ? "true" : "false"}
                        onChange={(v) => setIsAiGraded(v === "true")}
                        style={{ width: "100%" }}
                    >
                        <Option value="true">✅ Bật AI chấm tự động (Whisper + GPT)</Option>
                        <Option value="false">❌ Tắt (chấm thủ công)</Option>
                    </Select>
                </div>

                {/* Rubric */}
                {isAiGraded && (
                    <div className="form-group">
                        <label className="form-label">Tiêu chí chấm (Rubric JSON)</label>
                        <textarea
                            className="form-control"
                            rows={8}
                            value={rubricJson}
                            onChange={(e) => setRubricJson(e.target.value)}
                            style={{ fontFamily: "monospace", fontSize: 12 }}
                        />
                        <small style={{ color: "#888" }}>
                            AI sẽ dùng Whisper để transcribe rồi GPT chấm theo tiêu chí này
                        </small>
                    </div>
                )}

                {/* Sample Answer */}
                <div className="form-group">
                    <label className="form-label">Đáp án mẫu (tùy chọn)</label>
                    <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Nhập bài nói mẫu để học viên tham khảo sau khi nộp bài..."
                        value={sampleAnswer}
                        onChange={(e) => setSampleAnswer(e.target.value)}
                    />
                </div>
            </div>

            <div className="bottom-action-bar">
                <div className="action-bar-content">
                    <div className="action-info">
                        <i className="fa-solid fa-microphone"></i>
                        <span>
                            {prepTimeSeconds}s chuẩn bị
                            {" · "}{timeLimitSeconds}s ghi âm
                            {" · "}{isAiGraded ? "AI chấm tự động" : "Chấm thủ công"}
                        </span>
                    </div>
                    <div className="action-buttons">
                        <button className="btn btn-text" onClick={onCancel}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <i className="fa-solid fa-save"></i>{" "}
                            {isEdit ? "Cập nhật" : "Lưu câu hỏi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};