import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  isFillInType, isMcqMulti,
  type IeltsReviewGroup,
  type IeltsReviewQuestion,
  type IeltsReviewResult,
  type IeltsReviewSection,
  type IeltsSkillType,
} from '../../types/ieltsExam.types';
import { ieltsAttemptService } from '../../services/IELTS/ieltsAttemp.services';
import './IeltsReviewPage.scss';
import { PassageBox } from './components/PassageBox';
import { QuestionCard, getQuestionStatus } from './components/QuestionCard';

// ─── Types ────────────────────────────────────────────────────
type FilterType = 'all' | 'correct' | 'wrong' | 'skip';

// ─── Helpers ─────────────────────────────────────────────────
const formatBand = (band?: number | null) => {
  if (band == null) return "0.0";
  const num = Number(band);
  return Number.isInteger(num) ? `${num}.0` : num.toFixed(1);
};

const formatDuration = (seconds?: number | null) => {
  if (seconds == null) return "0m 00s";
  const num = Number(seconds);
  const m = Math.floor(num / 60);
  const s = num % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

// ─── Main page ────────────────────────────────────────────────
const IeltsReviewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [result, setResult]     = useState<IeltsReviewResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterType>('all');
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeQ, setActiveQ]   = useState<number>(1);
  const [passageExpanded, setPassageExpanded] = useState<Record<string, boolean>>({});

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    ieltsAttemptService.reviewExam(attemptId)
      .then(data => { setResult(data); setLoading(false); })
      .catch(err => {
        setError(err?.response?.data?.message ?? 'Failed to load review');
        setLoading(false);
      });
  }, [attemptId]);

  // ── Derived ───────────────────────────────────────────────────
  const allQuestions = useMemo(() => {
    if (!result) return [];
    return result.sections.flatMap(s =>
      s.groups.flatMap(g => g.questions)
    );
  }, [result]);

  const counts = useMemo(() => ({
    all:     allQuestions.length,
    correct: allQuestions.filter(q => q.isCorrect).length,
    wrong:   allQuestions.filter(q => q.isAnswered && !q.isCorrect).length,
    skip:    allQuestions.filter(q => !q.isAnswered).length,
  }), [allQuestions]);

  const activeSection: IeltsReviewSection | null =
    result?.sections[activeSectionIdx] ?? null;

  // Questions in active section filtered
  const visibleQuestions = useMemo(() => {
    if (!activeSection) return [];
    const qs = activeSection.groups.flatMap(g => g.questions);
    if (filter === 'all')     return qs;
    if (filter === 'correct') return qs.filter(q => q.isCorrect);
    if (filter === 'wrong')   return qs.filter(q => q.isAnswered && !q.isCorrect);
    if (filter === 'skip')    return qs.filter(q => !q.isAnswered);
    return qs;
  }, [activeSection, filter]);

  // Dot grid — all questions in active section (not filtered)
  const dotQuestions = useMemo(() =>
    activeSection?.groups.flatMap(g => g.questions) ?? [],
    [activeSection],
  );

  // ── Scroll to card ────────────────────────────────────────────
  const scrollToQuestion = useCallback((orderIndex: number) => {
    setActiveQ(orderIndex);
    // If question not visible due to filter, reset filter
    const q = allQuestions.find(q => q.orderIndex === orderIndex);
    if (q) {
      const status = getQuestionStatus(q);
      if (filter !== 'all' && filter !== status) setFilter('all');
    }
    setTimeout(() => {
      cardRefs.current[orderIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }, [allQuestions, filter]);

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="review-page">
        <div className="review-sidebar">
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div
                key={i}
                className="skeleton skeleton--line"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
        <div className="review-main">
          <div className="review-content">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div className="skeleton skeleton--line skeleton--med" />
                <div className="skeleton skeleton--line skeleton--full" />
                <div className="skeleton skeleton--line skeleton--short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="review-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="review-empty">
          <div className="review-empty__icon">!</div>
          <div className="review-empty__text">
            {error ?? 'Review data not found'}
          </div>
          <button onClick={() => navigate(-1)} style={{ marginTop: 12, fontSize: 13, cursor: 'pointer' }}>
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  let sum = 0;
  let divisor = 0;
  if (result.listening?.bandScore != null) { sum += result.listening.bandScore; divisor++; }
  if (result.reading?.bandScore != null) { sum += result.reading.bandScore; divisor++; }
  const overallBand = divisor > 0 ? (Math.round((sum / divisor) * 2) / 2) : 0;

  return (
    <div className="review-page">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="review-sidebar">

        {/* Score block */}
        <div className="sidebar-score">
          <div className="sidebar-score__title">Overall result</div>
          <div className="sidebar-score__overall">
            <span className="val">{formatBand(overallBand)}</span>
            <span className="sub">avg band · {formatDuration(result.durationSeconds)}</span>
          </div>
          <div className="sidebar-score__bands">
            {result.listening && (
              <div className="sidebar-score__band-card sidebar-score__band-card--listening">
                <div className="skill">Listening</div>
                <div className="band">{formatBand(result.listening.bandScore)}</div>
                <div className="correct">
                  {result.listening.correctCount || 0}/{result.listening.totalCount || 0}
                </div>
              </div>
            )}
            {result.reading && (
              <div className="sidebar-score__band-card sidebar-score__band-card--reading">
                <div className="skill">Reading</div>
                <div className="band">{formatBand(result.reading.bandScore)}</div>
                <div className="correct">
                  {result.reading.correctCount || 0}/{result.reading.totalCount || 0}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stat row */}
        <div className="sidebar-stats">
          <div className="sidebar-stats__item sidebar-stats__item--correct">
            <div className="num">{counts.correct}</div>
            <div className="label">Correct</div>
          </div>
          <div className="sidebar-stats__item sidebar-stats__item--wrong">
            <div className="num">{counts.wrong}</div>
            <div className="label">Wrong</div>
          </div>
          <div className="sidebar-stats__item sidebar-stats__item--skip">
            <div className="num">{counts.skip}</div>
            <div className="label">Skipped</div>
          </div>
        </div>

        {/* Filter */}
        <div className="sidebar-filter">
          <div className="sidebar-filter__label">Filter</div>
          {(['all', 'correct', 'wrong', 'skip'] as FilterType[]).map(f => (
            <button
              key={f}
              className={`sidebar-filter__btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              <span style={{ textTransform: 'capitalize' }}>
                {f === 'all' ? 'All questions' : f}
              </span>
              <span className={`filter-badge filter-badge--${f === 'all' ? '' : f}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Section nav */}
        <div className="sidebar-sections">
          <div className="sidebar-sections__label">Sections</div>
          {(['Listening', 'Reading'] as IeltsSkillType[]).map(skill => {
            const skillSections = result.sections.filter(s => s.skillType === skill);
            if (!skillSections.length) return null;
            return (
              <div key={skill}>
                <div className={`sidebar-sections__group-label sidebar-sections__group-label--${skill.toLowerCase()}`}>
                  {skill}
                </div>
                {skillSections.map(sec => {
                  const idx = result.sections.indexOf(sec);
                  const secQs = sec.groups.flatMap(g => g.questions);
                  const secCorrect = secQs.filter(q => q.isCorrect).length;
                  return (
                    <button
                      key={sec.sectionId}
                      className={`sidebar-sections__btn ${activeSectionIdx === idx ? 'active' : ''}`}
                      onClick={() => { setActiveSectionIdx(idx); setFilter('all'); }}
                    >
                      <span className="sec-name">{sec.sectionName}</span>
                      <span className="sec-score">{secCorrect}/{secQs.length}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main panel ──────────────────────────────────────── */}
      <div className="review-main">

        {/* Topbar dot grid */}
        <div className="review-topbar">
          <div className="review-topbar__section-name">
            {activeSection?.sectionName ?? ''}
          </div>
          <div className="review-topbar__dot-track">
            {dotQuestions.map(q => {
              const status = getQuestionStatus(q);
              return (
                <div
                  key={q.examQuestionId}
                  className={[
                    'q-dot',
                    `q-dot--${status}`,
                    activeQ === q.orderIndex ? 'q-dot--active' : '',
                  ].join(' ')
                  }
                  onClick={() => scrollToQuestion(q.orderIndex)}
                  title={`Q${q.orderIndex}`}
                >
                  {q.orderIndex}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="review-content">
          {activeSection?.groups.map(group => {
            const groupQs = group.questions.filter(q => {
              if (filter === 'all')     return true;
              if (filter === 'correct') return q.isCorrect;
              if (filter === 'wrong')   return q.isAnswered && !q.isCorrect;
              if (filter === 'skip')    return !q.isAnswered;
              return true;
            });

            if (!groupQs.length) return null;

            return (
              <React.Fragment key={group.groupId}>
                {/* Passage / Transcript */}
                <PassageBox
                  group={group}
                  skillType={activeSection.skillType}
                  cardRefs={cardRefs}
                />

                {/* Question cards */}
                {groupQs.map(q => {
                  // Skip rendering card if this question is embedded in the passage HTML
                  if (group.passageHtml && new RegExp(`\\{\\{${q.orderIndex}\\}\\}`).test(group.passageHtml)) {
                    return null;
                  }
                  return (
                  <QuestionCard
                    key={q.examQuestionId}
                    question={q}
                  />
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Empty state when filter returns nothing */}
          {visibleQuestions.length === 0 && (
            <div className="review-empty">
              <div className="review-empty__icon">
                {filter === 'correct' ? '✓' : filter === 'wrong' ? '✗' : '—'}
              </div>
              <div className="review-empty__text">
                No {filter === 'skip' ? 'skipped' : filter} questions in this section
              </div>
              <div className="review-empty__sub">
                Try a different filter or section
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IeltsReviewPage;
