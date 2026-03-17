// components/editor.registry.tsx

import React from "react";
import { ToeicPart1Editor } from "./TOEIC/ToeicPart1Editor";
import { ToeicPart2Editor } from "./TOEIC/ToeicPart2Editor";
import { ToeicPart3Editor } from "./TOEIC/ToeicPart3Editor";
import { ToeicPart4Editor } from "./TOEIC/ToeicPart4Editor";
import { ToeicPart5Editor } from "./TOEIC/ToeicPart5Editor";
import ToeicPart6Editor from "./TOEIC/ToeicPart6Editor";
import ToeicPart7Editor from "./TOEIC/ToeicPart7Editor";
import { WritingEditor } from "./TOEIC/WritingEditor";
import { SpeakingEditor } from "./TOEIC/SpeakingEditor"; 
import type { EditorKey, EditorProps } from "./editor.type";
import { IeltsReadingEditor } from "./IELTS/IeltsListeningEditor";

export const EDITOR_REGISTRY: Record<EditorKey, React.FC<EditorProps>> = {
  TOEIC_PART_1: ToeicPart1Editor,
  TOEIC_PART_2: ToeicPart2Editor,
  TOEIC_PART_3: ToeicPart3Editor,
  TOEIC_PART_4: ToeicPart4Editor,
  TOEIC_PART_5: ToeicPart5Editor,
  TOEIC_PART_6: ToeicPart6Editor,
  TOEIC_PART_7: ToeicPart7Editor,
  TOEIC_WRITING: WritingEditor,  
  TOEIC_SPEAKING: SpeakingEditor,
   IELTS_LISTENING: IeltsReadingEditor,
  IELTS_READING:   IeltsReadingEditor,
};

interface Props {
  editorKey: EditorKey;
  editorProps: EditorProps;
}

export const EditorRenderer: React.FC<Props> = ({ editorKey, editorProps }) => {
  const EditorComponent = EDITOR_REGISTRY[editorKey];

  if (!EditorComponent) {
    console.warn(`No editor found for key: ${editorKey}`);
    return <div>Editor không tồn tại: {editorKey}</div>;
  }

  return <EditorComponent {...editorProps} />;
};