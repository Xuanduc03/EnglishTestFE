import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types';
import './style.scss';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  groupTemplate?: string | null;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

// ── 1. TEMPLATE MODE (inline) ──
const TemplateWithInputs: React.FC<{
  template: string;
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}> = ({ template, questions, answers, onAnswer }) => {
  const parts = template.split(/(\{\{\d+\}\})/g);

  return (
    <div className="fc-template-card">
      {parts.map((part, i) => {
        const match = part.match(/\{\{(\d+)\}\}/);
        if (!match) return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;

        const orderIdx = parseInt(match[1], 10);
        const q = questions.find(q => q.orderIndex === orderIdx);
        if (!q) return <span key={i} className="badge-missing">{orderIdx}</span>;

        return (
          <span key={i} className="fc-inline-wrap">
            <span className="badge-number">{orderIdx}</span>
            <input
              type="text"
              className="fc-inline-input"
              value={answers[q.examQuestionId]?.textAnswer ?? ''}
              onChange={e => onAnswer(q, e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </span>
        );
      })}
    </div>
  );
};

// ── 2. TWO COLUMN MODE (form với mỗi câu một dòng) ──
const TwoColumnForm: React.FC<{
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}> = ({ questions, answers, onAnswer }) => {
  return (
    <div className="fc-two-col">
      {/* Cột trái: nội dung form */}
      <div className="fc-left">
        {questions.map((q) => (
          <div key={q.examQuestionId} className="fc-left-row">
            <div
              className="fc-left-text"
              dangerouslySetInnerHTML={{ __html: q.content || '' }}
            />
          </div>
        ))}
      </div>

      {/* Cột phải: badge + input */}
      <div className="fc-right">
        {questions.map((q) => (
          <div key={q.examQuestionId} className="fc-right-row">
            <span className="fc-badge">{q.orderIndex}</span>
            <input
              type="text"
              className="fc-input"
              value={answers[q.examQuestionId]?.textAnswer ?? ''}
              onChange={e => onAnswer(q, e.target.value)}
              placeholder={`Max ${q.maxWords} word(s)`}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 3. MAIN COMPONENT ──
const FormCompletionRender: React.FC<Props> = ({
  questions, answers, groupTemplate, onAnswer,
}) => {
  const isValidTemplate = groupTemplate && groupTemplate.includes('{{');
  if (isValidTemplate) {
    return <TemplateWithInputs template={groupTemplate} questions={questions} answers={answers} onAnswer={onAnswer} />;
  }

  return <TwoColumnForm questions={questions} answers={answers} onAnswer={onAnswer} />;
};

export default FormCompletionRender;