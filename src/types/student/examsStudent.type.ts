// types/exam.ts
export interface ExamItem {
    id: string;
    title: string;
    code: string;
    duration: number;
    questionCount: number;
    status: 'Draft' | 'Published';
    createdAt: string;
}
