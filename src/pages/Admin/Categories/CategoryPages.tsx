import CategoryManager from "./index"; // Import component gốc

// Tạo sẵn các wrapper ở đây
export const ExamTypeManager = () => <CategoryManager presetCodeType="EXAM_TYPE" pageTitle="Quản lý Loại chứng chỉ" />;
export const SkillManager = () => <CategoryManager presetCodeType="SKILL" pageTitle="Quản lý Kỹ năng" />;
export const TopicManager = () => <CategoryManager presetCodeType="TOPIC" pageTitle="Quản lý Chủ đề" />;
export const QuestionTypeManager = () => <CategoryManager presetCodeType="QUESTION_TYPE" pageTitle="Quản lý Loại câu hỏi" />;
export const LevelManager = () => <CategoryManager presetCodeType="LEVEL" pageTitle="Quản lý mức độ học tập" />;
