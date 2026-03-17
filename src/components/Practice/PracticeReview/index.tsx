import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Select, Radio, Spin, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleFilled,
  FilterOutlined,
} from '@ant-design/icons';
import { PracticeService } from '../Services/practice.service';
import type {
  ReviewQuestionDto,
  PracticeQuestionDto,
  PracticeSessionDto,
  PracticePartDto,
} from '../Types/practice.type';
import QuestionDisplay from '../QuestionDisplay';
import QuestionNavigator from '../QuestionNavigator';
import './PracticeReview.scss';

const { Option } = Select;
type FilterType = 'all' | 'correct' | 'wrong' | 'unanswered' | 'marked';

// ─────────────────────────────────────────────────────────
// Map ReviewQuestionDto → PracticeQuestionDto
// để tái dụng QuestionDisplay
// ─────────────────────────────────────────────────────────
function mapToQuestionDto(q: ReviewQuestionDto): PracticeQuestionDto {
  return {
    questionId: q.questionId,
    orderIndex: q.questionNumber,
    questionNumber: q.questionNumber,
    partNumber: q.partNumber,
    content: q.content,
    explanation: q.explanation,
    isMarkedForReview: q.isMarkedForReview,
    selectedAnswerId: q.selectedAnswerId,
    isCorrect: q.isCorrect,
    media: [],
    hasImage: !!q.imageUrl,
    hasAudio: !!q.audioUrl,
    imageUrl: q.imageUrl ?? null,
    audioUrl: q.audioUrl ?? null,
    answers: q.answers.map((a, idx) => ({
      id: a.answerId,
      content: a.content,
      orderIndex: idx,
      answerLabel: String.fromCharCode(65 + idx) as 'A' | 'B' | 'C' | 'D',
      isCorrect: a.isCorrect,
      media: [],
    })),
  };
}

// Build PracticeSessionDto fake để QuestionNavigator dùng được
function buildFakeSession(questions: ReviewQuestionDto[]): PracticeSessionDto {
  const partMap = new Map<number, { name: string; id: string; questions: ReviewQuestionDto[] }>();
  questions.forEach((q) => {
    if (!partMap.has(q.partNumber)) {
      partMap.set(q.partNumber, {
        name: q.partName,
        id: `part-${q.partNumber}`,
        questions: [],
      });
    }
    partMap.get(q.partNumber)!.questions.push(q);
  });

  const parts: PracticePartDto[] = Array.from(partMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([partNumber, { name, id, questions: qs }]) => ({
      partId: id,
      partName: name,
      partNumber,
      questions: qs.map(mapToQuestionDto),
    }));

  return {
    sessionId: '',
    title: 'Xem lại đáp án',
    totalQuestions: questions.length,
    duration: 0,
    parts,
  };
}

const PracticeReview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<ReviewQuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [partFilter, setPartFilter] = useState<string>('all');

  useEffect(() => {
    if (!sessionId) { navigate('/practice/list'); return; }
    PracticeService.getReview(sessionId)
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => navigate('/practice/list'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // answersMap + markedSet cho QuestionDisplay & Navigator
  const safeQuestions = useMemo(() => Array.isArray(questions) ? questions : [], [questions]);

  const answersMap = useMemo(() => {
    const map = new Map<string, string>();
    safeQuestions.forEach((q) => {
      if (q.selectedAnswerId) map.set(q.questionId, q.selectedAnswerId);
    });
    return map;
  }, [safeQuestions]);

  const markedSet = useMemo(
    () => new Set(safeQuestions.filter((q) => q.isMarkedForReview).map((q) => q.questionId)),
    [safeQuestions]
  );

  // Stats
  const stats = useMemo(() => ({
    total: safeQuestions.length,
    correct: safeQuestions.filter((q) => q.isCorrect).length,
    wrong: safeQuestions.filter((q) => q.isAnswered && !q.isCorrect).length,
    unanswered: safeQuestions.filter((q) => !q.isAnswered).length,
    marked: safeQuestions.filter((q) => q.isMarkedForReview).length,
  }), [safeQuestions]);

  const partOptions = useMemo(
    () => Array.from(new Set(safeQuestions.map((q) => q.partName))).sort(),
    [safeQuestions]
  );

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return safeQuestions.filter((q) => {
      const matchPart = partFilter === 'all' || q.partName === partFilter;
      const matchFilter =
        filter === 'all' ||
        (filter === 'correct' && q.isCorrect) ||
        (filter === 'wrong' && q.isAnswered && !q.isCorrect) ||
        (filter === 'unanswered' && !q.isAnswered) ||
        (filter === 'marked' && q.isMarkedForReview);
      return matchPart && matchFilter;
    });
  }, [safeQuestions, filter, partFilter]);

  // Session fake build từ toàn bộ questions (Navigator luôn show tất cả)
  const fakeSession = useMemo(() => buildFakeSession(safeQuestions), [safeQuestions]);

  const safeIndex = Math.min(currentIndex, filteredQuestions.length - 1);
  const currentQ = filteredQuestions[safeIndex];
  const currentMapped = currentQ ? [mapToQuestionDto(currentQ)] : [];

  if (loading) {
    return (
      <div className="practice-review__loading">
        <Spin size="large" />
        <p>Đang tải bài xem lại...</p>
      </div>
    );
  }

  return (
    <div className="practice-review">

      {/* Header */}
      <div className="practice-review__header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/practice/result/${sessionId}`)}
        >
          Quay lại kết quả
        </Button>
        <h1>Xem lại đáp án</h1>
        <Button onClick={() => navigate('/practice/list')}>Về trang luyện tập</Button>
      </div>

      {/* Summary */}
      <div className="practice-review__summary">
        <div className="summary-stat summary-stat--correct">
          <CheckCircleFilled />
          <span className="val">{stats.correct}</span>
          <span className="lbl">Đúng</span>
        </div>
        <div className="summary-stat summary-stat--wrong">
          <CloseCircleFilled />
          <span className="val">{stats.wrong}</span>
          <span className="lbl">Sai</span>
        </div>
        <div className="summary-stat summary-stat--unanswered">
          <MinusCircleFilled />
          <span className="val">{stats.unanswered}</span>
          <span className="lbl">Bỏ qua</span>
        </div>
      </div>

      {/* Filters */}
      <div className="practice-review__filters">
        <FilterOutlined style={{ color: '#8c8c8c' }} />
        <Radio.Group
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setCurrentIndex(0); }}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="all">Tất cả ({stats.total})</Radio.Button>
          <Radio.Button value="correct">Đúng ({stats.correct})</Radio.Button>
          <Radio.Button value="wrong">Sai ({stats.wrong})</Radio.Button>
          <Radio.Button value="unanswered">Bỏ qua ({stats.unanswered})</Radio.Button>
          {stats.marked > 0 && (
            <Radio.Button value="marked">Đánh dấu ({stats.marked})</Radio.Button>
          )}
        </Radio.Group>

        {partOptions.length > 1 && (
          <Select
            value={partFilter}
            onChange={(v) => { setPartFilter(v); setCurrentIndex(0); }}
            size="small"
            style={{ minWidth: 130 }}
          >
            <Option value="all">Tất cả Part</Option>
            {partOptions.map((p) => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        )}

        <Tag style={{ marginLeft: 'auto' }}>
          {filteredQuestions.length > 0 ? safeIndex + 1 : 0} / {filteredQuestions.length} câu
        </Tag>
      </div>

      {/* Body */}
      {filteredQuestions.length === 0 ? (
        <div className="practice-review__empty">
          Không có câu hỏi nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="practice-review__body">

          {/* Tái dụng QuestionNavigator */}
          <div className="practice-review__navigator">
            <QuestionNavigator
              session={fakeSession}
              currentIndex={safeIndex}
              answers={answersMap}
              markedForReview={markedSet}
              onNavigate={(idx) => setCurrentIndex(idx)}
            />
          </div>

          <div className="practice-review__content">
            <div className="review-nav-btns">
              <Button
                disabled={safeIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                ← Câu trước
              </Button>
              <Button
                type="primary"
                disabled={safeIndex >= filteredQuestions.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(filteredQuestions.length - 1, i + 1))}
              >
                Câu tiếp →
              </Button>
            </div>

            {/* Tái dụng QuestionDisplay — read-only */}
            <QuestionDisplay
              questions={currentMapped}
              partNumber={currentQ?.partNumber ?? 1}
              answersMap={answersMap}
              markedSet={markedSet}
              onSelectAnswer={() => {}}
              onMarkForReview={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeReview;
