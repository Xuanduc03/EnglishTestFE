// editors/toeic/ToeicPart7Editor.tsx

import React from "react";
import type { EditorProps } from "../editor.type";
import ReadingQuestionFormEditor from "../Shared/ReadingQuestionForm";

export const ToeicPart7Editor: React.FC<EditorProps> = (props) => {
    return <ReadingQuestionFormEditor variant="part7" {...props} />;
};

export default ToeicPart7Editor;