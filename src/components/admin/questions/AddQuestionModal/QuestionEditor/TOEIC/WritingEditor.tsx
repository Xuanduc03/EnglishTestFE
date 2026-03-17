// editors/toeic/WritingEditor.tsx
import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { toast } from "react-toastify";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import MediaFileInput from "../Shared/MediaFileInput";
import type { EditorProps } from "../editor.type";

const { Option } = Select;

const PROMPT_TYPES = [
    { value: "6", label: "TOEIC - Viết câu theo tranh (Part 1)" },
    { value: "7", label: "TOEIC - Trả lời email (Part 2)" },
    { value: "8", label: "TOEIC - Viết đoạn văn (Part 3)" },
    { value: "1", label: "IELTS - Writing Task 1 (Graph/Letter)" },
    { value: "2", label: "IELTS - Writing Task 2 (Essay)" },
];

const DEFAULT_CONFIG: Record<string, { minWords: number; maxWords: number; timeLimitSeconds: number }> = {
    "6": { minWords: 10, maxWords: 50, timeLimitSeconds: 480 },
    "7": { minWords: 100, maxWords: 200, timeLimitSeconds: 900 },
    "8": { minWords: 150, maxWords: 300, timeLimitSeconds: 1200 },
    "1": { minWords: 150, maxWords: 250, timeLimitSeconds: 1200 },
    "2": { minWords: 250, maxWords: 400, timeLimitSeconds: 2400 },
};

const buildRubric = (keywords: string[], sampleAnswers: string[]) => {
    const validKeywords = keywords.filter(Boolean);
    const validSamples = sampleAnswers.filter(Boolean);
    const rubric: any = {
        criteria: {
            grammar: "Ngữ pháp câu đúng và tự nhiên",
            relevance: "Nội dung liên quan đến ảnh/đề bài",
            vocabulary: "Vốn từ vựng phù hợp",
            naturalness: "Câu văn tự nhiên, đúng văn phong",
        },
        scale: "0-10",
    };
    if (validKeywords.length > 0) {
        rubric.criteria.keyword_usage = `Bắt buộc sử dụng cả ${validKeywords.length} từ: ${validKeywords.join(", ")}`;
        rubric.required_keywords = validKeywords;
    }
    if (validSamples.length > 0) {
        rubric.sample_answers = validSamples;
        rubric.grading_note = "Chấm dựa trên sự tương đồng về ý nghĩa và cấu trúc với các đáp án mẫu";
    }
    return JSON.stringify(rubric, null, 2);
};

export const WritingEditor: React.FC<EditorProps> = ({
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
    const [tags, setTags] = useState("writing,toeic");
    const [shuffle, setShuffle] = useState(false);
    const [promptType, setPromptType] = useState("6");
    const [minWords, setMinWords] = useState(10);
    const [maxWords, setMaxWords] = useState(50);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(480);
    const [isAiGraded, setIsAiGraded] = useState(true);
    const [keywords, setKeywords] = useState<string[]>(["", ""]);
    const [sampleAnswers, setSampleAnswers] = useState<string[]>(["", "", ""]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    // Preset category khi chọn từ sidebar
    useEffect(() => {
        if (!isEdit && presetCategoryId) setCategoryId(presetCategoryId);
    }, [presetCategoryId, isEdit]);

    // Load khi edit
    useEffect(() => {
        if (!isEdit || !initialData?.data) return;
        const d = initialData.data;
        setCategoryId(d.categoryId || "");
        setDifficultyId(d.difficultyId || "");
        setContent(d.content || "");
        setExplanation(d.explanation || "");
        setShuffle(d.shuffleAnswers || false);
        setMinWords(d.minWords || 10);
        setMaxWords(d.maxWords || 50);
        setMinWords(d.minWords || 10);
        setMaxWords(d.maxWords || 50);
        setTimeLimitSeconds(d.timeLimitSeconds || 480);
        setIsAiGraded(d.isAiGraded ?? true);
        if (d.promptTypes) setPromptType(String(d.promptTypes)); // "6", "7"...

        if (d.rubricJson) {
            try {
                const rubric = JSON.parse(d.rubricJson);
                if (Array.isArray(rubric.required_keywords)) setKeywords(rubric.required_keywords);
                if (Array.isArray(rubric.sample_answers)) setSampleAnswers(rubric.sample_answers);
            } catch { }
        }
        setTimeLimitSeconds(d.timeLimitSeconds || 480);
        setIsAiGraded(d.isAiGraded ?? true);
        if (d.promptTypes) setPromptType(String(d.promptTypes));

        // Parse rubric để restore keywords + sampleAnswers
        if (d.rubricJson) {
            try {
                const rubric = JSON.parse(d.rubricJson);
                if (Array.isArray(rubric.required_keywords)) setKeywords(rubric.required_keywords);
                if (Array.isArray(rubric.sample_answers)) setSampleAnswers(rubric.sample_answers);
            } catch { /* ignore */ }
        }

        if (Array.isArray(d.media)) {
            const img = d.media.find((m: any) =>
                m.mediaType?.toLowerCase() === "image" || m.type?.toLowerCase() === "image"
            );
            if (img) setExistingImageUrl(img.url ?? null);
        }
    }, [isEdit, initialData]);

    const handlePromptTypeChange = (val: string) => {
        setPromptType(val);
        const cfg = DEFAULT_CONFIG[val];
        if (cfg) {
            setMinWords(cfg.minWords);
            setMaxWords(cfg.maxWords);
            setTimeLimitSeconds(cfg.timeLimitSeconds);
        }
    };

    const isToeicPart1 = promptType === "6";

    const validate = (): string | null => {
        if (!categoryId) return "Vui lòng chọn danh mục";
        if (!difficultyId) return "Vui lòng chọn độ khó";
        if (!content?.trim()) return "Nội dung đề bài không được để trống";
        if (isToeicPart1 && !imageFile && !existingImageUrl)
            return "TOEIC Writing Part 1 bắt buộc phải có hình ảnh";
        if (isToeicPart1 && keywords.filter(Boolean).length < 2)
            return "Phải nhập đủ 2 từ gợi ý bắt buộc";
        if (sampleAnswers.filter(Boolean).length < 1)
            return "Phải có ít nhất 1 đáp án mẫu";
        if (minWords >= maxWords) return "Số từ tối thiểu phải nhỏ hơn tối đa";
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { toast.error(err); return; }

        const formData = new FormData();
        formData.append("Id", initialData?.data?.id || "");
        formData.append("CategoryId", categoryId);
        formData.append("DifficultyId", difficultyId);
        formData.append("Content", content);
        formData.append("QuestionType", "Writing");
        formData.append("PromptType", promptType);
        formData.append("ShuffleAnswers", "false");
        formData.append("Explanation", explanation || "");
        formData.append("IsActive", "true");
        formData.append("IsAiGraded", String(isAiGraded));
        formData.append("MinWords", String(minWords));
        formData.append("MaxWords", String(maxWords));
        formData.append("TimeLimitSeconds", String(timeLimitSeconds));
        formData.append("RubricJson", buildRubric(keywords, sampleAnswers));
        formData.append("MetadataJson", JSON.stringify({
            keywords: keywords.filter(Boolean),
            allSampleAnswers: sampleAnswers.filter(Boolean),
        }));

        const validSamples = sampleAnswers.filter(Boolean);
        if (validSamples.length > 0)
            formData.append("SampleAnswer", validSamples[0]);

        if (tags) tags.split(",").forEach((t, i) => formData.append(`Tags[${i}]`, t.trim()));

        if (imageFile) formData.append("ImageFile", imageFile);
        else if (existingImageUrl) formData.append("ImageUrl", existingImageUrl);

        await onSave({ mode: "single", payload: formData });
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>✍️ Writing Question Editor</h3>
                <p className="editor-hint">
                    📋 AI chấm dựa trên đáp án mẫu — không hiển thị đáp án cho học viên khi làm bài
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

                {/* Prompt Type */}
                <div className="form-group">
                    <label className="form-label">
                        Loại Writing <span className="required">*</span>
                    </label>
                    <Select value={promptType} onChange={handlePromptTypeChange} style={{ width: "100%" }}>
                        {PROMPT_TYPES.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                    </Select>
                </div>

                {/* Image */}
                <MediaFileInput
                    label={isToeicPart1 ? "Hình ảnh đề bài (bắt buộc)" : "Hình ảnh đề bài (tùy chọn)"}
                    required={isToeicPart1}
                    accept="image/*"
                    existingUrl={existingImageUrl}
                    file={imageFile}
                    setFile={setImageFile}
                />

                {/* Keywords - chỉ Part 1 */}
                {isToeicPart1 && (
                    <div className="form-group">
                        <label className="form-label">
                            Từ gợi ý bắt buộc <span className="required">*</span>
                        </label>
                        <small style={{ color: "#888", display: "block", marginBottom: 8 }}>
                            Học viên bắt buộc dùng cả 2 từ này trong câu trả lời
                        </small>
                        <div style={{ display: "flex", gap: 8 }}>
                            {keywords.map((kw, i) => (
                                <input
                                    key={i}
                                    className="form-control"
                                    style={{ flex: 1 }}
                                    placeholder={`Từ ${i + 1} (VD: ${i === 0 ? "guard" : "apart"})`}
                                    value={kw}
                                    onChange={(e) => {
                                        const next = [...keywords];
                                        next[i] = e.target.value;
                                        setKeywords(next);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sample Answers */}
                <div className="form-group">
                    <label className="form-label">
                        Đáp án mẫu <span className="required">*</span>
                    </label>
                    <small style={{ color: "#888", display: "block", marginBottom: 8 }}>
                        AI chấm dựa trên các đáp án này — <strong>không hiển thị</strong> cho học viên khi làm bài
                    </small>
                    {sampleAnswers.map((sa, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                            <span style={{
                                minWidth: 26, height: 26, borderRadius: "50%",
                                background: "#6366f1", color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 600, flexShrink: 0,
                            }}>
                                {i + 1}
                            </span>
                            <input
                                className="form-control"
                                placeholder={`Đáp án mẫu ${i + 1}...`}
                                value={sa}
                                onChange={(e) => {
                                    const next = [...sampleAnswers];
                                    next[i] = e.target.value;
                                    setSampleAnswers(next);
                                }}
                            />
                            {sampleAnswers.length > 1 && (
                                <button
                                    className="btn btn-text"
                                    style={{ color: "#ff4d4f", padding: "0 8px", flexShrink: 0 }}
                                    onClick={() => setSampleAnswers(prev => prev.filter((_, idx) => idx !== i))}
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            )}
                        </div>
                    ))}
                    {sampleAnswers.length < 5 && (
                        <button
                            className="btn btn-text"
                            style={{ fontSize: 13, color: "#6366f1" }}
                            onClick={() => setSampleAnswers(prev => [...prev, ""])}
                        >
                            <i className="fa-solid fa-plus" /> Thêm đáp án mẫu
                        </button>
                    )}
                </div>

                {/* Word limit + Time */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Số từ tối thiểu</label>
                        <input className="form-control" type="number" min={0}
                            value={minWords} onChange={e => setMinWords(Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số từ tối đa</label>
                        <input className="form-control" type="number" min={1}
                            value={maxWords} onChange={e => setMaxWords(Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Thời gian (giây)</label>
                        <input className="form-control" type="number" min={60}
                            value={timeLimitSeconds} onChange={e => setTimeLimitSeconds(Number(e.target.value))} />
                        <small style={{ color: "#888" }}>= {Math.round(timeLimitSeconds / 60)} phút</small>
                    </div>
                </div>

                {/* AI toggle */}
                <div className="form-group">
                    <label className="form-label">AI Chấm điểm</label>
                    <Select value={isAiGraded ? "true" : "false"}
                        onChange={v => setIsAiGraded(v === "true")} style={{ width: "100%" }}>
                        <Option value="true"> Bật AI chấm tự động</Option>
                        <Option value="false"> Tắt (chấm thủ công)</Option>
                    </Select>
                </div>
            </div>

            <div className="bottom-action-bar">
                <div className="action-bar-content">
                    <div className="action-info">
                        <i className="fa-solid fa-robot" />
                        <span>
                            {isAiGraded ? "AI chấm tự động" : "Chấm thủ công"}
                            {isToeicPart1 && keywords.filter(Boolean).length > 0 &&
                                ` · Từ bắt buộc: ${keywords.filter(Boolean).join(", ")}`}
                            {` · ${sampleAnswers.filter(Boolean).length} đáp án mẫu`}
                            {` · ${Math.round(timeLimitSeconds / 60)} phút`}
                        </span>
                    </div>
                    <div className="action-buttons">
                        <button className="btn btn-text" onClick={onCancel}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <i className="fa-solid fa-save" />{" "}
                            {isEdit ? "Cập nhật" : "Lưu câu hỏi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};