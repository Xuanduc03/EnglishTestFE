/**
 * IeltsReadingGroup — Fixed version
 * Fix 1: type 4 (ShortAnswer) options rỗng → ShortAnswerRender thay vì TableCompletionRender
 * Fix 2: thêm MapLabeling (5) — reuse MapLabelingRender từ Listening
 * Fix 3: verify TrueFalseNotGiven = 8 đúng với enum
 * Fix 4: Matching (12) đã có → OK
 */
import React, { useState, useMemo } from 'react';

import TrueFalseRender            from './TrueFalseRender';
import TableCompletionRender      from './TableCompletionRender';
import MatchingInformationRender  from './MatchingInformationRender';
import MatchingSentenceEndsRender from './MatchingSentenceEndsRender';
import MatchingHeadingRender      from './MatchingHeadingRender';

// Shared với Listening
import McqRender                from '../IeltsListeningGroup/QuestionRenderer/renderers/mcq/McqRender';
import SentenceCompletionRender from '../IeltsListeningGroup/QuestionRenderer/renderers/sentenceCompletion/SentenceCompletionRender';
import ShortAnswerRender        from '../IeltsListeningGroup/QuestionRenderer/renderers/shortAnswer/ShortAnswerRender';
import NoteCompletionRender     from '../IeltsListeningGroup/QuestionRenderer/renderers/noteCompletion/NoteCompletionRender';
// FIX 2: thêm MapLabelingRender
import MapLabelingRender        from '../IeltsListeningGroup/QuestionRenderer/renderers/mapLabeling/MapLabelingRender';
import MatchingRender           from '../IeltsListeningGroup/QuestionRenderer/renderers/matching/MatchingRender';

import {
  IeltsQuestionType,
  type IeltsAnswerState,
  type IeltsGroupPreview,
  type IeltsQuestionPreview,
  type IeltsSectionPreview,
} from '../../../types/ieltsExam.types';

interface Props {
  section: IeltsSectionPreview;
  activeGroup: IeltsGroupPreview;
  answers: Record<string, IeltsAnswerState>;
  currentQuestionOrderIndex: number;
  onAnswer: (q: IeltsQuestionPreview, value: string | number) => void;
  onMarkToggle: (examQuestionId: string) => void;
  onSwitchGroup: (groupId: string) => void;
}

const groupByType = (qs: IeltsQuestionPreview[]): IeltsQuestionPreview[][] =>
  qs.reduce<IeltsQuestionPreview[][]>((acc, q) => {
    const last = acc[acc.length - 1];
    if (!last || last[0].questionType !== q.questionType) acc.push([q]);
    else last.push(q);
    return acc;
  }, []);

const getInstruction = (
  type: IeltsQuestionType,
  block: IeltsQuestionPreview[],
): React.ReactNode => {
  const first = block[0];
  const last  = block[block.length - 1];
  const range = block.length === 1
    ? `Question ${first.orderIndex}`
    : `Questions ${first.orderIndex}–${last.orderIndex}`;

  switch (type) {
    case IeltsQuestionType.TrueFalseNotGiven:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Do the following statements agree with the information in the passage?</p>
          <div className="tfng-legend">
            <div><strong>TRUE</strong> — agrees with the passage</div>
            <div><strong>FALSE</strong> — contradicts the passage</div>
            <div><strong>NOT GIVEN</strong> — no information on this</div>
          </div>
        </>
      );
    case IeltsQuestionType.YesNoNotGiven:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Do the following statements agree with the views of the writer?</p>
          <div className="tfng-legend">
            <div><strong>YES</strong> — agrees with the writer</div>
            <div><strong>NO</strong> — disagrees with the writer</div>
            <div><strong>NOT GIVEN</strong> — impossible to say</div>
          </div>
        </>
      );
    case IeltsQuestionType.TableCompletion:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Complete the table below.</p>
          <p>Choose <strong>NO MORE THAN {first.maxWords} WORDS</strong> from the text for each answer.</p>
        </>
      );
    case IeltsQuestionType.FormCompletion:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Complete the form below.</p>
          <p>Choose <strong>NO MORE THAN {first.maxWords} WORDS</strong> from the text for each answer.</p>
        </>
      );
    // FIX 2: thêm instruction cho MapLabeling
    case IeltsQuestionType.MapLabeling:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Label the diagram/map below.</p>
          <p>Choose <strong>NO MORE THAN {first.maxWords} WORDS</strong> from the text for each answer.</p>
        </>
      );
    case IeltsQuestionType.MatchingInformation:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Which paragraph contains the following information?</p>
        </>
      );
    case IeltsQuestionType.MatchingHeading:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Choose the correct heading for each paragraph from the list below.</p>
        </>
      );
    case IeltsQuestionType.MatchingSentenceEnds:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Complete each sentence with the correct ending, <strong>A–{String.fromCharCode(64 + (block[0]?.options.length ?? 11))}</strong>, below.</p>
        </>
      );
    case IeltsQuestionType.Matching:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Match each item with the correct option from the list below.</p>
        </>
      );
    case IeltsQuestionType.SingleChoice:
    case IeltsQuestionType.MultipleChoice:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Choose the correct letter, <strong>A, B, C</strong> or <strong>D</strong>.</p>
        </>
      );
    case IeltsQuestionType.SentenceCompletion:
    case IeltsQuestionType.NoteCompletion:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Complete the sentences/notes below.</p>
          <p>Write <strong>NO MORE THAN {first.maxWords} WORDS</strong> from the passage for each answer.</p>
        </>
      );
    case IeltsQuestionType.ShortAnswer:
      return (
        <>
          <p><strong>{range}</strong></p>
          <p>Answer the questions below.</p>
          <p>Write <strong>NO MORE THAN {first.maxWords} WORDS</strong> from the passage for each answer.</p>
        </>
      );
    default:
      return <p><strong>{range}</strong></p>;
  }
};

// ── renderBlock ───────────────────────────────────────────────
function renderBlock(
  type: IeltsQuestionType,
  block: IeltsQuestionPreview[],
  answers: Record<string, IeltsAnswerState>,
  group: IeltsGroupPreview,
  onAnswer: (q: IeltsQuestionPreview, value: string | number) => void,
) {
  switch (type) {
    // FIX 3: TrueFalseNotGiven = 8 — đã verify đúng với enum
    case IeltsQuestionType.TrueFalseNotGiven:
    case IeltsQuestionType.YesNoNotGiven:
      return (
        <TrueFalseRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );

    // FIX 1: ShortAnswer (type 4) — split theo options
    // options rỗng → user tự gõ tự do (Passage 3 Q55-56)
    // có options → chọn từ danh sách (Passage 1 Q45-51)
    case IeltsQuestionType.ShortAnswer:
      return block[0].options.length > 0
        ? (
          <TableCompletionRender
            questions={block}
            answers={answers}
            groupTemplate={group.passageHtml}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        )
        : (
          <ShortAnswerRender
            questions={block}
            answers={answers}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        );

    case IeltsQuestionType.TableCompletion:
    case IeltsQuestionType.FormCompletion:
      // Cũng cần check options rỗng cho FormCompletion/TableCompletion
      return block[0].options.length > 0
        ? (
          <TableCompletionRender
            questions={block}
            answers={answers}
            groupTemplate={group.passageHtml}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        )
        : (
          <ShortAnswerRender
            questions={block}
            answers={answers}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        );

    case IeltsQuestionType.NoteCompletion:
      return (
        <NoteCompletionRender
          questions={block}
          answers={answers}
          groupTemplate={group.passageHtml}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );

    case IeltsQuestionType.SentenceCompletion:
      return (
        <SentenceCompletionRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );

    // FIX 2: MapLabeling — có imageUrl dùng MapLabelingRender, không có dùng ShortAnswerRender
    case IeltsQuestionType.MapLabeling:
      return group.imageUrl
        ? (
          <MapLabelingRender
            questions={block}
            answers={answers}
            mapImageUrl={group.imageUrl}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        )
        : (
          <ShortAnswerRender
            questions={block}
            answers={answers}
            onAnswer={(q, v) => onAnswer(q, v)}
          />
        );

    case IeltsQuestionType.MatchingInformation:
    case IeltsQuestionType.Matching:
      return (
        <MatchingInformationRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v as string)}
        />
      );

    case IeltsQuestionType.MatchingSentenceEnds:
      return (
        <MatchingSentenceEndsRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v as string)}
        />
      );

    case IeltsQuestionType.MatchingHeading:
      return (
        <MatchingHeadingRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v as string)}
        />
      );

    case IeltsQuestionType.SingleChoice:
    case IeltsQuestionType.MultipleChoice: {
      // Fix for OCR misclassification: if multiple SingleChoice questions share the exact same options 
      // (e.g. they all have 'A. droppings' as their first option), it's actually a Matching or Table Completion 
      // with a box of words. We render it nicely with MatchingRender.
      const isMatchingBox = block.length > 1 && block.every((q, i) => 
        i === 0 || (q.options.length === block[0].options.length && q.options[0]?.content === block[0].options[0]?.content)
      );

      if (isMatchingBox) {
        return (
          <MatchingRender
            questions={block}
            answers={answers}
            onAnswer={(q, v) => onAnswer(q, v as string)}
          />
        );
      }

      return (
        <McqRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );
    }

    default:
      return <div className="idp-unsupported">Unsupported type: {type}</div>;
  }
}

const IeltsReadingGroup: React.FC<Props> = ({
  section, activeGroup, answers, currentQuestionOrderIndex,
  onAnswer, onMarkToggle, onSwitchGroup,
}) => {
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const blocks = useMemo(() => groupByType(activeGroup.questions), [activeGroup]);

  return (
    <div className="idp-reading-wrapper">
      <div className="idp-reading-topbar">
        <div className="tools-row">
          <label className="toggle-highlight">
            <input
              type="checkbox"
              checked={highlightEnabled}
              onChange={e => setHighlightEnabled(e.target.checked)}
            />
            <span className="slider" />
            <span className="label-text">Highlight text</span>
          </label>
        </div>

        <div className="passage-tabs">
          {section.groups.map((g, idx) => {
            const firstQ = g.questions[0];
            const lastQ  = g.questions[g.questions.length - 1];
            return (
              <button
                key={g.groupId}
                className={`p-tab ${g.groupId === activeGroup.groupId ? 'active' : ''}`}
                onClick={() => onSwitchGroup(g.groupId)}
              >
                Passage {idx + 1}
                <span className="tab-range"> ({firstQ?.orderIndex}–{lastQ?.orderIndex})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="idp-reading-main">
        {/* LEFT: Passage */}
        <div className="idp-panel left-panel">
          {activeGroup.imageUrl && (
            <img src={activeGroup.imageUrl} alt="diagram" className="passage-image" />
          )}
          <div
            className={`passage-text ${highlightEnabled ? 'highlight-enabled' : ''}`}
            dangerouslySetInnerHTML={{
              __html: activeGroup.passageHtml ?? '<p>No passage content available.</p>',
            }}
          />
        </div>

        {/* RIGHT: Questions */}
        <div className="idp-panel right-panel">
          {blocks.map((block, blockIdx) => {
            const type = block[0].questionType;
            return (
              <div key={blockIdx} className="question-section">
                <div className="instruction-block">
                  {getInstruction(type, block)}
                </div>

                {renderBlock(type, block, answers, activeGroup, onAnswer)}

                <div className="mark-buttons-row">
                  {block.map(q => (
                    <button
                      key={q.examQuestionId}
                      className={[
                        'mark-btn',
                        answers[q.examQuestionId]?.marked ? 'mark-btn--active' : '',
                        q.orderIndex === currentQuestionOrderIndex ? 'mark-btn--current' : '',
                      ].join(' ')}
                      onClick={() => onMarkToggle(q.examQuestionId)}
                    >
                      {answers[q.examQuestionId]?.marked ? '★' : '☆'} {q.orderIndex}
                    </button>
                  ))}
                </div>

                {blockIdx < blocks.length - 1 && <hr className="idp-divider" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IeltsReadingGroup;