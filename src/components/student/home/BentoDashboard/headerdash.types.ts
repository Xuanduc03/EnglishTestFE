export interface InProgressPracticeDto {
    attemptId: string;
    title: string;
    subtitle?: string;
    progress: number;
}

// Định nghĩa Type cho Mock Data
export interface UserDashboardStats {
    name: string;
    rank: string;
    currentScore: number;
    targetScore: number;
    streak: number;
    streakHistory: boolean[]; // Mảng 7 ngày (Thứ 2 -> Chủ Nhật)
    continueLearning: {
        title: string;
        subtitle: string;
        progress: number;
    };
}
