/**
 * TableCompletion — Dạng bảng có ô trống
 * DB: Group.passageHtml chứa HTML bảng với {{orderIndex}} placeholder
 *     Nếu không có template → fallback list inputs dọc
 *
 * 2 chế độ:
 * 1. Template mode: passageHtml có <table>...</table> với {{N}} → render inline inputs
 * 2. Fallback mode: chỉ có questions list → render list inputs + static table nếu group có
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../types/ieltsExam.types';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  groupTemplate?: string | null;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

// Parse HTML template {{orderIndex}} → inline input/select
const TemplateTable: React.FC<{
  template: string;
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}> = ({ template, questions, answers, onAnswer }) => {
  const parts = template.split(/(\{\{\d+\}\})/g);
  return (
    <div className="idp-table-wrapper">
      {parts.map((part, i) => {
        const match = part.match(/\{\{(\d+)\}\}/);
        if (!match) return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
        const orderIdx = parseInt(match[1], 10);
        const q = questions.find(q => q.orderIndex === orderIdx);
        if (!q) return <span key={i} className="q-badge">{orderIdx}</span>;
        
        const hasOptions = q.options && q.options.length > 0;
        
        return (
          <span key={i} className="idp-inline-input-wrapper">
            <span className="q-badge">{orderIdx}</span>
            {hasOptions ? (
              <select
                className="idp-text-input"
                value={answers[q.examQuestionId]?.selectedAnswerId ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
              >
                <option value="">— Select —</option>
                {q.options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.content}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="idp-text-input"
                value={answers[q.examQuestionId]?.textAnswer ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

const TableCompletionRender: React.FC<Props> = ({
  questions, answers, groupTemplate, onAnswer,
}) => {
  // Extract shared options if any question has options to display a legend box
  const sharedOptions = questions.find(q => q.options?.length > 0)?.options || [];

  if (groupTemplate) {
    return (
      <div className="table-completion-container">
        {sharedOptions.length > 0 && (
          <div className="options-legend-box" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', color: '#475569' }}>Available Options:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
              {sharedOptions.map(opt => (
                <div key={opt.id} className="legend-item" style={{ fontSize: '14px', color: '#1e293b' }}>
                  <strong>{String.fromCharCode(64 + opt.orderIndex)}.</strong> {opt.content}
                </div>
              ))}
            </div>
          </div>
        )}
        <TemplateTable
          template={groupTemplate}
          questions={questions}
          answers={answers}
          onAnswer={onAnswer}
        />
      </div>
    );
  }

  // Fallback: vertical input/select list
  return (
    <div className="table-inputs-list">
      {sharedOptions.length > 0 && (
        <div className="options-legend-box" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', color: '#475569' }}>Available Options:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
            {sharedOptions.map(opt => (
              <div key={opt.id} className="legend-item" style={{ fontSize: '14px', color: '#1e293b' }}>
                <strong>{String.fromCharCode(64 + opt.orderIndex)}.</strong> {opt.content}
              </div>
            ))}
          </div>
        </div>
      )}
      {questions.map(q => {
        const hasOptions = q.options && q.options.length > 0;
        return (
          <div className="input-row" key={q.examQuestionId}>
            <span className="q-badge">{q.orderIndex}</span>
            {hasOptions ? (
              <select
                className="idp-text-input"
                style={{ minWidth: '200px' }}
                value={answers[q.examQuestionId]?.selectedAnswerId ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
              >
                <option value="">— Select —</option>
                {q.options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {String.fromCharCode(64 + opt.orderIndex)}. {opt.content}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="idp-text-input"
                value={answers[q.examQuestionId]?.textAnswer ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
                placeholder={`Max ${q.maxWords} word(s)`}
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TableCompletionRender;
