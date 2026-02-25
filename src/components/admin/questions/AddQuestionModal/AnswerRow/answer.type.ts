export interface AnswerUI {
    id?: string;          // khi create có thể chưa có
    content: string;
    isCorrect: boolean;
    orderIndex: number;
}
