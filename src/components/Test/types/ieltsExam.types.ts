// ═══════════════════════════════════════════════════════════
// Sync 100% với QuestionTypeEnum backend
// Backend values:
//   SingleChoice=1, MultipleChoice=2, FillBlank=3
//   Matching=4, MatchingHeading=5, MatchingInformation=6, MatchingSentenceEnds=7
//   TrueFalseNotGiven=8, YesNoNotGiven=9
//   ShortAnswer=10, NoteCompletion=11, FormCompletion=12
//   TableCompletion=13, SummaryCompletion=14, SentenceCompletion=15, MapLabeling=16
// ═══════════════════════════════════════════════════════════
export const IeltsQuestionType = {
  // ── TOEIC ──
  SingleChoice:    1,
  MultipleChoice:  2,
  FillBlank:       3,

  // ── IELTS Matching ──
  Matching:             4,
  MatchingHeading:      5,
  MatchingInformation:  6,
  MatchingSentenceEnds: 7,

  // ── True/False ──
  TrueFalseNotGiven: 8,
  YesNoNotGiven:     9,

  // ── Completion (fill-in) ──
  ShortAnswer:        10,
  NoteCompletion:     11,
  FormCompletion:     12,
  TableCompletion:    13,
  SummaryCompletion:  14,
  SentenceCompletion: 15,
  MapLabeling:        16,
} as const;

export type IeltsQuestionType =
  typeof IeltsQuestionType[keyof typeof IeltsQuestionType];

// ── Nhóm helpers ─────────────────────────────────────────────
export const FILL_IN_TYPES = new Set<IeltsQuestionType>([
  IeltsQuestionType.FormCompletion,     // 12
  IeltsQuestionType.NoteCompletion,     // 11
  IeltsQuestionType.SentenceCompletion, // 15
  IeltsQuestionType.SummaryCompletion,  // 14
  IeltsQuestionType.TableCompletion,    // 13
  IeltsQuestionType.ShortAnswer,        // 10
  IeltsQuestionType.MapLabeling,        // 16
  IeltsQuestionType.FillBlank,          // 3
]);

export const MCQ_TYPES = new Set<IeltsQuestionType>([
  IeltsQuestionType.SingleChoice,   // 1
  IeltsQuestionType.MultipleChoice, // 2
]);

export const TFNG_TYPES = new Set<IeltsQuestionType>([
  IeltsQuestionType.TrueFalseNotGiven, // 8
  IeltsQuestionType.YesNoNotGiven,     // 9
]);

export const MATCHING_TYPES = new Set<IeltsQuestionType>([
  IeltsQuestionType.Matching,             // 4
  IeltsQuestionType.MatchingHeading,      // 5
  IeltsQuestionType.MatchingInformation,  // 6
  IeltsQuestionType.MatchingSentenceEnds, // 7
]);

export const isFillIn       = (t: IeltsQuestionType) => FILL_IN_TYPES.has(t);
export const isMcq          = (t: IeltsQuestionType) => MCQ_TYPES.has(t);
export const isTfng         = (t: IeltsQuestionType) => TFNG_TYPES.has(t);
export const isMatching     = (t: IeltsQuestionType) => MATCHING_TYPES.has(t);
export const isFillInType   = (t: IeltsQuestionType) => FILL_IN_TYPES.has(t);
export const isMcqSingle    = (t: IeltsQuestionType) => t === IeltsQuestionType.SingleChoice;
export const isMcqMulti     = (t: IeltsQuestionType) => t === IeltsQuestionType.MultipleChoice;
export const isTfngType     = (t: IeltsQuestionType) => TFNG_TYPES.has(t);
export const isMatchingType = (t: IeltsQuestionType) => MATCHING_TYPES.has(t);

// ── Skill type ────────────────────────────────────────────────
export type IeltsSkillType = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Unknown';

// ── Answer option (khi làm bài) ───────────────────────────────
export interface IeltsAnswerOption {
  id:         string;
  content:    string | null;
  orderIndex: number;
}

// ── Question (khi làm bài) ────────────────────────────────────
export interface IeltsQuestionPreview {
  examQuestionId: string;
  questionId:     string;
  orderIndex:     number;
  point:          number;
  maxWords:       number;
  content:        string | null;
  questionType:   IeltsQuestionType;
  options:        IeltsAnswerOption[];
}

// ── Group (khi làm bài) ───────────────────────────────────────
export interface IeltsGroupPreview {
  groupId:     string;
  audioUrl:    string | null;
  transcript:  string | null;
  passageHtml: string | null;
  imageUrl:    string | null;
  questions:   IeltsQuestionPreview[];
}

// ── Section (khi làm bài) ─────────────────────────────────────
export interface IeltsSectionPreview {
  sectionId:    string;
  sectionName:  string;
  skillType:    IeltsSkillType;
  orderIndex:   number;
  instructions: string | null;
  groups:       IeltsGroupPreview[];
}

// ── Start result ──────────────────────────────────────────────
export interface IeltsStartExamResult {
  attemptId:        string;
  startedAt:        string;
  expiresAt:        string | null;
  timeLimitSeconds: number;
  totalQuestions:   number;
  sections:         IeltsSectionPreview[];
}

// ── Submit result ─────────────────────────────────────────────
export interface IeltsBandScore {
  correctCount: number;
  bandScore:    number;
}

export interface IeltsSectionResult {
  sectionName: string;
  total:       number;
  correct:     number;
  wrong:       number;
  skipped:     number;
}

export interface IeltsSubmitResult {
  attemptId:       string;
  submittedAt:     string;
  durationSeconds: number;
  totalQuestions:  number;
  correctAnswers:  number;
  wrongAnswers:    number;
  skippedAnswers:  number;
  listening:       IeltsBandScore;
  reading:         IeltsBandScore;
  sections:        IeltsSectionResult[];
}

// ── Review types ──────────────────────────────────────────────
export interface IeltsReviewBandScore {
  correctCount: number;
  totalCount:   number;
  bandScore:    number;
}

export interface IeltsCorrectAnswer {
  id:      string | null;
  content: string | null;
}

export interface IeltsReviewOption {
  id:         string;
  content:    string | null;
  orderIndex: number;
  isCorrect:  boolean;
}

export interface IeltsReviewQuestion {
  examQuestionId: string;
  questionId:     string;
  orderIndex:     number;
  point:          number;
  earnedPoint:    number;
  isCorrect:      boolean;
  isAnswered:     boolean;
  maxWords:       number;
  content:        string | null;
  questionType:   IeltsQuestionType;
  userTextAnswer:  string | null;
  userSelectedId:  string | null;
  userSelectedIds: string[];
  correctAnswers: IeltsCorrectAnswer[];
  options:        IeltsReviewOption[];
  explanation:    string | null;
}

export interface IeltsReviewGroup {
  groupId:     string;
  audioUrl:    string | null;
  transcript:  string | null;
  passageHtml: string | null;
  imageUrl:    string | null;
  questions:   IeltsReviewQuestion[];
}

export interface IeltsReviewSection {
  sectionId:   string;
  sectionName: string;
  skillType:   IeltsSkillType;
  total:       number;
  correct:     number;
  wrong:       number;
  skipped:     number;
  groups:      IeltsReviewGroup[];
}

export interface IeltsReviewResult {
  attemptId:       string;
  submittedAt:     string;
  durationSeconds: number;
  totalQuestions:  number;
  correctAnswers:  number;
  wrongAnswers:    number;
  skippedAnswers:  number;
  listening:       IeltsReviewBandScore;
  reading:         IeltsReviewBandScore;
  sections:        IeltsReviewSection[];
}

// ── Answer state (local) ──────────────────────────────────────
export interface IeltsAnswerState {
  textAnswer?:        string;
  selectedAnswerId?:  string;
  selectedAnswerIds?: string[];
  marked:             boolean;
  timeSpentSeconds?:  number;
}

// ── Save payloads ─────────────────────────────────────────────
export interface SaveFillInAnswerPayload {
  attemptId:         string;
  examQuestionId:    string;
  textAnswer:        string;
  timeSpentSeconds?: number;
}

export interface SaveMcqAnswerPayload {
  attemptId:         string;
  examQuestionId:    string;
  selectedAnswerId:  string;
  timeSpentSeconds?: number;
}

export interface SaveMultiChoiceAnswerPayload {
  attemptId:          string;
  examQuestionId:     string;
  selectedAnswerIds:  string[];
  timeSpentSeconds?:  number;
}

// ── Test state ────────────────────────────────────────────────
export interface IeltsTestState {
  currentQuestionOrderIndex: number;
  answers:                   Record<string, IeltsAnswerState>;
  timeLeft:                  number;
  listeningTimeLeft:         number;
  isListeningLocked:         boolean;
  isTestCompleted:           boolean;
  currentSkill:              IeltsSkillType;
}

// ── Utilities ─────────────────────────────────────────────────
export const emptyAnswer = (): IeltsAnswerState => ({ marked: false });

export const isAnswered = (
  state: IeltsAnswerState | undefined,
  type:  IeltsQuestionType,
): boolean => {
  if (!state) return false;
  if (isFillInType(type)) return !!state.textAnswer?.trim();
  if (isMcqMulti(type))   return (state.selectedAnswerIds?.length ?? 0) >= 2;
  return !!state.selectedAnswerId;
};