import { api } from "../../../configs/axios-custom";
import type { LeaderboardResponse } from "./Home.type";

export class LeaderboardService {
    static async getLeaderboard(
        limit: number = 10,
        period: 'week' | 'month' = 'week'
    ): Promise<LeaderboardResponse> {
        const response = await api.get(`/api/dashboard/leaderboard`, {
            params: { limit, period }
        });
        return response.data;
    }
}