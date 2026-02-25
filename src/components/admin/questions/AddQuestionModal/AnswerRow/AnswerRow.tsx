import React, { useEffect, useRef } from "react";
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
  canRemove,
}) => {
  // Dùng ref để track nội dung đang được chính editor emit ra
  // tránh vòng lặp: onChange → re-render → useEffect → setContent → onChange...
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3] } }),
      Underline,
      Image,
    ],
    // Chỉ set content lần đầu khởi tạo, không re-init khi answer.Content thay đổi
    content: answer.Content || `<p>(${String.fromCharCode(65 + index)}) </p>`,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange({ ...answer, Content: editor.getHTML() });
    },
  });

  // Chỉ sync ngược từ ngoài vào nếu KHÔNG phải do chính editor vừa emit
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      // Reset flag, bỏ qua lần này
      isInternalUpdate.current = false;
      return;
    }
    // Nội dung thay đổi từ bên ngoài (ví dụ: load initialData)
    if (answer.Content !== editor.getHTML()) {
      editor.commands.setContent(answer.Content || "", { emitUpdate: false });
    }
  }, [answer.Content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  return (
    <tr>
      {/* CỘT STT */}
      <td className="stt-col" style={{ paddingTop: 12 }}>
        <div
          className="answer__content"
          style={{
            backgroundColor: isSelected ? "#1890ff" : "#f0f0f0",
            color: isSelected ? "#fff" : "#333",
          }}
        >
          {String.fromCharCode(65 + index)}
        </div>
      </td>

      {/* CỘT NỘI DUNG */}
      <td>
        <div
          className="rich-editor-container"
          style={{ borderColor: isSelected ? "#1890ff" : "#d9d9d9" }}
        >
          {/* TOOLBAR — đồng bộ với RichTextEditor base */}
          <div className="editor-toolbar">
            <button
              title="Bold"
              className={editor.isActive("bold") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <strong>B</strong>
            </button>
            <button
              title="Italic"
              className={editor.isActive("italic") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <em>I</em>
            </button>
            <button
              title="Underline"
              className={editor.isActive("underline") ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <u>U</u>
            </button>

            <span className="separator" />

            <button
              title="Chèn ảnh"
              onClick={() => {
                const url = prompt("Nhập URL hình ảnh");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
            >
              🖼️
            </button>

            <span className="separator" />

            <button
              title="Paragraph"
              className={editor.isActive("paragraph") ? "is-active" : ""}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              ¶
            </button>
            <button
              title="Heading 3"
              className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H
            </button>
          </div>

          {/* EDITOR CONTENT */}
          <EditorContent
            editor={editor}
            className={`editor-content ${isSelected ? "active" : ""}`}
          />
        </div>
      </td>

      {/* CỘT ĐÁNH DẤU ĐÚNG */}
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