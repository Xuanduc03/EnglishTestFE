import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ActiveExams.scss'; // Import SCSS

// Định nghĩa Type cho dữ liệu truyền vào
export interface ExamItem {
    id: string | number;
    title: string;
    code: string;
    duration: number; // phút
    questionCount: number;
    createdAt: string; // Date string
}

interface ActiveExamsProps {
    exams: ExamItem[];
    isLoading: boolean;
}

const ActiveExams: React.FC<ActiveExamsProps> = ({ exams, isLoading }) => {
    const navigate = useNavigate();

    // Định dạng ngày tháng cho đẹp (VD: 20/12/2026)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    return (
        <section className="active-exams-wrapper">
            {/* HEADER */}
            <div className="card-header">
                <div className="header-title">
                    <span className="icon">⏰</span>
                    <h3>Bài thi đang mở</h3>
                </div>
                <button
                    className="link-all"
                    onClick={() => navigate('/exams')}
                >
                    Xem tất cả →
                </button>
            </div>

            {/* BODY / LIST */}
            <div className="exams-list">

                {/* State: Đang call API */}
                {isLoading && (
                    <div className="loading-state">
                        ⏳ Đang tải danh sách bài thi...
                    </div>
                )}

                {/* State: API trả về mảng rỗng */}
                {!isLoading && exams.length === 0 && (
                    <div className="empty-state">
                        📭 Hiện chưa có bài thi nào đang mở. Hãy quay lại sau nhé!
                    </div>
                )}

                {/* State: Có dữ liệu (Render danh sách) */}
                {!isLoading && exams.map((exam) => (
                    <div key={exam.id} className="exam-item">
                        {/* Ảnh đại diện (Icon thay thế) */}
                        <div className="exam-thumb">🎧</div>

                        {/* Thông tin bài thi */}
                        <div className="exam-info">
                            <h4>{exam.title}</h4>
                            <div className="exam-meta">
                                <span className="code-badge">{exam.code}</span>
                                <span className="dot">•</span>
                                <span>{exam.duration} phút</span>
                                <span className="dot">•</span>
                                <span>{exam.questionCount} câu</span>
                                <span className="dot">•</span>
                                <span>Đăng ngày: {formatDate(exam.createdAt)}</span>
                            </div>
                        </div>

                        {/* Nút Call to Action */}
                        <button
                            className="btn-action"
                            onClick={() => navigate(`/full-test/${exam.id}`)}
                        >
                            Vào thi ngay
                        </button>
                    </div>
                ))}

            </div>
        </section>
    );
};

export default ActiveExams;