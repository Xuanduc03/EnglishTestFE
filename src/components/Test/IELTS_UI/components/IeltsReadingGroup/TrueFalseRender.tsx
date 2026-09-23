/**
 * TrueFalseNotGiven / YesNoNotGiven
 * DB: question.content = "The binoculars had been left in Southampton."
 *     question.options  = [{id, content:"TRUE"}, {id,"FALSE"}, {id,"NOT GIVEN"}]
 * UI: badge + statement + 3 radio options (TRUE/FALSE/NOT GIVEN)
 */
import React from 'react';
import { IeltsQuestionType, type IeltsAnswerState, type IeltsQuestionPreview } from '../../../types/ieltsExam.types';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string | number) => void;
}

const TrueFalseRender: React.FC<Props> = ({ questions, answers, onAnswer }) => {
  const isYesNo = questions[0]?.questionType === IeltsQuestionType.YesNoNotGiven;
  const opts = isYesNo ? ['YES', 'NO', 'NOT GIVEN'] : ['TRUE', 'FALSE', 'NOT GIVEN'];

  return (
    <div className="tfng-list">
      {questions.map(q => (
        <div className="tfng-item" key={q.examQuestionId}>
          <div className="tfng-q-row">
            <span className="q-badge">{q.orderIndex}</span>
            <span
              className="q-text"
              dangerouslySetInnerHTML={{ __html: q.content ?? '' }}
            />
          </div>
          <div className="tfng-options">
            {opts.map((opt, idx) => {
              const optionId = q.options[idx]?.id;
              const selected = answers[q.examQuestionId]?.selectedAnswerId === optionId;
              return (
                <label
                  key={opt}
                  className={`tfng-radio-label ${selected ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.examQuestionId}`}
                    checked={selected}
                    onChange={() => optionId && onAnswer(q, optionId)}
                  />
                  <span className="opt-text">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrueFalseRender;
