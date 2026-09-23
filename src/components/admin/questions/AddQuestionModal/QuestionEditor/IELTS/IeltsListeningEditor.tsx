import React from "react";
import type { EditorProps } from "../editor.type";
import { IeltsGroupEditor } from "./IeltsQuestionEditor";

export const IeltsListeningEditor: React.FC<EditorProps> = (props) => (
    <IeltsGroupEditor variant="ielts_listening" {...props} />
);