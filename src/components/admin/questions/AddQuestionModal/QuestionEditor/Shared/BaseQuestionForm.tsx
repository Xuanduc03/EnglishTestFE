// editors/shared/BaseQuestionForm.tsx

import React from "react";
import { Select } from "antd";
// 1. Bỏ hết các import thừa của tiptap cũ
// import { EditorContent, useEditor } from "@tiptap/react"; ...

// 2. Import component RichTextEditor chung
import RichTextEditor from "../../../../../tiptap/TiptapEditor";

const { Option } = Select;

interface Props {
    categoryId: string;
    difficultyId: string;
    categories: Array<{ id: string; name: string }>;
    difficulties: Array<{ id: string; name: string }>;
    onCategoryChange: (id: string) => void;
    onDifficultyChange: (id: string) => void;
    content?: string;
    onContentChange: (content: string) => void;
    shuffle: boolean;
    onShuffleChange: (shuffle: boolean) => void;
    explanation?: string;
    onExplanationChange?: (text: string) => void;
    tags?: string;
    onTagsChange?: (tags: string) => void;
    showContent?: boolean;
    errors?: {
        categoryId?: string;
        difficultyId?: string;
        content?: string;
    };
}

export const BaseQuestionForm: React.FC<Props> = ({
    categoryId,
    difficultyId,
    categories,
    difficulties,
    onCategoryChange,
    onDifficultyChange,
    content,
    onContentChange,
    shuffle,
    onShuffleChange,
    explanation,
    onExplanationChange,
    tags,
    onTagsChange,
    showContent = true,
    errors,
}) => {
    
    // 3. Xóa toàn bộ logic useEditor và useEffect ở đây 
    // (RichTextEditor đã tự xử lý bên trong rồi)

    return (
        <div className="base-question-form">
            {/* --- Row 1: Category & Difficulty --- */}
            <div className="form-row">
                <div className={`form-group ${errors?.categoryId ? "has-error" : ""}`}>
                    <label className="form-label">
                        Danh mục <span className="required">*</span>
                    </label>
                    <Select
                        value={categoryId}
                        onChange={onCategoryChange}
                        style={{ width: "100%" }}
                        placeholder="Chọn danh mục"
                        showSearch
                        disabled={categories.length === 0}
                        optionFilterProp="children"
                    >
                        {categories.map((c) => (
                            <Option key={c.id} value={c.id}>
                                {c.name}
                            </Option>
                        ))}
                    </Select>
                    {errors?.categoryId && (
                        <div className="form-error">{errors.categoryId}</div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Độ khó <span className="required">*</span>
                    </label>
                    <Select
                        value={difficultyId}
                        onChange={onDifficultyChange}
                        style={{ width: "100%" }}
                        placeholder="Chọn độ khó"
                    >
                        {difficulties.map((d) => (
                            <Option key={d.id} value={d.id}>
                                {d.name}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* --- Row 2: Shuffle & Tags --- */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Đảo đáp án</label>
                    <Select
                        value={shuffle ? "true" : "false"}
                        onChange={(v) => onShuffleChange(v === "true")}
                        style={{ width: "100%" }}
                    >
                        <Option value="false">Không đảo</Option>
                        <Option value="true">Có đảo</Option>
                    </Select>
                </div>

                <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input
                        className="form-control"
                        type="text"
                        placeholder="toeic, part1, listening"
                        value={tags || ""}
                        onChange={(e) => onTagsChange?.(e.target.value)}
                    />
                </div>
            </div>

            {/* --- Row 3: Content Editor --- */}
            {showContent && (
                <div className="form-group">
                    <label className="form-label">Nội dung câu hỏi</label>
                    {/* ✅ Thay thế bằng RichTextEditor */}
                    <div className="tiptap-editor-wrapper">
                        <RichTextEditor
                            value={content || ""}
                            onChange={onContentChange}
                            minHeight="60px" // Cao hơn chút để dễ nhập nội dung chính
                        />
                    </div>
                    {errors?.content && (
                         <div className="form-error">{errors.content}</div>
                    )}
                </div>
            )}

            {/* --- Row 4: Explanation Editor --- */}
            {onExplanationChange && (
                <div className="form-group">
                    <label className="form-label">Giải thích đáp án</label>
                    {/* ✅ Thay thế bằng RichTextEditor */}
                    <div className="tiptap-editor-wrapper">
                        <RichTextEditor
                            value={explanation || ""}
                            onChange={onExplanationChange}
                            minHeight="50px" // Nhỏ hơn chút cho phần giải thích
                        />
                    </div>
                </div>
            )}
        </div>
    );
};