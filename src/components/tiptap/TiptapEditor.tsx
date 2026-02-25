import React, { useCallback, useEffect } from 'react'
// Import thêm type 'Editor' từ @tiptap/react
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table' // Lưu ý: thường là default import
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header';
import {
    FaBold, FaItalic, FaUnderline, FaHighlighter,
    FaAlignLeft, FaAlignCenter, FaAlignRight,
    FaListUl, FaListOl, FaImage, FaTable,
    FaRotateLeft, FaRepeat, FaTrash, FaHeading
} from 'react-icons/fa6'
import './editor.scss'

// 1. Định nghĩa Interface cho MenuBar Props
interface MenuBarProps {
    editor: Editor | null
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
    if (!editor) return null

    // Helper chèn ảnh
    const addImage = useCallback(() => {
        const url = window.prompt('Nhập URL hình ảnh:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    return (
        <div className="toolbar">
            {/* --- Nhóm History --- */}
            <button title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <FaRotateLeft />
            </button>
            <button title="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <FaRepeat />
            </button>
            <div className="separator" />

            {/* --- Nhóm Basic Styles --- */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
            > <FaBold /> </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
            > <FaItalic /> </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'is-active' : ''}
            > <FaUnderline /> </button>
            <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'is-active' : ''}
            > <FaHighlighter /> </button>

            <div className="separator" />

            {/* --- Nhóm Headings --- */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            ><FaHeading /></button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            >H2</button>

            <div className="separator" />

            {/* --- Nhóm Alignment --- */}
            <button title="Canh trái" onClick={() => editor.chain().focus().setTextAlign('left').run()}><FaAlignLeft /></button>
            <button title="Canh giữa" onClick={() => editor.chain().focus().setTextAlign('center').run()}><FaAlignCenter /></button>
            <button title="Canh phải" onClick={() => editor.chain().focus().setTextAlign('right').run()}><FaAlignRight /></button>

            <div className="separator" />

            {/* --- Nhóm Lists --- */}
            <button title="Danh sách không đánh số" onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
            <button title="Danh sách đánh số" onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>

            <div className="separator" />

            {/* --- Nhóm Insert --- */}
            <button onClick={addImage}>IMG</button>
            <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                Table 3x3
            </button>
            <button onClick={() => editor.chain().focus().deleteTable().run()}>Del Table</button>
        </div>
    )
}

// 2. Định nghĩa Interface cho Component chính
interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
    height?: string | number     // Ví dụ: "500px" hoặc 500
    minHeight?: string | number  // Mặc định thấp nhất
    maxHeight?: string | number  // Giới hạn cao nhất (sẽ hiện scroll nếu vượt quá)
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, height, minHeight, maxHeight }) => {

    const formatContent = (text: string) => {
        return text
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('')
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure(),
            Underline.configure(), 
            Highlight.configure(), 
            Image.configure(),     
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow.configure(),  
            TableHeader.configure(),
            TableCell.configure(), 
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    const containerStyle: React.CSSProperties = {
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        maxHeight: maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : 'none',
    }


    return (
        <div className="rich-text-editor" style={containerStyle}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor;