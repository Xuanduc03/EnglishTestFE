import React, { useEffect, useRef, useState } from "react";
import "./AnswerRow.scss";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import type { CreateAnswerWithFileDto } from "../../components/Quesion.config";

type Props = {
  index: number;
  answer: CreateAnswerWithFileDto;
  onChange: (a: CreateAnswerWithFileDto) => void;
  isSelected?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
questionIndex: number;
  canRemove: boolean;
};

const AnswerRow: React.FC<Props> = ({
  index,
  answer,
  onChange,
  isSelected,
  onSelect,
  onRemove,
  questionIndex,
  canRemove
}) => {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
      Underline,
      Image,
    ],
    content: answer.Content || `<p>(${String.fromCharCode(65 + index)}) </p>`,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange({ ...answer, Content: html });
    },
  });

  useEffect(() => {
    if (editor && answer.Content !== editor.getHTML()) {
      editor.commands.setContent(answer.Content || "", {
        emitUpdate: false,
      });
    }
  }, [answer.Content, editor]);

  if (!editor) return null;


  return (
    <tr>
      <td className="stt-col" style={{ paddingTop: 12 }}>
        <div className="answer__content" style={{
          backgroundColor: isSelected ? '#1890ff': '#f0f0f0',
        color: isSelected ? '#fff': '#333'
        }}>
          {String.fromCharCode(65 + index)}
        </div>
      </td>
      {/* CỘT NỘI DUNG */}
      <td>
        <div
          className="rich-editor-container"
          style={{
            borderColor: isSelected ? "#1890ff" : "#d9d9d9",
          }}
        >
          {/* TOOLBAR */}
          <div className="editor-toolbar">
            <button onClick={() => editor.chain().focus().toggleBold().run()}>
              <strong>B</strong>
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>
              <em>I</em>
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <u>U</u>
            </button>

            <span>|</span>

            <button
              onClick={() => {
                const url = prompt("Nhập URL hình ảnh");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
            >
              🖼️
            </button>

            <span>|</span>

            <button onClick={() => editor.chain().focus().setParagraph().run()}>
              ¶
            </button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              H
            </button>
          </div>

          {/* EDITOR */}
          <EditorContent
            editor={editor}
            className={`editor-content ${isSelected ? "active" : ""}`}
          />
        </div>
      </td>

      {/* CỘT ĐÁP ÁN ĐÚNG */}
      <td className="correct-col" style={{ paddingTop: 12, textAlign: "center" }}>
        <input
          type="radio"
          name={`correctAnswer-${questionIndex}`}
          checked={isSelected}
          onChange={onSelect}
        />

        {canRemove && onRemove && (
          <button
            className="btn btn-default"
            onClick={() => {
              if (window.confirm("Bạn có chắc muốn xóa đáp án này?")) {
                onRemove();
              }
            }}
          >
            ❌ Xóa
          </button>
        )}
      </td>
    </tr>
  );
};

export default AnswerRow;