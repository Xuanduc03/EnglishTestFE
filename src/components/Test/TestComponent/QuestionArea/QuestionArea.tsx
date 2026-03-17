import React, { useMemo } from 'react';
import type { Answer } from '../../../../types/test';
import type { ExamQuestionPreview } from '../../../../pages/Student/FullTest/examAttempt.types';
import ListeningQuestion from '../ListeningQuestion/ListeningQuenstion';
import ReadingSingleQuestion from '../ReadingSingleQuestion';
import ListeningGroupQuestion from '../ListeningGroupQuestion';
import ReadingGroupQuestion from '../ReadingBlockQuestion';
import './QuestionArea.scss';

interface QuestionAreaProps {
  currentQuestion: number;   // 1-based global
  answers: Answer[];
  onAnswer: (questionId: number, answerIndex: number) => void;
  onAudioEnd?: () => void;
  questions: ExamQuestionPreview[];
}

// ── Helpers ────────────────────────────────────────────────────
const stripPrefix = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.replace(/^\s*\([A-D]\)\s*/i, '').replace(/^\s*[A-D]\.\s*/i, '').trim();
};

/**
 * Phân loại câu hỏi theo Part:
 * LISTENING_SINGLE  → Part 1, 2  (câu đơn, có audioUrl riêng)
 * LISTENING_GROUP   → Part 3, 4  (nhóm, có groupAudioUrl)
 * READING_SINGLE    → Part 5     (câu đơn, không audio)
 * READING_GROUP     → Part 6, 7  (nhóm, có groupContent, không audio)
 */
type QuestionCase = 'LISTENING_SINGLE' | 'LISTENING_GROUP' | 'READING_SINGLE' | 'READING_GROUP';

const detectCase = (q: ExamQuestionPreview): QuestionCase => {
  if (q.groupId && q.groupAudioUrl) return 'LISTENING_GROUP';
  if (q.groupId && !q.groupAudioUrl) return 'READING_GROUP';
  if (!q.groupId && q.audioUrl) return 'LISTENING_SINGLE';
  return 'READING_SINGLE';
};

// ── Component ──────────────────────────────────────────────────
const QuestionArea: React.FC<QuestionAreaProps> = ({
  currentQuestion,
  answers,
  onAnswer,
  onAudioEnd,
  questions,
}) => {
  const apiQuestion = questions.find(q => q.orderIndex === currentQuestion - 1);

  if (!apiQuestion) {
    return (
      <div className="question-area-wrapper">
        <div className="question-error">Không tìm thấy câu hỏi #{currentQuestion}</div>
      </div>
    );
  }

  const questionCase = detectCase(apiQuestion);

  const groupQuestions = useMemo(() => {
    if (!apiQuestion.groupId) return [];
    return questions
      .filter(q => q.groupId === apiQuestion.groupId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [questions, apiQuestion.groupId]);

  // 1-based index của câu đầu tiên trong nhóm
  const globalStartIndex = apiQuestion.groupId
    ? (groupQuestions[0]?.orderIndex ?? 0) + 1
    : currentQuestion;

  const renderContent = () => {
    switch (questionCase) {

      // Part 3, 4
      case 'LISTENING_GROUP':
        return (
          <ListeningGroupQuestion
            groupQuestions={groupQuestions}
            currentQuestion={currentQuestion}
            answers={answers}
            onAnswer={onAnswer}
            onAudioEnd={onAudioEnd}
            globalStartIndex={globalStartIndex}
          />
        );

      // Part 6, 7
      case 'READING_GROUP':
        return (
          <ReadingGroupQuestion
            groupQuestions={groupQuestions}
            currentQuestion={currentQuestion}
            answers={answers}
            onAnswer={onAnswer}
            globalStartIndex={globalStartIndex}
          />
        );

      // Part 1, 2 — answer.content null từ BE → blind mode
      case 'LISTENING_SINGLE': {
        const options = apiQuestion.answers.map(a => stripPrefix(a.content));
        return (
          <ListeningQuestion
            question={{
              id: currentQuestion,
              audio: apiQuestion.audioUrl!,
              image: apiQuestion.imageUrl ?? undefined,
              options,
              question: `Câu ${currentQuestion}: ${apiQuestion.content ?? ''}`,
            }}
            selectedAnswer={answers[currentQuestion]?.answer ?? null}
            onAnswer={(idx) => onAnswer(currentQuestion, idx)}
            onAudioEnd={onAudioEnd ?? (() => { })}
          />
        );
      }

      // Part 5
      case 'READING_SINGLE':
      default: {
        const options = apiQuestion.answers.map(a => stripPrefix(a.content));
        return (
          <ReadingSingleQuestion
            question={{
              id: currentQuestion,
              question: `<strong>Câu ${currentQuestion}:</strong> ${apiQuestion.content ?? ''}`,
              options,
            }}
            selectedAnswer={answers[currentQuestion]?.answer ?? null}
            onAnswer={(idx) => onAnswer(currentQuestion, idx)}
          />
        );
      }
    }
  };

  return (
    <div className="question-area-wrapper">
      <div className="question-card-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default QuestionArea;