import { toast } from "react-toastify";
import RichTextEditor from "../../../../../tiptap/TiptapEditor";
import AnswerRow from "../../AnswerRow/AnswerRow";
import { BaseQuestionForm } from "../Shared/BaseQuestionForm";
import MediaFileInput from "../Shared/MediaFileInput";
import { useState, useEffect } from "react";
import type { EditorProps } from "../editor.type";

export type ListeningEditorConfig = {
    title: string;
    icon: string;
    hint: string;
    defaultScore: number;
    defaultTags: string;
    questionCount: number;
    answerCount?: number;
};

export type BaseAnswer = {
    id?: string;
    Content: string;
    IsCorrect: boolean;
    OrderIndex: number;
};

export type BaseQuestion = {
    id?: string;
    content: string;
    orderIndex: number;
    answers: BaseAnswer[];
};


type Props = EditorProps & {
    config: ListeningEditorConfig;
};

export const GroupListeningEditor: React.FC<Props> = ({
    config,
    categories = [],
    difficulties = [],
    onSave,
    onCancel,
    initialData,
    isEdit
}) => {
    const [categoryId, setCategoryId] = useState("");
    const [difficultyId, setDifficultyId] = useState("");
    const [explanation, setExplanation] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>();
    const [groupContent, setGroupContent] = useState(""); // Nội dung đoạn hội thoại (optional)
    const [tags, setTags] = useState(config.defaultTags);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const createEmptyQuestion = (order: number): BaseQuestion => {
        const totalAnswers = config.answerCount ?? 4;

        return {
            content: "",
            orderIndex: order,
            answers: Array.from({ length: totalAnswers }, (_, i) => ({
                Content: `(${String.fromCharCode(65 + i)}) `,
                IsCorrect: false,
                OrderIndex: i + 1,
            })),
        };
    };

    const [questions, setQuestions] = useState<BaseQuestion[]>(() =>
        Array.from({ length: config.questionCount }, (_, i) =>
            createEmptyQuestion(i + 1)
        )
    );

    // Load initial data khi edit
    useEffect(() => {
        if (!initialData || !isEdit || initialData.mode !== "group") return;

        const data = initialData.data;
        console.log("📝Editor loading data:", data);

        setCategoryId(data.categoryId ?? "");
        setDifficultyId(data.difficultyId ?? "");
        setGroupContent(data.content ?? "");
        setExplanation(data.explanation ?? "");

        if (Array.isArray(data.media)) {
            const audioMedia = data.media.find((m: any) =>
                (m.mediaType && m.mediaType.toLowerCase() === 'audio') ||
                (m.type && m.type.toLowerCase() === 'audio')
            );
            if (audioMedia) {
                setExistingAudioUrl(audioMedia.url);
            }
        }

        if (Array.isArray(data.questions) && data.questions.length > 0) {
            const mappedQuestions = data.questions.map((wrapper: any, idx: number): BaseQuestion => {
                const q = wrapper.data;
                return {
                    id: q.id,
                    content: q.content ?? "",
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

    }, [initialData, isEdit]);


    const validate = (): boolean => {
        if (!categoryId || !difficultyId) {
            toast.error("Vui lòng chọn danh mục và độ khó");
            return false;
        }

        const hasAudio = audioFile || existingAudioUrl;

        // Khi edit không bắt buộc upload lại audio
        if (!hasAudio) {
            toast.error(`${config.title} bắt buộc có Audio`);
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


    const updateQuestionField = (questionIndex: number, field: keyof BaseQuestion, value: any) => {
        const updatedQuestions = [...questions];
        (updatedQuestions[questionIndex] as any)[field] = value;
        setQuestions(updatedQuestions);
    }


    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);

        try {
            const formData = new FormData();

            // GROUP FIELDS (theo CreateQuestionGroupCommand)
            formData.append("Id", initialData?.data?.id || "");
            formData.append("CategoryId", categoryId);
            formData.append("DifficultyId", difficultyId);
            formData.append("GroupContent", groupContent || "refer to the following conversation.");
            formData.append("Explanation", explanation || "");
            // 3. Audio File
            if (audioFile) {
                formData.append("GroupAudioFile", audioFile, audioFile.name);
            } else if (existingAudioUrl) {
                formData.append("AudioUrl", existingAudioUrl);
            }
            // QUESTIONS JSON
            questions.forEach((q, qIndex) => {
                if (q.id) {
                    formData.append(`Questions[${qIndex}].Id`, q.id)
                }
                formData.append(`Questions[${qIndex}].Content`, q.content);
                formData.append(`Questions[${qIndex}].QuestionType`, "SingleChoice");
                formData.append(
                    `Questions[${qIndex}].DefaultScore`,
                    config.defaultScore.toString()
                );
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
                    <i className="fa-solid fa-comments"></i> {config?.title}
                </h3>
                <p className="editor-hint">
                    {config?.hint}
                </p>
            </div>

            <div className="editor-body">
                {/* CATEGORY & DIFFICULTY */}
                <BaseQuestionForm
                    categoryId={categoryId}
                    difficultyId={difficultyId}
                    categories={categories}
                    difficulties={difficulties}
                    onDifficultyChange={setDifficultyId}
                    content={groupContent}
                    onContentChange={setGroupContent}
                    explanation={explanation}
                    onExplanationChange={setExplanation}
                    onCategoryChange={setCategoryId}
                    tags={tags}
                    onTagsChange={setTags}
                    shuffle={false}
                    onShuffleChange={setShuffle}
                />

                {/* AUDIO */}
                <MediaFileInput
                    label="Question Audio"
                    required
                    accept="audio/*"
                    existingUrl={existingAudioUrl}
                    file={audioFile}
                    setFile={setAudioFile}
                />


                {/* QUESTIONS */}
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="group-question-box">
                        <h4>Question {qIdx + 1}</h4>
                        <div className="form-input-question-group">
                            <label>Nội dung câu hỏi</label>
                            <RichTextEditor
                                value={q.content}
                                onChange={(newContent) => updateQuestionField(qIdx, 'content', newContent)}
                                maxHeight="200px"
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

