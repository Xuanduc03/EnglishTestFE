// components/editor.registry.tsx

import React from "react";

// Import editors
// import { IeltsListeningEditor } from "../editors/ielts/IeltsListeningEditor";
// import { IeltsReadingEditor } from "../editors/ielts/IeltsReadingEditor";
// import { IeltsWritingEditor } from "../editors/ielts/IeltsWritingEditor";

// import { DefaultEditor } from "../editors/shared/DefaultEditor";
import { ToeicPart1Editor } from "./TOEIC/ToeicPart1Editor";
import { ToeicPart2Editor } from "./TOEIC/ToeicPart2Editor";
import { ToeicPart3Editor } from "./TOEIC/ToeicPart3Editor";
import type { EditorKey, EditorProps } from "./editor.type";
import { ToeicPart4Editor } from "./TOEIC/ToeicPart4Editor";
import { ToeicPart5Editor } from "./TOEIC/ToeicPart5Editor";
import ToeicPart6Editor from "./TOEIC/ToeicPart6Editor";
import ToeicPart7Editor from "./TOEIC/ToeicPart7Editor";

export const EDITOR_REGISTRY: Record<EditorKey, React.FC<EditorProps>> = {
  TOEIC_PART_1: ToeicPart1Editor,
  TOEIC_PART_2: ToeicPart2Editor,
  TOEIC_PART_3: ToeicPart3Editor,
  TOEIC_PART_4: ToeicPart4Editor,
  TOEIC_PART_5: ToeicPart5Editor,
  TOEIC_PART_6: ToeicPart6Editor,
  TOEIC_PART_7: ToeicPart7Editor,

  // IELTS_LISTENING: IeltsListeningEditor,
  // IELTS_READING: IeltsReadingEditor,
  // IELTS_WRITING: IeltsWritingEditor,

  // DEFAULT: DefaultEditor,
};

interface Props {
  editorKey: EditorKey;
  editorProps: EditorProps;
}

export const EditorRenderer: React.FC<Props> = ({ editorKey, editorProps }) => {
  const EditorComponent = EDITOR_REGISTRY[editorKey] || EDITOR_REGISTRY.TOEIC_PART_1;

  return <EditorComponent {...editorProps} />;
};