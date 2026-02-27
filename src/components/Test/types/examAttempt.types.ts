
export interface StartExamCommand {
    examId: string;
    // có thể thêm các trường khác nếu cần
}

export interface SaveAnswerCommand {
    attemptId: string;
    questionId: string;
    answerId: string | null;
    timeSpentSeconds: number;
    isMarkedForReview?: boolean;
}

export interface ExamAttemptDto {
    attemptId: string;
    examId: string;
    examTitle: string;
    startedAt: string;
    timeLimitSeconds: number | null;
    totalQuestions: number;
    sections: ExamSectionDto[];
}

export interface ExamSectionDto {
    sectionId: string;
    sectionName: string;
    orderIndex: number;
    questions: ExamQuestionDto[];
}

export interface ExamQuestionDto {
    questionId: string;
    examQuestionId: string;
    content: string;
    orderIndex: number;
    point: number;
    answers: AnswerDto[];
}

export interface AnswerDto {
    id: string;
    content: string;
    orderIndex: number;
}

export interface InProgressAttemptDto {
    attemptId: string;
    examId: string;
    title: string;
    progress: number;
    startedAt: string;
    lastUpdated: string;
    timeLimitSeconds: number | null;
    actualTimeSeconds: number | null;
}

export interface ExamResultDto {
    attemptId: string;
    examId: string;
    examTitle: string;
    totalScore: number;
    userScore: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    accuracy: number;
    submittedAt: string;
    timeSpentSeconds: number;
    sections: ExamResultSectionDto[];
}

export interface ExamResultSectionDto {
    sectionName: string;
    correctCount: number;
    totalQuestions: number;
    score: number;
}
