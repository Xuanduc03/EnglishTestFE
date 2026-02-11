import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import AnswerRow from "../../../AnswerRow/AnswerRow";
import type { Part7Question } from "../ToeicPart7Editor";



type QuestionEditorBlockProps = {
    question: Part7Question;
    questionIndex: number;
    onChange: (q: Part7Question) => void;
};


export const QuestionEditorBlock: React.FC<QuestionEditorBlockProps> = ({
    question,
    questionIndex,
    onChange,
}) => {
    const contentEditor = useEditor({
        extensions: [StarterKit, Image, Link],
        content: question.content,
        onUpdate: ({ editor }) => {
            onChange({
                ...question,
                content: editor.getHTML(),
            });
        },
    });

    const explanationEditor = useEditor({
        extensions: [StarterKit, Image, Link],
        content: question.explanation,
        onUpdate: ({ editor }) => {
            onChange({
                ...question,
                explanation: editor.getHTML(),
            });
        },
    });

    return (
        <div className="group-question-box">
            <h4>Question {question.orderIndex}</h4>

            <label>Nội dung câu hỏi</label>
            <div className="rich-editor-container">
                <div className="editor-toolbar">
                    <button type="button" onClick={() => contentEditor?.chain().focus().undo().run()}>
                        ↶
                    </button>
                    <button type="button" onClick={() => contentEditor?.chain().focus().redo().run()}>
                        ↷
                    </button>
                    <span className="divider" />
                    <button type="button" onClick={() => contentEditor?.chain().focus().toggleBold().run()}>
                        B
                    </button>
                    <button type="button" onClick={() => contentEditor?.chain().focus().toggleItalic().run()}>
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const url = prompt("Image URL:");
                            if (url) contentEditor?.chain().focus().setImage({ src: url }).run();
                        }}
                    >
                        Img
                    </button>
                </div>
                <EditorContent editor={contentEditor} className="editor-content" />
            </div>

            <label className="mt-2">Giải thích đáp án</label>


            <div className="rich-editor-container">
                <div className="editor-toolbar">
                    <button type="button" onClick={() => explanationEditor?.chain().focus().undo().run()}>
                        ↶
                    </button>
                    <button type="button" onClick={() => explanationEditor?.chain().focus().redo().run()}>
                        ↷
                    </button>
                    <span className="divider" />
                    <button type="button" onClick={() => explanationEditor?.chain().focus().toggleBold().run()}>
                        B
                    </button>
                    <button type="button" onClick={() => explanationEditor?.chain().focus().toggleItalic().run()}>
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const url = prompt("Image URL:");
                            if (url) explanationEditor?.chain().focus().setImage({ src: url }).run();
                        }}
                    >
                        Img
                    </button>
                </div>
                <EditorContent
                    editor={explanationEditor}
                    className="editor-content explanation-editor"
                />            </div>

            <table className="answer-table">
                <tbody>
                    {question.answers.map((a, aIdx) => (
                        <AnswerRow
                            key={aIdx}
                            index={aIdx}
                            questionIndex={questionIndex}
                            answer={a}
                            onChange={(updated: any) => {
                                const nextAnswers = [...question.answers];
                                nextAnswers[aIdx] = updated;
                                onChange({ ...question, answers: nextAnswers });
                            }}
                            onSelect={() => {
                                onChange({
                                    ...question,
                                    answers: question.answers.map((x, i) => ({
                                        ...x,
                                        IsCorrect: i === aIdx,
                                    })),
                                });
                            }}
                            canRemove={false}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
