// ============================================================
// src/services/admin/adminStats.service.ts
// ============================================================
import { api } from '../../../../configs/axios-custom';
import type {
    DateRangeParams,
    Granularity,
    DashboardStatsDto,
    UserGrowthDto,
    ExamSubmissionStatsDto,
    ScoreDistributionDto,
    PassRateDto,
    CompletionTimeDto,
    TopExamDto,
    TopUserDto,
    SkillStatsDto,
    RecentActivityDto,
    ApiResponse,
} from '../types/adminStats.types';

// Helper: lọc bỏ undefined trước khi gửi params
function cleanParams(obj: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );
}

class AdminStatsService {
    private base = '/api/admin/stats';

    // ── Dashboard overview ──────────────────────────────────────
    async getDashboard(filter?: DateRangeParams): Promise<DashboardStatsDto> {
        const res = await api.get<ApiResponse<DashboardStatsDto>>(
            `${this.base}/dashboard`,
            { params: cleanParams({ from: filter?.from, to: filter?.to, gran: filter?.gran }) }
        );
        return res.data.data;
    }

    // ── User growth ─────────────────────────────────────────────
    async getUserGrowth(filter: DateRangeParams): Promise<UserGrowthDto> {
        const res = await api.get<ApiResponse<UserGrowthDto>>(
            `${this.base}/users/growth`,
            { params: cleanParams({ from: filter.from, to: filter.to, gran: filter.gran }) }
        );
        return res.data.data;
    }

    // ── Exam submissions ────────────────────────────────────────
    async getExamSubmissions(filter: DateRangeParams): Promise<ExamSubmissionStatsDto> {
        const res = await api.get<ApiResponse<ExamSubmissionStatsDto>>(
            `${this.base}/exams/submissions`,
            { params: cleanParams({ from: filter.from, to: filter.to, gran: filter.gran }) }
        );
        return res.data.data;
    }

    // ── Score distribution ──────────────────────────────────────
    async getScoreDistribution(
        filter?: DateRangeParams,
        examId?: string
    ): Promise<ScoreDistributionDto> {
        const res = await api.get<ApiResponse<ScoreDistributionDto>>(
            `${this.base}/scores/distribution`,
            { params: cleanParams({ from: filter?.from, to: filter?.to, examId }) }
        );
        return res.data.data;
    }

    // ── Pass rate by exam ───────────────────────────────────────
    async getPassRate(filter?: DateRangeParams, top = 10): Promise<PassRateDto[]> {
        const res = await api.get<ApiResponse<PassRateDto[]>>(
            `${this.base}/exams/pass-rate`,
            { params: cleanParams({ from: filter?.from, to: filter?.to, top }) }
        );
        return res.data.data ?? [];
    }

    // ── Completion time ─────────────────────────────────────────
    async getCompletionTime(filter?: DateRangeParams): Promise<CompletionTimeDto> {
        const res = await api.get<ApiResponse<CompletionTimeDto>>(
            `${this.base}/completion-time`,
            { params: cleanParams({ from: filter?.from, to: filter?.to }) }
        );
        return res.data.data;
    }

    // ── Top exams ───────────────────────────────────────────────
    async getTopExams(filter?: DateRangeParams, top = 10): Promise<TopExamDto[]> {
        const res = await api.get<ApiResponse<TopExamDto[]>>(
            `${this.base}/exams/top`,
            { params: cleanParams({ from: filter?.from, to: filter?.to, top }) }
        );
        return res.data.data ?? [];
    }

    // ── Top users ───────────────────────────────────────────────
    async getTopUsers(filter?: DateRangeParams, top = 10): Promise<TopUserDto[]> {
        const res = await api.get<ApiResponse<TopUserDto[]>>(
            `${this.base}/users/top`,
            { params: cleanParams({ from: filter?.from, to: filter?.to, top }) }
        );
        return res.data.data ?? [];
    }

    // ── Skill stats ─────────────────────────────────────────────
    async getSkillStats(filter?: DateRangeParams): Promise<SkillStatsDto[]> {
        const res = await api.get<ApiResponse<SkillStatsDto[]>>(
            `${this.base}/skills`,
            { params: cleanParams({ from: filter?.from, to: filter?.to }) }
        );
        return res.data.data ?? [];
    }

    // ── Recent activity ─────────────────────────────────────────
    async getRecentActivity(take = 20): Promise<RecentActivityDto[]> {
        const res = await api.get<ApiResponse<RecentActivityDto[]>>(
            `${this.base}/activity`,
            { params: { take } }
        );
        return res.data.data ?? [];
    }

    // ── Convenience: load tất cả data cho dashboard 1 lần ──────
    // Dùng Promise.all để parallel — không chờ tuần tự
    async loadDashboardAll(filter?: DateRangeParams) {
        const [
            overview,
            userGrowth,
            submissions,
            scoreDistribution,
            passRate,
            completionTime,
            topExams,
            topUsers,
            skillStats,
            recentActivity,
        ] = await Promise.all([
            this.getDashboard(filter),
            this.getUserGrowth(filter ?? { gran: 'Day' }),
            this.getExamSubmissions(filter ?? { gran: 'Day' }),
            this.getScoreDistribution(filter),
            this.getPassRate(filter),
            this.getCompletionTime(filter),
            this.getTopExams(filter),
            this.getTopUsers(filter),
            this.getSkillStats(filter),
            this.getRecentActivity(),
        ]);

        return {
            overview,
            userGrowth,
            submissions,
            scoreDistribution,
            passRate,
            completionTime,
            topExams,
            topUsers,
            skillStats,
            recentActivity,
        };
    }
}

export const adminStatsService = new AdminStatsService();

// ── Hook helper: preset date ranges ──────────────────────────
export function getPresetRange(preset: '7d' | '30d' | '90d' | '1y'): DateRangeParams {
    const to = new Date();
    const from = new Date();
    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[preset];
    from.setDate(from.getDate() - days);

    const gran: Granularity =
        preset === '7d' ? 'Day' :
            preset === '30d' ? 'Day' :
                preset === '90d' ? 'Week' : 'Month';

    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        gran,
    };
}