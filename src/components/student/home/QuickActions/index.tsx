import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.scss';

interface QuickActionsProps {
    vocabularyLearned?: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({ vocabularyLearned = 1250 }) => {
    const navigate = useNavigate();

    return (
        <section className="quick-actions-wrapper">
            <div className="section-header">
            <h2>⚡ Quick Practice</h2>
                <p>Choose the format that fits your goals today</p>
            </div>

            <div className="action-grid">
                {/* THẺ 1: THI THỬ MÔ PHỎNG */}
                <div
                    className="action-card"
                    onClick={() => navigate('/full-test')}
                >
                    <div className="card-icon blue">🎯</div>
                    <h3>Mock TOEIC/IELTS Test</h3>
                    <p className="desc">
                        Simulate the real exam with time pressure. Get your score and a detailed breakdown of strengths and weaknesses.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-blue">120 mins</span>
                        <span className="tag tag-green">200 questions</span>
                        <span className="tag tag-red">Scored</span>
                    </div>
                    <button className="btn-action primary">
                        Enter Exam Room
                    </button>
                </div>

                {/* THẺ 2: LUYỆN TẬP TỪNG PHẦN */}
                <div
                    className="action-card"
                    onClick={() => navigate('/practice/list')}
                >
                    <div className="card-icon green">📚</div>
                    <h3>Section Practice</h3>
                    <p className="desc">
                        Focus on drilling each weak skill (Part 1 – Part 7) with detailed answer explanations.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-green">Unlimited</span>
                        <span className="tag tag-blue">With Explanations</span>
                    </div>
                    <button className="btn-action outline">
                        Start Practicing
                    </button>
                </div>

                {/* THẺ 3: TỪ VỰNG FLASHCARD */}
                <div
                    className="action-card"
                    onClick={() => navigate('/vocabulary/flash-card')}
                >
                    <div className="card-icon purple">🃏</div>
                    <h3>Vocabulary Flashcards</h3>
                    <p className="desc">
                        Smart spaced-repetition Flashcard system with audio pronunciation — remember 3x longer.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-orange">Flip &amp; Listen</span>
                        <span className="tag tag-blue">{vocabularyLearned} words learned</span>
                    </div>
                    <button className="btn-action outline">
                        Open Vocabulary
                    </button>
                </div>
            </div>
        </section>
    );
};

export default QuickActions;