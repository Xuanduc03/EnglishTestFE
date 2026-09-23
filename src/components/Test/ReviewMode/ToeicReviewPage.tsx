import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examAttemptService } from '../services/examAttemptApi';
import type { ExamReviewDto } from '../../../pages/Student/FullTest/examAttempt.types';
import ToeicReviewQuestionCard from './ToeicReviewQuestionCard';
import './style.scss';

type FilterType = 'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED';

const ToeicReviewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  // ── 1. KHAI BÁO STATE (Tất cả phải nằm trên cùng) ──
  const [reviewData, setReviewData] = useState<ExamReviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // ── 2. GỌI API ──
  useEffect(() => {
    if (!attemptId) return;
    setIsLoading(true);
    examAttemptService.getReview(attemptId)
      .then(data => {
        let globalCounter = 1;
        data.sections.forEach(sec => {
          sec.groups.forEach(grp => {
            grp.questions.forEach(q => {
              (q as any).displayNumber = globalCounter++; // Gắn nhãn displayNumber
            });
          });
        });
        setReviewData(data);
        if (data.sections && data.sections.length > 0) {
          setActiveSectionId(data.sections[0].sectionId);
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message ?? 'Không thể tải dữ liệu chữa bài.');
        setIsLoading(false);
      });
  }, [attemptId]);

  // ── 3. HOOK XỬ LÝ LOGIC (Phải đặt TRƯỚC lệnh return if(isLoading)) ──
  // Dùng ?. để an toàn khi reviewData đang null (lúc loading)
  const activeSection = reviewData?.sections?.find(s => s.sectionId === activeSectionId);

  // Đếm số lượng câu hỏi trong Part hiện tại
  const stats = useMemo(() => {
    if (!activeSection) return { all: 0, correct: 0, wrong: 0, skipped: 0 };
    const allQs = activeSection.groups.flatMap(g => g.questions);
    return {
      all: allQs.length,
      correct: allQs.filter(q => q.isCorrect).length,
      skipped: allQs.filter(q => !q.isAnswered).length,
      wrong: allQs.filter(q => q.isAnswered && !q.isCorrect).length,
    };
  }, [activeSection]);

  // Lọc ra các Group và Question thỏa mãn điều kiện
  const filteredGroups = useMemo(() => {
    if (!activeSection) return [];
    if (activeFilter === 'ALL') return activeSection.groups;

    return activeSection.groups.map(group => {
      const filteredQs = group.questions.filter(q => {
        if (activeFilter === 'CORRECT') return q.isCorrect;
        if (activeFilter === 'SKIPPED') return !q.isAnswered;
        if (activeFilter === 'WRONG') return q.isAnswered && !q.isCorrect;
        return true;
      });
      return { ...group, questions: filteredQs };
    }).filter(group => group.questions.length > 0);
  }, [activeSection, activeFilter]);

  // ── 4. GUARD CLAUSES (Lệnh return sớm chặn màn hình) ──
  if (isLoading) {
    return <div className="trp-loading">Đang tải dữ liệu chữa bài...</div>;
  }

  if (error || !reviewData) {
    return <div className="trp-error">{error}</div>;
  }

  // ── 5. RENDER GIAO DIỆN CHÍNH ──
  return (
    <div className="trp-layout">

      {/* ── HEADER ── */}
      <header className="trp-header">
        <div className="trp-header__left">
          <button className="trp-header__back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <div className="trp-header__title">
            <span className="trp-header__exam-title">{reviewData.examTitle}</span>
            <span className="trp-header__code">Mã đề: {reviewData.examCode}</span>
          </div>
        </div>

        <div className="trp-header__right">
          {reviewData.listeningScore != null && (
            <div className="trp-score-pill trp-score-pill--listening">
              🎧 L: <strong>{reviewData.listeningScore}</strong>
            </div>
          )}
          {reviewData.readingScore != null && (
            <div className="trp-score-pill trp-score-pill--reading">
              📖 R: <strong>{reviewData.readingScore}</strong>
            </div>
          )}
          {reviewData.totalScore != null && (
            <div className="trp-score-pill trp-score-pill--total">
              🏆 Tổng: <strong>{reviewData.totalScore}</strong>
            </div>
          )}
        </div>
      </header>

      {/* ── KHU VỰC CHÍNH ── */}
      <main className="trp-main-container">

        {/* THANH TAB: Danh sách các Part */}
        <div className="part-tabs-container">
          {reviewData.sections.map(sec => (
            <button
              key={sec.sectionId}
              className={`part-tab-btn ${sec.sectionId === activeSectionId ? 'active' : ''}`}
              onClick={() => setActiveSectionId(sec.sectionId)}
            >
              {sec.sectionName}
            </button>
          ))}
        </div>

        {/* THANH BỘ LỌC (Trạng thái câu hỏi) */}
        {activeSection && (
          <div className="review-filters-container">
            <span className="filter-label">Hiển thị:</span>
            <button className={`filter-btn all ${activeFilter === 'ALL' ? 'active' : ''}`} onClick={() => setActiveFilter('ALL')}>
              Tất cả ({stats.all})
            </button>
            <button className={`filter-btn wrong ${activeFilter === 'WRONG' ? 'active' : ''}`} onClick={() => setActiveFilter('WRONG')}>
              ❌ Sai ({stats.wrong})
            </button>
            <button className={`filter-btn skipped ${activeFilter === 'SKIPPED' ? 'active' : ''}`} onClick={() => setActiveFilter('SKIPPED')}>
              ➖ Bỏ qua ({stats.skipped})
            </button>
            <button className={`filter-btn correct ${activeFilter === 'CORRECT' ? 'active' : ''}`} onClick={() => setActiveFilter('CORRECT')}>
              ✅ Đúng ({stats.correct})
            </button>
          </div>
        )}

        {/* NỘI DUNG SAU KHI LỌC */}
        {activeSection && (
          <div className="active-part-content">
            {filteredGroups.length === 0 ? (
              <div className="empty-filter-state">
                <p>Không có câu hỏi nào thỏa mãn điều kiện lọc.</p>
              </div>
            ) : (
              filteredGroups.map(group => {
                const firstQ = group.questions?.[0] as any;
                const audioUrl = group.audioUrl || firstQ?.audioUrl;
                const imageUrl = group.imageUrl || firstQ?.imageUrl;
                const passageHtml = group.passageHtml;

                const hasMedia = !!audioUrl || !!imageUrl || !!passageHtml;

                return (
                  <div key={group.groupId} className="review-group-box">

                    {/* KHU VỰC HIỂN THỊ MEDIA (Audio/Hình ảnh/Bài đọc) */}
                    {hasMedia && (
                      <div className="group-media-section">
                        {audioUrl && (
                          <div className="media-audio">
                            <audio controls src={audioUrl} style={{ width: '100%' }} />
                          </div>
                        )}

                        {imageUrl && (
                          <div className="media-image">
                            <img src={imageUrl} alt="Question context" />
                          </div>
                        )}

                        {passageHtml && (
                          <div
                            className="media-passage"
                            dangerouslySetInnerHTML={{ __html: passageHtml }}
                          />
                        )}
                      </div>
                    )}

                    {/* KHU VỰC DANH SÁCH CÂU HỎI */}
                    <div className="group-questions-section">
                      {group.questions.map(q => (
                        <ToeicReviewQuestionCard key={q.examAnswerId} question={q} displayNumber={0} />
                      ))}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default ToeicReviewPage;