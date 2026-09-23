import React from 'react';
import { IeltsQuestionType, type IeltsQuestionPreview } from '../../../../types/ieltsExam.types';

interface Props {
  /** Câu đầu tiên của block (xác định type + maxWords) */
  firstQuestion: IeltsQuestionPreview;
  /** Toàn bộ block để lấy range câu số */
  block: IeltsQuestionPreview[];
}

/**
 * Instruction — auto-generate hướng dẫn theo questionType và số câu trong block.
 * Ví dụ: "Questions 21–25 — Complete the notes. NO MORE THAN TWO WORDS for each answer."
 */
const Instruction: React.FC<Props> = ({ firstQuestion, block }) => {
  const range =
    block.length === 1
      ? `Question ${block[0].orderIndex}`
      : `Questions ${block[0].orderIndex}–${block[block.length - 1].orderIndex}`;

  const maxWords = firstQuestion.maxWords ?? 2;
  const wordLimit = `NO MORE THAN ${wordToText(maxWords)} WORD${maxWords !== 1 ? 'S' : ''}${maxWords > 1 ? ' AND/OR A NUMBER' : ''}`;

  const type = firstQuestion.questionType;

  const instructionContent = (): React.ReactNode => {
    switch (type) {
      case IeltsQuestionType.FormCompletion:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Complete the form below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.NoteCompletion:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Complete the notes below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.SummaryCompletion:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Complete the summary below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.SentenceCompletion:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Complete the sentences below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.ShortAnswer:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Answer the questions below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.MapLabeling:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Label the map/diagram below.</p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      case IeltsQuestionType.SingleChoice:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Choose the correct letter, <strong>A</strong>, <strong>B</strong> or <strong>C</strong>.</p>
          </>
        );

      case IeltsQuestionType.MultipleChoice:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Choose <strong>TWO</strong> letters, <strong>A</strong>–<strong>E</strong>.</p>
          </>
        );

      case IeltsQuestionType.FillBlank:
        return (
          <>
            <p><strong>{range}</strong></p>
            <p>Write <strong>{wordLimit}</strong> for each answer.</p>
          </>
        );

      default:
        return <p><strong>{range}</strong></p>;
    }
  };

  return (
    <div className="idp-instruction-block">
      {instructionContent()}
    </div>
  );
};

// Helper: chuyển số → chữ (cho maxWords phổ biến)
const WORD_MAP: Record<number, string> = {
  1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
};
const wordToText = (n: number): string => WORD_MAP[n] ?? String(n);

export default Instruction;
