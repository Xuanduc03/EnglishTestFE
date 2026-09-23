// ============================================================
// src/services/admin/adminStats.types.ts
// ============================================================

// ── Shared ───────────────────────────────────────────────────
export type Granularity = 'Day' | 'Week' | 'Month';

export interface DateRangeParams {
    from?: string;   // ISO string  e.g. "2026-01-01"
    to?: string;
    gran?: Granularity;
}

export interface TimeSeriesDataPoint {
    date: string;   // ISO
    label: string;   // "dd/MM" hoặc "MM/yyyy"
    value: number;
}

// ── Dashboard overview ────────────────────────────────────────
export interface DashboardStatsDto {
    totalUsers: number;
    newUsersToday: number;
    totalExams: number;
    totalAttempts: number;
    attemptsToday: number;
    averageScore: number;  // 0–990
    passRate: number;  // 0–1
    avgCompletionMins: number;
    userGrowthPct: number;  // % so kỳ trước
    attemptGrowthPct: number;
    scoreGrowthPct: number;
}

// ── User growth ───────────────────────────────────────────────
export interface UserGrowthDto {
    newUsers: TimeSeriesDataPoint[];
    totalUsers: TimeSeriesDataPoint[];
    totalNewUsers: number;
}

// ── Exam submissions ──────────────────────────────────────────
export interface ExamSubmissionStatsDto {
    submissions: TimeSeriesDataPoint[];
    completions: TimeSeriesDataPoint[];
    totalSubmitted: number;
    avgScore: number;
}

// ── Score distribution ────────────────────────────────────────
export interface ScoreBucketDto {
    label: string;   // "0–100"
    min: number;
    max: number;
    count: number;
    pct: number;   // % tổng
}

export interface ScoreDistributionDto {
    buckets: ScoreBucketDto[];
    mean: number;
    median: number;
    stdDev: number;
    totalAttempts: number;
}

// ── Pass rate ─────────────────────────────────────────────────
export interface PassRateDto {
    examId: string;
    examTitle: string;
    total: number;
    passed: number;
    failed: number;
    passRate: number;  // 0–1
    avgScore: number;
}

// ── Completion time ───────────────────────────────────────────
export interface CompletionTimeDto {
    avgMinutes: number;
    medianMinutes: number;
    p90Minutes: number;
    byDay: TimeSeriesDataPoint[];
}

// ── Top exams / users ─────────────────────────────────────────
export interface TopExamDto {
    examId: string;
    title: string;
    code: string;
    attemptCount: number;
    avgScore: number;
    passRate: number;
}

export interface TopUserDto {
    userId: string;
    fullName: string;
    email: string;
    attemptCount: number;
    avgScore: number;
    bestScore: number;
}

// ── Skill stats ───────────────────────────────────────────────
export interface SkillStatsDto {
    partName: string;   // "Part 1"
    skillType: string;   // "Listening"
    avgScore: number;
    avgAccuracy: number;   // %
    totalQuestions: number;
    totalAnswered: number;
}

// ── Recent activity ───────────────────────────────────────────
export type ActivityAction = 'submitted' | 'registered';

export interface RecentActivityDto {
    userId: string;
    userName: string;
    action: ActivityAction;
    examTitle: string;
    score: number | null;
    occuredAt: string;  // ISO
}

// ── API response wrapper ──────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}