import type { EditorProps } from "../editor.type";
import ReadingQuestionFormEditor from "../Shared/ReadingQuestionForm";

export const ToeicPart6Editor: React.FC<EditorProps> = (props) => {
    return <ReadingQuestionFormEditor variant="part6" {...props} />;
};

export default ToeicPart6Editor;