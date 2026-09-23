import { api } from '../../../../../configs/axios-custom';
import type {
  ExtractResponse,
  SaveDigitizedExamCommand,
  SaveDigitizedExamResponse,
} from '../types/examDigitize';

export const examDigitizeService = {
  // ── Extract: upload ảnh → Gemini parse ──────────────────
  extract: async (
    files: File[],
    examType: string,
    passageOnly    = false,
    questionsOnly  = false,
    passageContent = '',
  ): Promise<ExtractResponse> => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    fd.append('examType',      examType);
    fd.append('passageOnly',   String(passageOnly));
    fd.append('questionsOnly', String(questionsOnly));
    if (passageContent)
      fd.append('passageContent', passageContent);

    const { data } = await api.post<ExtractResponse>(
      '/api/questions/extract', fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  // ── Save: confirm → lưu vào DB ──────────────────────────
  // FIX: gửi FormData vì backend nhận IFormFile AudioFile / ImageFile
  // Trước đây gửi JSON → backend không đọc được file
  save: async (
    command: SaveDigitizedExamCommand,
  ): Promise<SaveDigitizedExamResponse> => {
    const fd = new FormData();

    // Scalar fields
    fd.append('categoryId', command.categoryId);
    if (command.difficultyId)
      fd.append('difficultyId', command.difficultyId);
    if (command.audioFile)
      fd.append('audioFile', command.audioFile);          // IFormFile
    else if (command.audioUrl)
      fd.append('audioUrl',  command.audioUrl);           // string URL

    if (command.imageFile)
      fd.append('imageFile', command.imageFile);          // IFormFile
    else if (command.imageUrl)
      fd.append('imageUrl',  command.imageUrl);           // string URL

    // Tags — append từng item riêng
    command.tags.forEach(t => fd.append('tags', t));

    // ExtractedData — serialize thành JSON string
    // Backend cần [ModelBinder] hoặc [FromForm] string rồi JsonSerializer.Deserialize
    fd.append('extractedData', JSON.stringify(command.extractedData));

    const { data } = await api.post<SaveDigitizedExamResponse>(
      '/api/questions/save-extract', fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};