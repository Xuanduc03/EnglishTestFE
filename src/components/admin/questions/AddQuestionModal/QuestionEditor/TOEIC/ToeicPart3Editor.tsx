// editors/toeic/ToeicPart3Editor.tsx

import React from "react";
import type { EditorProps } from "../editor.type";
import { GroupListeningEditor, type ListeningEditorConfig } from "./GroupListeningEditor";

const part3Config: ListeningEditorConfig = {
    title: "TOEIC Part 3 – Conversations",
    icon: "fa-solid fa-comments",
    hint: "📋 1 đoạn hội thoại (audio) + 3 câu hỏi, mỗi câu 4 đáp án",
    defaultScore: 5,
    defaultTags: "toeic,part3,listening",
    questionCount: 3,
    answerCount: 4,
};

export const ToeicPart3Editor: React.FC<EditorProps> = (props: EditorProps) => {
    return <GroupListeningEditor {...props} config={part3Config} />;
};