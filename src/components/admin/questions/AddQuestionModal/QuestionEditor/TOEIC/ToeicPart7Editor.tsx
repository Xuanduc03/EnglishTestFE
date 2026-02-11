// editors/toeic/ToeicPart7Editor.tsx

import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import type { EditorProps } from "../editor.type";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import { QuestionEditorBlock } from "./helper/QuestionEditorBlock";
import { toast } from "react-toastify";
import RichTextEditor from "../../../../../tiptap/TiptapEditor";

export type Part7Question = {
    id?: string;
    content: string;        // HTML
    explanation?: string;    // HTML
    orderIndex: number;
    answers: {
        id?: string;
        Content: string;
        IsCorrect: boolean;
        OrderIndex: number;
    }[];
};


export const ToeicPart7Editor: React.FC<EditorProps> = ({ categories = [],
    difficulties = [],
    onSave,
    onCancel, initialData, isEdit }) => {
    const imageRef = useRef<HTMLInputElement | null>(null);
    const [content, setContent] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [explanation, setExplanation] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [groupContent, setGroupContent] = useState(""); // Đoạn văn đọc hiểu
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [tags, setTags] = useState("toeic,part7,reading");
    const [saving, setSaving] = useState(false);


    // Editor cho passage
    const contentEditor = useEditor({
        extensions: [StarterKit, Image],
        content: groupContent || "",
        onUpdate: ({ editor }) => {
            setGroupContent(editor.getHTML());
        },
    });

    const [questionCount, setQuestionCount] = useState(3); // Số câu hỏi có thể thay đổi
    const [questions, setQuestions] = useState<Part7Question[]>([
        createEmptyQuestion(1),
        createEmptyQuestion(2),
        createEmptyQuestion(3),
    ]);

    function createEmptyQuestion(orderIndex: number): Part7Question {
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

    useEffect(() => {
        if (!initialData || !isEdit || initialData.mode !== "group") return;

        const data = initialData.data;
        console.log("Part 7 -- debug -- data:", data);

        setCategoryId(data.categoryId ?? "");
        setDifficultyId(data.difficultyId ?? "");
        setGroupContent(data.content ?? "");
        setExplanation(data.explanation ?? "");

        // Ép Tiptap hiển thị nội dung
        if (contentEditor && data.content) {
            setTimeout(() => {
                contentEditor.commands.setContent(data.content);
            }, 0);
        }

        if (Array.isArray(data.questions) && data.questions.length > 0) {
            const mappedQuestions = data.questions.map((wrapper: any, idx: number): Part7Question => {

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
            setQuestions(mappedQuestions);
        }

    }, [isEdit, initialData, contentEditor]);

    // Adjust question count
    useEffect(() => {
        // Chỉ chạy khi số lượng thực tế khác với số lượng mong muốn
        if (questionCount === questions.length) return;

        if (questionCount > questions.length) {
            const diff = questionCount - questions.length;
            const newQuestions = [...questions];
            for (let i = 0; i < diff; i++) {
                newQuestions.push(createEmptyQuestion(questions.length + i + 1));
            }
            setQuestions(newQuestions);
        } else if (questionCount < questions.length) {
            setQuestions(questions.slice(0, questionCount));
        }
    }, [questionCount]); // Dependency này ok

    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        if (!groupContent.trim()) {
            toast.error("Vui lòng nhập đoạn văn đọc hiểu");
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
            formData.append("Id", initialData?.data?.id || "");
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("GroupContent", groupContent || "");
            formData.append("ShuffleAnswers", "false");

            // ✅ FIX 4: Append Image File nếu có
            if (imageFile) {
                formData.append("ImageFile", imageFile);
            }

            questions.forEach((q, qIndex) => {
                formData.append(`Questions[${qIndex}].Content`, q.content);
                formData.append(`Questions[${qIndex}].QuestionType`, "SingleChoice");
                formData.append(`Questions[${qIndex}].DefaultScore`, "1");
                formData.append(
                    `Questions[${qIndex}].Explanation`,
                    q.explanation || ""
                );
                formData.append(`Questions[${qIndex}].ShuffleAnswers`, "false");

                // Answers nested
                q.answers.forEach((a, aIndex) => {
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].Content`, a.Content);
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].IsCorrect`, a.IsCorrect.toString());
                    formData.append(`Questions[${qIndex}].Answers[${aIndex}].OrderIndex`, a.OrderIndex.toString());
                    // Feedback nếu có: formData.append(`Questions[${qIndex}].Answers[${aIndex}].Feedback`, a.Feedback || "");
                });
            });

            // ✅ TAGS
            const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
            tagArray.forEach((tag, index) => {
                formData.append(`Tags[${index}]`, tag);
            });

            await onSave({
                mode: "group",
                payload: formData,
            });
        } catch (err: any) {
            message.error(err?.message || "Lỗi khi lưu Part 7");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>
                    <i className="fa-solid fa-newspaper"></i> TOEIC Part 7 – Reading Comprehension
                </h3>
                <p className="editor-hint">
                    📋 1 đoạn văn + 2-5 câu hỏi, mỗi câu 4 đáp án (có thể có hình ảnh)
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

                {/* IMAGE (Optional) */}
                <div className="form-group">
                    <label>Hình ảnh (Charts, Forms, Tables...)</label>
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => imageRef.current?.click()}
                    >
                        <i className="fa-solid fa-image"></i> Chọn hình ảnh
                    </button>
                    <input
                        ref={imageRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile && <span className="file-name">✓ {imageFile.name}</span>}
                </div>

                {/* QUESTION COUNT */}
                <div className="form-group">
                    <label>Số lượng câu hỏi</label>
                    <select
                        className="form-control"
                        style={{ width: "150px" }}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                    >
                        <option value={2}>2 câu hỏi</option>
                        <option value={3}>3 câu hỏi</option>
                        <option value={4}>4 câu hỏi</option>
                        <option value={5}>5 câu hỏi</option>
                    </select>
                </div>

                {/* TAGS */}
                <div className="form-group">
                    <label>Tags</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="toeic, part7, reading, email"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                {/* QUESTIONS */}
                {questions.map((q, qIdx) => (
                    <QuestionEditorBlock
                        key={q.orderIndex}
                        question={q}
                        questionIndex={qIdx}
                        onChange={(updated) => {
                            const next = [...questions];
                            next[qIdx] = updated;
                            setQuestions(next);
                        }}
                    />
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

export default ToeicPart7Editor;