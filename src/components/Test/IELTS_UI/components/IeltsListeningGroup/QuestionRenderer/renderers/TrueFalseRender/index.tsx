/**
 * TrueFalseRender
 * Dùng cho: TrueFalseNotGiven (8), YesNoNotGiven (9)
 * Options từ backend: TRUE/FALSE/NOT GIVEN hoặc YES/NO/NOT GIVEN
 * Render: mỗi câu là 1 statement + 3 radio button ngang
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types';
import './style.scss'

interface Props {
    questions: IeltsQuestionPreview[];
    answers: Record<string, IeltsAnswerState>;
    onAnswer: (q: IeltsQuestionPreview, value: string | number) => void;
}

const TrueFalseRender: React.FC<Props> = ({ questions, answers, onAnswer }) => {
    return (
        <div className="tfng-render">
            {questions.map(q => {
                const selected = answers[q.examQuestionId]?.selectedAnswerId ?? null;

                return (
                    <div key={q.examQuestionId} className="tfng-row">
                        {/* Số thứ tự + statement */}
                        <div className="tfng-statement">
                            <span className="tfng-num">{q.orderIndex}.</span>
                            <span className="tfng-text">{q.content}</span>
                        </div>

                        {/* Options ngang: TRUE / FALSE / NOT GIVEN */}
                        <div className="tfng-options">
                            {q.options.map(opt => {
                                const isSelected = selected === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        className={`tfng-opt ${isSelected ? 'tfng-opt--selected' : ''}`}
                                        onClick={() => onAnswer(q, opt.id)}
                                    >
                                        {opt.content}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrueFalseRender;