/**
 * MapLabeling — Điền nhãn bản đồ / sơ đồ
 *
 * Mỗi câu có options A/B/C… → render <select>.
 * Answer lưu vào selectedAnswerId (option.id), KHÔNG phải textAnswer.
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types';
import './style.scss';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  mapImageUrl?: string | null;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const MapLabelingRender: React.FC<Props> = ({
  questions, answers, mapImageUrl, onAnswer,
}) => (
  <div className="idp-map-labeling-container">

    {/* Cột Trái: Ảnh Bản đồ / Sơ đồ */}
    {mapImageUrl && (
      <div className="map-image-panel">
        <img src={mapImageUrl} alt="Map / Diagram" className="map-image" />
      </div>
    )}

    {/* Cột Phải: Danh sách select đáp án */}
    <div className="map-inputs-panel">
      {questions.map(q => {
        // Đáp án đang chọn (option.id)
        const selectedId = answers[q.examQuestionId]?.selectedAnswerId ?? '';

        // Nếu câu có options → render <select>
        // Nếu không có options → fallback text input (phòng hờ)
        const hasOptions = q.options && q.options.length > 0;

        return (
          <div className="ielts-map-q-card" key={q.examQuestionId}>
            {/* Số thứ tự + nội dung câu */}
            <div className="q-card-badge">
              <div className="badge-number">{q.orderIndex}</div>
              {q.content && (
                <div
                  className="q-text"
                  dangerouslySetInnerHTML={{ __html: q.content }}
                />
              )}
            </div>

            {/* Input / Select */}
            <div className="q-card-content">
              {hasOptions ? (
                <select
                  className="idp-select map-label-select"
                  value={selectedId}
                  onChange={e => onAnswer(q, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {q.options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.content ?? opt.id}
                    </option>
                  ))}
                </select>
              ) : (
                /* Fallback: không có options → text input */
                <input
                  type="text"
                  className="idp-standard-input"
                  value={answers[q.examQuestionId]?.textAnswer ?? ''}
                  onChange={e => onAnswer(q, e.target.value)}
                  placeholder={`Max ${q.maxWords} word(s)`}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>

  </div>
);

export default MapLabelingRender;