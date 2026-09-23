// types/examAnalytics.types.ts

export interface PartAnalyticsDto {
    partName: string;
    skill: string;
    accuracyPercent: number;
    totalAttempted: number;
    totalCorrect: number;
    trendPercent: number;
    level: string; // "Strong" | "Average" | "Weak"
}

export interface ImprovementSuggestionDto {
    partName: string;
    priority: string; // "High" | "Medium" | "Low"
    message: string;
    actionUrl: string;
}

export interface ScoreHistoryDto {
    attemptDate: string; // Trả về dạng ISO string
    score: number;
    maxScore: number;
    percent: number;
    examTitle: string;
}

export interface ExamAnalyticsDto {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    latestScore: number;
    scoreTrend: number;
    partAnalytics: PartAnalyticsDto[];
    strengths: string[];
    weaknesses: string[];
    suggestions: ImprovementSuggestionDto[];
    scoreHistory: ScoreHistoryDto[];
}