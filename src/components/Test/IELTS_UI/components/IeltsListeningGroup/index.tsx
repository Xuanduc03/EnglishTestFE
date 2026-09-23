/**
 * IeltsListeningGroup — Fixed version
 * Thêm: TrueFalseNotGiven (8), Matching (12)
 * Fix: MapLabeling (5) — chọn chữ cái từ options, không phải điền từ
 * Fix: ShortAnswer (4) — options rỗng → tự gõ, có options → chọn từ list
 */
import React, { useMemo } from 'react';
import {
  IeltsQuestionType,
  type IeltsAnswerState,
  type IeltsGroupPreview,
  type IeltsQuestionPreview,
} from '../../../types/ieltsExam.types';
import AudioPlayer from './AudioPlayer';
import FormCompletionRender     from './QuestionRenderer/renderers/formCompletion/FormCompletionRender';
import NoteCompletionRender     from './QuestionRenderer/renderers/noteCompletion/NoteCompletionRender';
import SentenceCompletionRender from './QuestionRenderer/renderers/sentenceCompletion/SentenceCompletionRender';
import ShortAnswerRender        from './QuestionRenderer/renderers/shortAnswer/ShortAnswerRender';
import MapLabelingRender        from './QuestionRenderer/renderers/mapLabeling/MapLabelingRender';
import McqRender                from './QuestionRenderer/renderers/mcq/McqRender';
import TrueFalseRender          from './QuestionRenderer/renderers/TrueFalseRender/index';
import MatchingRender           from './QuestionRenderer/renderers/matching/MatchingRender';

interface Props {
  group: IeltsGroupPreview;
  answers: Record<string, IeltsAnswerState>;
  currentQuestionOrderIndex: number;
  onAnswer: (q: IeltsQuestionPreview, value: string | number) => void;
  onMarkToggle: (examQuestionId: string) => void;
}

// Gom câu liền nhau cùng questionType thành 1 block
const groupByType = (qs: IeltsQuestionPreview[]): IeltsQuestionPreview[][] =>
  qs.reduce<IeltsQuestionPreview[][]>((acc, q) => {
    const last = acc[acc.length - 1];
    if (!last || last[0].questionType !== q.questionType) acc.push([q]);
    else last.push(q);
    return acc;
  }, []);

const rangeLabel = (block: IeltsQuestionPreview[]) =>
  block.length === 1
    ? `Question ${block[0].orderIndex}`
    : `Questions ${block[0].orderIndex}–${block[block.length - 1].orderIndex}`;

const getInstruction = (type: IeltsQuestionType, maxWords: number): string => {
  switch (type) {
    case IeltsQuestionType.FormCompletion:
      return `Complete the form below. Write <strong>NO MORE THAN ${maxWords} WORD${maxWords > 1 ? 'S' : ''} AND/OR A NUMBER</strong> for each answer.`;
    case IeltsQuestionType.NoteCompletion:
      return `Complete the notes below. Write <strong>NO MORE THAN ${maxWords} WORD${maxWords > 1 ? 'S' : ''}</strong> for each answer.`;
    case IeltsQuestionType.SentenceCompletion:
      return `Complete the sentences below. Write <strong>NO MORE THAN ${maxWords} WORD${maxWords > 1 ? 'S' : ''}</strong> for each answer.`;
    case IeltsQuestionType.ShortAnswer:
      return `Answer the questions below. Write <strong>NO MORE THAN ${maxWords} WORDS AND/OR A NUMBER</strong> for each answer.`;
    case IeltsQuestionType.MapLabeling:
      // FIX: MapLabeling trong Listening là chọn chữ cái, không phải điền từ
      return 'Label the map below. Choose the correct letter from the box.';
    case IeltsQuestionType.SingleChoice:
      return 'Choose the correct letter, <strong>A, B or C</strong>.';
    case IeltsQuestionType.MultipleChoice:
      return 'Choose <strong>TWO</strong> letters, <strong>A–E</strong>.';
    // FIX: thêm instruction cho 2 type mới
    case IeltsQuestionType.TrueFalseNotGiven:
      return 'Do the following statements agree with the information you hear? Write <strong>TRUE</strong>, <strong>FALSE</strong> or <strong>NOT GIVEN</strong>.';
    case IeltsQuestionType.YesNoNotGiven:
      return 'Do the following statements agree with the views of the speaker? Write <strong>YES</strong>, <strong>NO</strong> or <strong>NOT GIVEN</strong>.';
    case IeltsQuestionType.Matching:
    case IeltsQuestionType.MatchingInformation:
      return 'Match each item with the correct option from the list below.';
    default:
      return '';
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
    case IeltsQuestionType.FormCompletion:
      return (
        <FormCompletionRender
          questions={block}
          answers={answers}
          groupTemplate={group.passageHtml}
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

    case IeltsQuestionType.ShortAnswer:
      return (
        <ShortAnswerRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );

    case IeltsQuestionType.MapLabeling:
      // FIX: MapLabeling trong Listening KHÔNG có imageUrl trong data
      // → render như MCQ chọn chữ cái (A/B/C/D/E...) từ options
      // MapLabelingRender dùng khi có imageUrl (có bản đồ thật)
      // Nếu không có imageUrl → dùng McqRender (chọn chữ cái)
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
          <McqRender
            questions={block}
            answers={answers}
            onAnswer={(q, v) => onAnswer(q, v as string)}
          />
        );

    case IeltsQuestionType.SingleChoice:
    case IeltsQuestionType.MultipleChoice:
      return (
        <McqRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v as string)}
        />
      );

    // FIX: TrueFalseNotGiven — type 8, có trong Listening Section 3
    case IeltsQuestionType.TrueFalseNotGiven:
    case IeltsQuestionType.YesNoNotGiven:
      return (
        <TrueFalseRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v)}
        />
      );

    // FIX: Matching — type 12, có trong Section 3 (match quốc gia với nhận xét)
    case IeltsQuestionType.Matching:
    case IeltsQuestionType.MatchingInformation:
    case IeltsQuestionType.MatchingHeading:
      return (
        <MatchingRender
          questions={block}
          answers={answers}
          onAnswer={(q, v) => onAnswer(q, v as number)}
        />
      );

    default:
      return (
        <div className="idp-unsupported">
          Question type not yet supported: {type}
        </div>
      );
  }
}

const IeltsListeningGroup: React.FC<Props> = ({
  group, answers, currentQuestionOrderIndex, onAnswer, onMarkToggle,
}) => {
  const blocks = useMemo(() => groupByType(group.questions), [group.questions]);

  return (
    <div className="idp-listening-container">
      {group.audioUrl && <AudioPlayer audioUrl={group.audioUrl} />}

      <div className="idp-content-area">
        {blocks.map((block, blockIdx) => {
          const type     = block[0].questionType;
          const maxWords = block[0].maxWords ?? 3;
          const instr    = getInstruction(type, maxWords);

          return (
            <div key={blockIdx} className="idp-question-block">
              <div className="idp-instruction-box">
                <p className="range-label"><strong>{rangeLabel(block)}</strong></p>
                {instr && <p dangerouslySetInnerHTML={{ __html: instr }} />}
              </div>

              <div className="idp-questions-wrapper">
                {renderBlock(type, block, answers, group, onAnswer)}

                {/* <div className="mark-buttons-col">
                  {block.map(q => (
                    <button
                      key={q.examQuestionId}
                      className={`mark-btn ${answers[q.examQuestionId]?.marked ? 'mark-btn--active' : ''}`}
                      onClick={() => onMarkToggle(q.examQuestionId)}
                      title="Flag question"
                    >
                      {answers[q.examQuestionId]?.marked ? '★' : '☆'}
                    </button>
                  ))}
                </div> */}
              </div>

              {blockIdx < blocks.length - 1 && <hr className="idp-divider" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IeltsListeningGroup;