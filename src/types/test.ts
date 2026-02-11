export interface Answer {
  answer: number | null;
  marked: boolean;
}

export interface BaseQuestion {
  id: number;
  part: number;
}

export interface ListeningQuestion extends BaseQuestion {
  type: 'listening';
  image?: string;
  audio: string;
  options: string[];
}

export interface ReadingSingleQuestion extends BaseQuestion {
  type: 'reading_single';
  question: string;
  options: string[];
}

export interface ReadingBlockQuestion extends BaseQuestion {
  type: 'reading_block';
  passage: string;
  questions: {
    id: number;
    text: string;
    options: string[];
  }[];
}

export type Question = ListeningQuestion | ReadingSingleQuestion | ReadingBlockQuestion;

export interface TestState {
  currentQuestion: number;
  answers: Answer[];
  timeLeft: number;
  isTestCompleted: boolean;
}