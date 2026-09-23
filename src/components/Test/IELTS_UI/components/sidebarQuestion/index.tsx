import React, { useMemo } from 'react';
import type { IeltsSectionPreview } from '../../../types/ieltsExam.types';
import './style.scss';

interface Props {
    totalQuestions: number;
    currentQuestion: number;
    answers: Record<number, string>;
    onNavigate: (index: number) => void;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    sections: IeltsSectionPreview[];
    /** Optional: seconds left to display in sidebar timer */
    timeLeftSeconds?: number;
}

/** Format seconds → "MM:SS" */
const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const IeltsQuestionSidebar: React.FC<Props> = ({
    currentQuestion, answers, onNavigate, onNext, onPrev, onSubmit, sections, timeLeftSeconds,
}) => {
    const flatQuestionIndexes = useMemo(() => {
        return sections
            .flatMap(s => s.groups.flatMap(g => g.questions))
            .map(q => q.orderIndex)
            .sort((a, b) => a - b);
    }, [sections]);

    // Timer colour class
    const timerClass = timeLeftSeconds === undefined ? '' :
        timeLeftSeconds <= 300  ? 'sidebar-timer__value--danger' :
        timeLeftSeconds <= 900  ? 'sidebar-timer__value--warning' : '';

    return (
        <div className="ielts-sidebar">

            {/* ── Timer ─────────────────────────────────── */}
            {timeLeftSeconds !== undefined && (
                <div className="sidebar-timer">
                    <div className="sidebar-timer__label">Thời gian còn lại</div>
                    <div className={`sidebar-timer__value ${timerClass}`}>
                        {fmtTime(timeLeftSeconds)}
                    </div>
                </div>
            )}

            {/* ── NỘP BÀI ───────────────────────────────── */}
            <button className="sidebar-submit" onClick={onSubmit}>
                NỘP BÀI
            </button>

          

            {/* ── Question navigator ────────────────────── */}
            <div className="sidebar-questions-container">
                {sections.map((section) => {
                    const sectionQIndexes = section.groups
                        .flatMap(g => g.questions)
                        .map(q => q.orderIndex)
                        .sort((a, b) => a - b);

                    if (sectionQIndexes.length === 0) return null;

                    return (
                        <div key={section.sectionId} className="sidebar-section-group">
                            <div className="sidebar-section-title">
                                {section.sectionName}
                            </div>

                            <div className="sidebar-section-grid">
                                {sectionQIndexes.map((qIdx) => {
                                    const isAnswered = !!answers[qIdx];
                                    const isCurrent  = currentQuestion === qIdx;

                                    return (
                                        <button
                                            key={qIdx}
                                            onClick={() => onNavigate(qIdx)}
                                            className={`sidebar-q-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                                        >
                                            {qIdx}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Prev / Next navigation ────────────────── */}
            <div className="sidebar-nav">
                <button onClick={onPrev} disabled={currentQuestion === flatQuestionIndexes[0]}>
                    ◀
                </button>
                <button onClick={onNext} disabled={currentQuestion === flatQuestionIndexes[flatQuestionIndexes.length - 1]}>
                    ▶
                </button>
            </div>
        </div>
    );
};

export default IeltsQuestionSidebar;