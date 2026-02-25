import type { Question, TestSection } from '../types/test';
import { DUMMY_QUESTIONS, LISTENING_QUESTIONS_COUNT, READING_QUESTIONS_START } from '../constants/test';

export const getQuestionData = (id: number): Question => {
  for (const q of DUMMY_QUESTIONS) {
    if (q.type === 'reading_block') {
      const found = q.questions.find(subQ => subQ.id === id);
      if (found) return q;
    } else if (q.id === id) {
      return q;
    }
  }

  return {
    id,
    part: id <= 100 ? (id <= 6 ? 1 : (id <= 31 ? 2 : (id <= 70 ? 3 : 4))) : (id <= 130 ? 5 : (id <= 146 ? 6 : 7)),
    type: 'reading_single',
    question: `Đây là nội dung cho câu hỏi số ${id}. Hãy chọn một đáp án.`,
    options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']
  };
};

export const getPartTooltip = (id: number): string => {
  if (id >= 1 && id <= 6) return 'Part 1';
  if (id >= 7 && id <= 31) return 'Part 2';
  if (id >= 32 && id <= 70) return 'Part 3';
  if (id >= 71 && id <= 100) return 'Part 4';
  if (id >= 101 && id <= 130) return 'Part 5';
  if (id >= 131 && id <= 146) return 'Part 6';
  return 'Part 7';
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export const isListeningQuestion = (questionId: number): boolean => {
  return questionId >= 1 && questionId <= LISTENING_QUESTIONS_COUNT;
};

export const isReadingQuestion = (questionId: number): boolean => {
  return questionId >= READING_QUESTIONS_START && questionId <= 200;
};

export const getCurrentSection = (questionId: number): TestSection => {
  return isListeningQuestion(questionId) ? 'listening' : 'reading';
};