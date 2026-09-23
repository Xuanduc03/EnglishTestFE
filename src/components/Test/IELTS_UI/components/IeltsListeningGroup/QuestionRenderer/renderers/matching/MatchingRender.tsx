/**
 * MatchingRender
 * Dùng cho: Matching (12) — match từng câu với 1 option từ danh sách chung
 * Pattern trong JSON: nhiều câu (Q27-30) dùng chung options A-F
 * Mỗi câu có options đầy đủ (lặp lại) → dùng options của câu đầu làm legend chung
 * Mỗi câu render 1 dropdown/select chọn 1 letter
 */
import React, { useMemo } from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types';
import "./style.scss"

interface Props {
    questions: IeltsQuestionPreview[];
    answers: Record<string, IeltsAnswerState>;
    onAnswer: (q: IeltsQuestionPreview, value: string | number) => void;
}

const MatchingRender: React.FC<Props> = ({ questions, answers, onAnswer }) => {
    // Danh sách options chung — lấy từ câu đầu tiên
    // Các câu còn lại có options giống hệt (backend lặp lại)
    const sharedOptions = useMemo(
        () => questions[0]?.options ?? [],
        [questions],
    );

    return (
        <div className="matching-render">
            {/* Legend: danh sách options chung hiện 1 lần */}
            {sharedOptions.length > 0 && (
                <div className="matching-legend">
                    <div className="matching-legend__title">Comments:</div>
                    {sharedOptions.map(opt => (
                        <div key={opt.id} className="matching-legend__item">
                            <span className="matching-legend__letter">
                                {String.fromCharCode(64 + opt.orderIndex)}.
                            </span>
                            <span className="matching-legend__text">{opt.content}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Mỗi câu: statement + dropdown chọn letter */}
            <div className="matching-questions">
                {questions.map(q => {
                    const selected = answers[q.examQuestionId]?.selectedAnswerId ?? '';

                    return (
                        <div key={q.examQuestionId} className="matching-row">
                            <div className="matching-row__content">
                                <span className="matching-row__num">{q.orderIndex}.</span>
                                {/* Content thường là "What comment do the students make about X?" */}
                                <span className="matching-row__text">
                                    {/* Lấy phần trước dấu \n (bỏ phần "Comments: A. B. C..." lặp lại) */}
                                    {q.content?.split('\n')[0]?.trim() ?? q.content}
                                </span>
                            </div>

                            <select
                                className={`matching-select ${selected ? 'matching-select--answered' : ''}`}
                                value={selected}
                                onChange={e => onAnswer(q, e.target.value)}
                            >
                                <option value="">— Choose —</option>
                                {sharedOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>
                                        {String.fromCharCode(64 + opt.orderIndex)}. {opt.content}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MatchingRender;