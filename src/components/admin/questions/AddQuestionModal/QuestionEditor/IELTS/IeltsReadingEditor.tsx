import React from "react";
import type { EditorProps } from "../editor.type";
import { IeltsGroupEditor } from "./IeltsQuestionEditor";

export const IeltsReadingEditor: React.FC<EditorProps> = (props) => (
    <IeltsGroupEditor variant="ielts_reading" {...props} />
);