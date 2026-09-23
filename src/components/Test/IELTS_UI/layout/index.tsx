import React, {
    useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

import Header from '../../TestComponent/Header/Header';
import IeltsIdpBottomBar from '../components/sidebarQuestion';
import './style.scss';

import {
    IeltsQuestionType,
    isFillInType,   // FIX 5: dùng helper từ types, không tự định nghĩa lại
    isMcqMulti,
    emptyAnswer,
    isAnswered,
    type IeltsAnswerState,
    type IeltsGroupPreview,
    type IeltsQuestionPreview,
    type IeltsSectionPreview,
    type IeltsSkillType,
    type IeltsStartExamResult,
    type IeltsTestState,
} from '../../types/ieltsExam.types';

import { ieltsAttemptService } from '../../services/IELTS/ieltsAttemp.services';
import IeltsListeningGroup from '../components/IeltsListeningGroup';
import IeltsReadingGroup from '../components/IeltsReadingGroup';

// ── Helpers ────────────────────────────────────────────────
const flattenQuestions = (sections: IeltsSectionPreview[]): IeltsQuestionPreview[] =>
    sections
        .flatMap(s => s.groups.flatMap(g => g.questions))
        .sort((a, b) => a.orderIndex - b.orderIndex);

const findGroupByQuestion = (
    sections: IeltsSectionPreview[],
    questionOrderIndex: number,
): { section: IeltsSectionPreview; group: IeltsGroupPreview } | null => {
    for (const section of sections) {
        for (const group of section.groups) {
            if (group.questions.some(q => q.orderIndex === questionOrderIndex))
                return { section, group };
        }
    }
    return null;
};

// ── Component ──────────────────────────────────────────────
const IeltsFullTestPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();

    const STORAGE_KEY = `ielts_progress_${attemptId}`;
    const EXAM_DATA_KEY = `ielts_data_${attemptId}`;

    const [resumedData, setResumedData] = useState<IeltsStartExamResult | null>(null);
    const [isResuming, setIsResuming] = useState(false);

    const examData = useMemo((): IeltsStartExamResult | null => {
        if (resumedData) return resumedData;
        if (location.state?.examData) {
            const raw = location.state.examData as IeltsStartExamResult;
            try { sessionStorage.setItem(EXAM_DATA_KEY, JSON.stringify(raw)); } catch { }
            return raw;
        }
        try {
            const saved = sessionStorage.getItem(EXAM_DATA_KEY);
            if (saved) return JSON.parse(saved) as IeltsStartExamResult;
        } catch { }
        return null;
    }, [resumedData, location.state, EXAM_DATA_KEY]);

    const savedProgress = useMemo((): Partial<IeltsTestState> | null => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { }
        return null;
    }, [STORAGE_KEY]);

    const [testState, setTestState] = useState<IeltsTestState>(() => {
        // Derive time from API data when available
        const totalSec = examData?.timeLimitSeconds ?? 170 * 60;

        // Detect which skills exist in the exam
        const hasListening = examData?.sections.some(s => s.skillType === 'Listening') ?? true;
        const hasReading = examData?.sections.some(s => s.skillType === 'Reading') ?? true;

        // Split time proportionally: Listening ~30%, Reading ~60% of standard 170min
        let listeningSec = 0;
        let readingSec = totalSec;
        if (hasListening && hasReading) {
            // Standard IELTS: Listening 30min / Reading 60min out of 90min (not counting breaks)
            // Fraction: L = 30/90 ≈ 0.333, R = 60/90 ≈ 0.667
            listeningSec = Math.round(totalSec * (30 / 90));
            readingSec = totalSec - listeningSec;
        } else if (hasListening && !hasReading) {
            listeningSec = totalSec;
            readingSec = 0;
        }

        return {
            currentQuestionOrderIndex: savedProgress?.currentQuestionOrderIndex ?? 1,
            answers: savedProgress?.answers ?? {},
            timeLeft: savedProgress?.timeLeft ?? totalSec,
            listeningTimeLeft: savedProgress?.listeningTimeLeft ?? listeningSec,
            isListeningLocked: savedProgress?.isListeningLocked ?? false,
            isTestCompleted: savedProgress?.isTestCompleted ?? false,
            currentSkill: savedProgress?.currentSkill ?? (hasListening ? 'Listening' : 'Reading'),
        };
    });

    const [submitResult, setSubmitResult] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Thêm các state cho chức năng Exit
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const [showSectionTransition, setShowSectionTransition] = useState(false);
    const [transitionMessage, setTransitionMessage] = useState('');

    const saveTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // ── Derived ────────────────────────────────────────────
    const allQuestions = useMemo(
        () => examData ? flattenQuestions(examData.sections) : [],
        [examData],
    );

    useEffect(() => {
        if (allQuestions.length > 0 && !savedProgress?.currentQuestionOrderIndex) {
            const first = allQuestions[0].orderIndex;
            if (testState.currentQuestionOrderIndex !== first)
                setTestState(prev => ({ ...prev, currentQuestionOrderIndex: first }));
        }
    }, [allQuestions, savedProgress]);

    const currentGroup = useMemo(() => {
        if (!examData) return null;
        return findGroupByQuestion(examData.sections, testState.currentQuestionOrderIndex);
    }, [examData, testState.currentQuestionOrderIndex]);

    const totalQuestions = examData?.totalQuestions ?? 80;

    // FIX 3: answeredCount check cả 3 loại answer
    const answeredCount = useMemo(
        () => Object.entries(testState.answers).filter(([, a]) =>
            (typeof a.textAnswer === 'string' && a.textAnswer.trim().length > 0) ||
            !!a.selectedAnswerId ||
            (a.selectedAnswerIds?.length ?? 0) > 0,
        ).length,
        [testState.answers],
    );

    // ── Session save ────────────────────────────────────────
    useEffect(() => {
        if (!attemptId || testState.isTestCompleted) return;
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(testState)); } catch { }
    }, [testState, attemptId, STORAGE_KEY]);

    // ── Timer tổng ─────────────────────────────────────────
    useEffect(() => {
        if (testState.isTestCompleted) return;
        const t = setInterval(() => {
            setTestState(prev => {
                if (prev.timeLeft <= 0) { clearInterval(t); handleAutoSubmit(); return prev; }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);
        return () => clearInterval(t);
    }, [testState.isTestCompleted]);

    // ── Timer Listening ─────────────────────────────────────
    useEffect(() => {
        if (testState.isTestCompleted || testState.currentSkill !== 'Listening') return;
        const t = setInterval(() => {
            setTestState(prev => {
                if (prev.listeningTimeLeft <= 0) { clearInterval(t); triggerTransition('Reading'); return prev; }
                return { ...prev, listeningTimeLeft: prev.listeningTimeLeft - 1 };
            });
        }, 1000);
        return () => clearInterval(t);
    }, [testState.isTestCompleted, testState.currentSkill]);

    // ── Transition ──────────────────────────────────────────
    const triggerTransition = useCallback((nextSkill: IeltsSkillType) => {
        setTransitionMessage('Switching to Reading section...');
        setShowSectionTransition(true);
        setTimeout(() => {
            setShowSectionTransition(false);
            const firstQ = examData?.sections
                .find(s => s.skillType === nextSkill)
                ?.groups[0]?.questions[0];
            setTestState(prev => ({
                ...prev,
                currentSkill: nextSkill,
                isListeningLocked: nextSkill !== 'Listening',
                currentQuestionOrderIndex: firstQ?.orderIndex ?? prev.currentQuestionOrderIndex,
            }));
        }, 3000);
    }, [examData]);

    // ── Navigation ──────────────────────────────────────────
    const goToQuestion = useCallback((orderIndex: number) => {
        if (orderIndex < 1 || orderIndex > totalQuestions) return;
        const targetGroup = examData ? findGroupByQuestion(examData.sections, orderIndex) : null;
        if (testState.isListeningLocked && targetGroup?.section.skillType === 'Listening') return;
        setTestState(prev => ({ ...prev, currentQuestionOrderIndex: orderIndex }));
    }, [totalQuestions, examData, testState.isListeningLocked]);

    const handlePrev = useCallback(() => {
        goToQuestion(testState.currentQuestionOrderIndex - 1);
    }, [testState.currentQuestionOrderIndex, goToQuestion]);

    const handleNext = useCallback(() => {
        const next = testState.currentQuestionOrderIndex + 1;
        if (next > totalQuestions) {
            if (testState.currentSkill === 'Listening') triggerTransition('Reading');
            return;
        }
        goToQuestion(next);
    }, [testState.currentQuestionOrderIndex, testState.currentSkill, totalQuestions, goToQuestion, triggerTransition]);

    // ── Handle Answer ────────────────────────────────────────
    // FIX 1+2: đồng nhất với IeltsAnswerState mới
    // - Fill-in types        → textAnswer (string)
    // - MultipleChoice (7)   → selectedAnswerIds (string[]) — value là option.id string
    // - Single/TrueFalse/
    //   Matching             → selectedAnswerId (string)    — value là option.id string
    const handleAnswer = useCallback((
        question: IeltsQuestionPreview,
        value: string | number,
    ) => {
        const qId = question.examQuestionId;
        const type = question.questionType;

        setTestState(prev => {
            const current: IeltsAnswerState = prev.answers[qId] ?? emptyAnswer();
            let updated: IeltsAnswerState;

            if (isFillInType(type)) {
                // Fill-in: value là string tự gõ
                updated = { ...current, textAnswer: value as string };

            } else if (isMcqMulti(type)) {
                // MultipleChoice TWO: value là option.id (string)
                // FIX 2: lưu vào selectedAnswerIds[], không phải textAnswer
                const optId = value as string;
                const curr = current.selectedAnswerIds ?? [];
                const next = curr.includes(optId)
                    ? curr.filter(id => id !== optId)   // bỏ tick
                    : curr.length < 2
                        ? [...curr, optId]                // thêm (tối đa 2)
                        : curr;                           // đã đủ 2 → không thêm
                updated = { ...current, selectedAnswerIds: next };

            } else {
                // SingleChoice / TrueFalseNotGiven / Matching:
                // FIX 1: value là option.id (string) trực tiếp từ renderer
                // KHÔNG dùng question.options[value as number] nữa
                updated = { ...current, selectedAnswerId: value as string };
            }

            return { ...prev, answers: { ...prev.answers, [qId]: updated } };
        });

        // Debounce API save 600ms
        if (saveTimerRef.current[qId]) clearTimeout(saveTimerRef.current[qId]);
        saveTimerRef.current[qId] = setTimeout(async () => {
            if (!attemptId) return;
            try {
                if (isFillInType(type)) {
                    await ieltsAttemptService.saveFillInAnswer({
                        attemptId,
                        examQuestionId: qId,
                        textAnswer: value as string,
                    });
                } else if (isMcqMulti(type)) {
                    setTestState(prev => {
                        const ids = prev.answers[qId]?.selectedAnswerIds ?? [];

                        ids.forEach(selectedAnswerId => {
                            ieltsAttemptService.saveMcqAnswer({
                                attemptId: attemptId!,
                                examQuestionId: qId,
                                selectedAnswerId,
                            }).catch((err: unknown) => console.warn('Auto-save multi failed:', err));
                        });
                        return prev;
                    });
                } else {
                    // Single/TrueFalse/Matching — value là option.id
                    await ieltsAttemptService.saveMcqAnswer({
                        attemptId,
                        examQuestionId: qId,
                        selectedAnswerId: value as string,
                    });
                }
            } catch (err) {
                console.warn('Auto-save answer failed:', err);
            }
        }, 600);
    }, [attemptId]);

    const handleMarkToggle = useCallback((examQuestionId: string) => {
        setTestState(prev => {
            const current = prev.answers[examQuestionId] ?? emptyAnswer();
            return {
                ...prev,
                answers: { ...prev.answers, [examQuestionId]: { ...current, marked: !current.marked } },
            };
        });
    }, []);

    // ── Submit ──────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (!attemptId || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const result = await ieltsAttemptService.submitExam({ attemptId });
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(EXAM_DATA_KEY);
            setSubmitResult(result);
            setTestState(prev => ({ ...prev, isTestCompleted: true }));
            navigate(`/ielts-test/result/${attemptId}`, { state: { result, attemptId } });
        } catch (err: any) {
            messageApi.error(err?.response?.data?.message ?? 'An error occurred while submitting.', 5);
        } finally {
            setIsSubmitting(false);
        }
    }, [attemptId, isSubmitting, navigate, STORAGE_KEY, EXAM_DATA_KEY, messageApi]);

    const handleExit = useCallback(async () => {
        if (!attemptId || isExiting) return;
        setIsExiting(true);
        try {
            const result = await ieltsAttemptService.submitExam({ attemptId });
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(EXAM_DATA_KEY);
            setSubmitResult(result);
            setTestState(prev => ({ ...prev, isTestCompleted: true }));
            navigate(`/ielts-test/result/${attemptId}`, { state: { result, attemptId } });
        } catch (err: any) {
            messageApi.error(err?.response?.data?.message ?? 'An error occurred while exiting.', 5);
        } finally {
            setIsExiting(false);
            setIsExitModalOpen(false);
        }
    }, [attemptId, isExiting, navigate, STORAGE_KEY, EXAM_DATA_KEY, messageApi]);

    const handleAutoSubmit = useCallback(async () => {
        if (!attemptId) return;
        await ieltsAttemptService.autoSubmit(attemptId, '');
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(EXAM_DATA_KEY);
        navigate(`/ielts/result/${attemptId}`);
    }, [attemptId, navigate, STORAGE_KEY, EXAM_DATA_KEY]);

    // ── beforeunload ────────────────────────────────────────
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!testState.isTestCompleted) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [testState.isTestCompleted]);

    // ── Render ──────────────────────────────────────────────
    const renderContent = () => {
        if (!currentGroup) return null;
        const { section, group } = currentGroup;

        const sectionAnswers = Object.fromEntries(
            section.groups.flatMap(g =>
                g.questions.map(q => [
                    q.examQuestionId,
                    testState.answers[q.examQuestionId] ?? emptyAnswer(),
                ])
            )
        );

        const handleSwitchGroup = (groupId: string) => {
            const target = section.groups.find(g => g.groupId === groupId);
            const firstQ = target?.questions[0];
            if (firstQ) goToQuestion(firstQ.orderIndex);
        };

        if (section.skillType === 'Listening') {
            const groupAnswers = Object.fromEntries(
                group.questions.map(q => [
                    q.examQuestionId,
                    testState.answers[q.examQuestionId] ?? emptyAnswer(),
                ])
            );
            return (
                <IeltsListeningGroup
                    group={group}
                    answers={groupAnswers}
                    currentQuestionOrderIndex={testState.currentQuestionOrderIndex}
                    onAnswer={handleAnswer}
                    onMarkToggle={handleMarkToggle}
                />
            );
        }

        if (section.skillType === 'Reading') {
            return (
                <IeltsReadingGroup
                    section={section}
                    activeGroup={group}
                    answers={sectionAnswers}
                    currentQuestionOrderIndex={testState.currentQuestionOrderIndex}
                    onAnswer={handleAnswer}
                    onMarkToggle={handleMarkToggle}
                    onSwitchGroup={handleSwitchGroup}
                />
            );
        }

        return null;
    };

    if (!examData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p>{isResuming ? 'Loading exam...' : 'Exam data not found.'}</p>
            </div>
        );
    }

    const bottomBarAnswers: Record<number, string> = {};
    allQuestions.forEach(q => {
        const a = testState.answers[q.examQuestionId];
        if (!a) return;
        if (typeof a.textAnswer === 'string' && a.textAnswer.trim())
            bottomBarAnswers[q.orderIndex] = a.textAnswer;
        else if (a.selectedAnswerId)
            bottomBarAnswers[q.orderIndex] = a.selectedAnswerId;
        else if ((a.selectedAnswerIds?.length ?? 0) > 0)
            bottomBarAnswers[q.orderIndex] = a.selectedAnswerIds!.join(',');
    });

    return (
        <div className="idp-fulltest-layout">
            {contextHolder}

            {showSectionTransition && (
                <div className="section-transition-overlay">
                    <div className="section-transition-modal">
                        <h2>Listening section complete!</h2>
                        <p>{transitionMessage}</p>
                        <div className="transition-spinner" />
                    </div>
                </div>
            )}

            <Header
                timeLeft={
                    testState.currentSkill === 'Listening'
                        ? testState.listeningTimeLeft
                        : testState.timeLeft
                }
                onSubmit={() => setIsModalOpen(true)}
                onExit={() => setIsExitModalOpen(true)}
                sectionTitle={`IELTS Academic — ${testState.currentSkill}`}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                currentQuestion={testState.currentQuestionOrderIndex}
                currentSection={testState.currentSkill === 'Listening' ? 'listening' : 'reading'}
                hideTimer={true}
                hideVolume={true}
                isSubmitting={isSubmitting}
                isExiting={isExiting}
            />

            <div className="idp-body-row">
                <main className="idp-main-workspace">
                    {renderContent()}
                </main>

                <IeltsIdpBottomBar
                    totalQuestions={totalQuestions}
                    currentQuestion={testState.currentQuestionOrderIndex}
                    answers={bottomBarAnswers}
                    onNavigate={goToQuestion}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onSubmit={() => setIsModalOpen(true)}
                    sections={examData.sections}
                    timeLeftSeconds={
                        testState.currentSkill === 'Listening'
                            ? testState.listeningTimeLeft
                            : testState.timeLeft
                    }
                />
            </div>

            {isModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <h3>Submit test?</h3>
                        <p>You have answered <strong>{answeredCount}</strong>/{totalQuestions} questions.</p>
                        <div className="confirm-modal-actions">
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                            <button
                                className={`primary ${isSubmitting ? 'primary--loading' : ''}`}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? <><span className="ielts-submit-spinner" /> Submitting…</>
                                    : 'Submit'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isExitModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <h3>Exit Exam?</h3>
                        <p>Are you sure you want to stop the test? Your current answers will be submitted.</p>
                        <div className="confirm-modal-actions">
                            <button onClick={() => setIsExitModalOpen(false)} disabled={isExiting}>Cancel</button>
                            <button
                                className={`danger ${isExiting ? 'primary--loading' : ''}`}
                                onClick={handleExit}
                                disabled={isExiting}
                            >
                                {isExiting
                                    ? <><span className="ielts-submit-spinner" /> Exiting…</>
                                    : 'Exit now'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IeltsFullTestPage;