export interface LeaderboardEntry {
    rank: number;
    userId: string;
    fullname: string;
    avatarUrl?: string | null;
    points: number;
    streak: number;
    medal?: string; // '🥇' | '🥈' | '🥉' | null
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    currentUserRank?: {
        rank: number;
        points: number;
        streak: number;
    };
}