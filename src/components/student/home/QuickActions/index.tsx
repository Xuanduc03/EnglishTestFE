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
                <h2>⚡ Ôn luyện nhanh</h2>
                <p>Chọn hình thức phù hợp với mục tiêu của bạn hôm nay</p>
            </div>

            <div className="action-grid">
                {/* THẺ 1: THI THỬ MÔ PHỎNG */}
                <div
                    className="action-card"
                    onClick={() => navigate('/full-test')}
                >
                    <div className="card-icon blue">🎯</div>
                    <h3>Thi thử TOEIC/IELTS</h3>
                    <p className="desc">
                        Mô phỏng kỳ thi thật với áp lực thời gian. Biết ngay điểm số và phân tích điểm mạnh yếu.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-blue">120 phút</span>
                        <span className="tag tag-green">200 câu</span>
                        <span className="tag tag-red">Tính điểm</span>
                    </div>
                    <button className="btn-action primary">
                        Vào phòng thi
                    </button>
                </div>

                {/* THẺ 2: LUYỆN TẬP TỪNG PHẦN */}
                <div
                    className="action-card"
                    onClick={() => navigate('/practice/list')}
                >
                    <div className="card-icon green">📚</div>
                    <h3>Luyện tập theo phần</h3>
                    <p className="desc">
                        Tập trung "cày" vào từng kỹ năng yếu (Part 1 - Part 7) có kèm giải thích đáp án cực kỳ chi tiết.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-green">Không giới hạn</span>
                        <span className="tag tag-blue">Giải thích đáp án</span>
                    </div>
                    <button className="btn-action outline">
                        Bắt đầu luyện tập
                    </button>
                </div>

                {/* THẺ 3: TỪ VỰNG FLASHCARD */}
                <div
                    className="action-card"
                    onClick={() => navigate('/vocabulary/flash-card')}
                >
                    <div className="card-icon purple">🃏</div>
                    <h3>Học từ vựng</h3>
                    <p className="desc">
                        Hệ thống Flashcard thông minh lặp lại ngắt quãng, kèm Audio phát âm giúp nhớ lâu gấp 3 lần.
                    </p>
                    <div className="card-tags">
                        <span className="tag tag-orange">Lật thẻ & Nghe</span>
                        <span className="tag tag-blue">{vocabularyLearned} từ đã thuộc</span>
                    </div>
                    <button className="btn-action outline">
                        Mở bộ từ vựng
                    </button>
                </div>
            </div>
        </section>
    );
};

export default QuickActions;