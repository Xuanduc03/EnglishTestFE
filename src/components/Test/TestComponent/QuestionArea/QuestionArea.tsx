import React from 'react';
import type { Answer, Question } from '../../../../types/test';
import { getQuestionData } from '../../../../utils/testHelper';
import ListeningQuestion from '../ListeningQuestion/ListeningQuenstion';
import ReadingSingleQuestion from '../ReadingSingleQuestion/ReadingSingleQuestion';
import ReadingBlockQuestion from '../ReadingBlockQuestion/ReadingBlockQuestion';
import './QuestionArea.scss';

interface QuestionAreaProps {
  currentQuestion: number;
  answers: Answer[];
  onAnswer: (questionId: number, answerIndex: number) => void;
  onAudioEnd?: () => void; // For Listening questions
}

const QuestionArea: React.FC<QuestionAreaProps> = ({
  currentQuestion,
  answers,
  onAnswer,
  onAudioEnd,
}) => {
  const questionData = getQuestionData(currentQuestion);

  const renderQuestion = () => {
    switch (questionData.type) {
      case 'listening':
        return (
          <ListeningQuestion
            question={questionData}
            selectedAnswer={answers[currentQuestion].answer}
            onAnswer={(idx: any) => onAnswer(currentQuestion, idx)}
            onAudioEnd={onAudioEnd || (() => { })}
          />
        );
      case 'reading_single':
        return (
          <ReadingSingleQuestion
            question={questionData}
            selectedAnswer={answers[currentQuestion].answer}
            onAnswer={(idx: any) => onAnswer(currentQuestion, idx)}
          />
        );
      case 'reading_block':
        return (
          <ReadingBlockQuestion
            question={questionData}
            answers={answers}
            onAnswer={onAnswer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="question-area">
      <div className="question-section">
        {renderQuestion()}
      </div>
    </div>
  );
};

export default QuestionArea;