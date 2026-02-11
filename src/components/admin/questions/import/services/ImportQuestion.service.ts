import { api, apiUpload } from "../../../../../configs/axios-custom";
import type { PreviewZipResponse } from "../types/PreviewData.type";

/**
 * Service xử lý import câu hỏi từ file zip
 */
export const ImportQuestionService = {

    /**
     *  Upload file zip lên server để preview
     * @param file  file zip người dùng chọn
     * @returns  Json preview từ server
     */
    uploadFileQuestion: async (file: File): Promise<PreviewZipResponse> => {
        const formData = new FormData();
        formData.append('File', file);
        const res = await api.post('/api/questions/preview-excel-zip', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    },


    importFileQuestion: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('File', file);

        try {
            const response = await apiUpload.post('/api/questions/import-zip', formData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Import thất bại');
        }
    },
};