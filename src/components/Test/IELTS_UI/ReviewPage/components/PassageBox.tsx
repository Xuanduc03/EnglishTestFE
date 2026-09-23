import React, { useState } from 'react';
import type { IeltsReviewGroup, IeltsSkillType, IeltsReviewQuestion } from '../../../types/ieltsExam.types';

interface PassageBoxProps {
  group: IeltsReviewGroup;
  skillType: IeltsSkillType;
  cardRefs?: React.MutableRefObject<Record<number, HTMLElement | null>>;
  onRenderedInline?: (orderIndexes: number[]) => void;
}

const InlineGapReview: React.FC<{
  q: IeltsReviewQuestion;
  cardRefs?: React.MutableRefObject<Record<number, HTMLElement | null>>;
}> = ({ q, cardRefs }) => {
  const isCorrect = q.isCorrect;
  const isSkip = !q.isAnswered;
  
  // Resolve user answer display
  let userAnswer = '';
  if (q.userTextAnswer) userAnswer = q.userTextAnswer;
  else if (q.userSelectedIds && q.userSelectedIds.length > 0) userAnswer = q.userSelectedIds.join(', ');
  else if (q.userSelectedId) {
    const opt = q.options?.find(o => o.id === q.userSelectedId);
    userAnswer = opt?.content || q.userSelectedId;
  }
  
  const correctLabels = q.correctAnswers?.map(a => a.content).filter(Boolean).join(' / ') || '';

  let statusClass = 'skip';
  if (isCorrect) statusClass = 'correct';
  else if (!isSkip) statusClass = 'wrong';

  return (
    <span 
      className={`inline-gap-review inline-gap-review--${statusClass}`} 
      id={`q-${q.orderIndex}`}
      ref={(el) => { if (cardRefs) cardRefs.current[q.orderIndex] = el; }}
    >
      <span className="gap-num">{q.orderIndex}</span>
      <span className="gap-user">{isSkip ? '—' : userAnswer}</span>
      {!isCorrect && <span className="gap-correct">{correctLabels}</span>}
    </span>
  );
};

export const PassageBox: React.FC<PassageBoxProps> = ({ group, skillType, cardRefs, onRenderedInline }) => {
  const [collapsed, setCollapsed] = useState(false);

  const hasContent = skillType === 'Listening'
    ? !!group.transcript
    : !!group.passageHtml;

  if (!hasContent) return null;

  const title = skillType === 'Listening' ? 'Transcript / Passage' : 'Passage';

  // Parse passageHtml for {{orderIndex}}
  const renderPassage = () => {
    if (!group.passageHtml) return null;
    
    const template = group.passageHtml;
    // Check if it actually contains placeholders
    if (!/\{\{\d+\}\}/.test(template)) {
      return <div dangerouslySetInnerHTML={{ __html: template }} />;
    }

    const parts = template.split(/(\{\{\d+\}\})/g);
    const renderedIndexes: number[] = [];

    const elements = parts.map((part, i) => {
      const match = part.match(/\{\{(\d+)\}\}/);
      if (!match) return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      
      const orderIdx = parseInt(match[1], 10);
      const q = group.questions.find(q => q.orderIndex === orderIdx);
      if (!q) {
        return <span key={i} className="inline-gap-missing">{orderIdx}</span>;
      }
      
      renderedIndexes.push(orderIdx);
      return <InlineGapReview key={i} q={q} cardRefs={cardRefs} />;
    });

    // Notify parent which questions were rendered inline so they can be hidden from the card list
    if (onRenderedInline && renderedIndexes.length > 0) {
      setTimeout(() => onRenderedInline(renderedIndexes), 0);
    }

    return <div className="idp-table-wrapper">{elements}</div>;
  };

  return (
    <div className="review-passage">
      <div
        className="review-passage__header"
        onClick={() => setCollapsed(p => !p)}
      >
        <span className="review-passage__title">{title}</span>
        <span className="review-passage__toggle">
          {collapsed ? 'Show' : 'Hide'}
        </span>
      </div>
      <div className={`review-passage__body ${collapsed ? 'collapsed' : ''}`}>
        {skillType === 'Listening' && group.transcript ? (
          <p>{group.transcript}</p>
        ) : null}
        
        {/* Render passage template with inline blanks if present */}
        {renderPassage()}
      </div>
    </div>
  );
};
