import { isGroupQuestion, type FlattenedQuestion, type PartData, type PreviewZipResponse } from "../types/PreviewData.type";

/**
 * Transform backend data thành flattened structure cho UI
 */
export const transformPreviewData = (response: PreviewZipResponse): PartData[] => {
  return response.data.map(sheet => {
    // Extract part number from sheet name (e.g., "Part 3" -> 3)
    const partNumber = parseInt(sheet.sheetName.match(/\d+/)?.[0] || "1");
    const questions: FlattenedQuestion[] = [];
    
    sheet.items.forEach(item => {
      if (isGroupQuestion(item)) {
        // Group Question (Part 3, 4, 6, 7)
        item.questions.forEach(q => {
          questions.push({
            id: `group-${item.startRow}-q${q.questionNumber}`,
            index: questions.length + 1,
            content: q.content,
            answers: q.answers,
            explanation: q.explanation || undefined,
            audioFileName: item.audioFileName || undefined,
            imageFileName: item.imageFileName || undefined,
            difficultyName: q.difficultyName || undefined,
            
            // Group metadata
            isGroupQuestion: true,
            groupTitle: item.groupTitle,
            groupContent: item.groupContent,
            groupStartRow: item.startRow,
            groupEndRow: item.endRow,
            questionNumber: q.questionNumber,
            
            hasError: q.hasError || item.hasError,
            errors: [
              ...item.errors.map(e => e.message),
              ...q.errors.map(e => e.message)
            ]
          });
        });
      } else {
        // Single Question (Part 1, 2, 5)
        questions.push({
          id: `row-${item.rowNumber}`,
          index: questions.length + 1,
          content: item.content || "",
          answers: item.answers,
          explanation: item.explanation || undefined,
          audioFileName: item.audioFileName || undefined,
          imageFileName: item.imageFileName || undefined,
          tags: item.tags,
          difficultyName: item.difficultyName || undefined,
          
          isGroupQuestion: false,
          
          hasError: item.hasError,
          errors: item.errors.map(e => e.message)
        });
      }
    });
    
    return {
      part: partNumber,
      questions,
      sheetError: sheet.error || undefined
    };
  });
};
