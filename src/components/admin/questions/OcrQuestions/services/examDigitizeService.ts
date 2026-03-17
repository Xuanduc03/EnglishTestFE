import { api } from '../../../../../configs/axios-custom';
import type {
    ExtractResponse,
    SaveDigitizedExamCommand,
    SaveDigitizedExamResponse,
} from '../types/examDigitize';

export const examDigitizeService = {
    // Upload ảnh → Gemini extract
    extract: async (
        file: File,
        examType: string
    ): Promise<ExtractResponse> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('examType', examType);

        const { data } = await api.post<ExtractResponse>(
            '/api/questions/extract', fd,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return data;
    },

    // Confirm → save vào DB
    save: async (
        command: SaveDigitizedExamCommand
    ): Promise<SaveDigitizedExamResponse> => {
        const { data } = await api.post<SaveDigitizedExamResponse>(
            '/api/questions/save-extract', command
        );
        return data;
    },
};