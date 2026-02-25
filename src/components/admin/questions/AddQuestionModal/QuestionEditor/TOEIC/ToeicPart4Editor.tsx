
import React from "react";
import type { EditorProps } from "../editor.type";
import { GroupListeningEditor, type ListeningEditorConfig } from "./GroupListeningEditor";

const part4Config: ListeningEditorConfig = {
    title: "TOEIC Part 4 – Talks",
    icon: "fa-solid fa-headphones",
    hint: "📋 1 đoạn talk + 3 câu hỏi, mỗi câu 4 đáp án",
    defaultScore: 5,
    defaultTags: "toeic,part4,listening",
    questionCount: 3,
    answerCount: 4,
};

export const ToeicPart4Editor: React.FC<EditorProps> = (props) => {
    return <GroupListeningEditor {...props} config={part4Config} />;
};