import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { TestState } from '../../../types/test';
import { TOTAL_QUESTIONS, INITIAL_TIME, LISTENING_TIME, LISTENING_QUESTIONS_COUNT, READING_QUESTIONS_START } from '../../../constants/test';
import Header from '../../../components/Test/TestComponent/Header/Header';
import QuestionArea from '../../../components/Test/TestComponent/QuestionArea/QuestionArea';
import BottomQuestionBar from '../../../components/Test/TestComponent/BottomQuestionBar/BottomQuestionBar';
import ConfirmationModal from '../../../components/Test/TestComponent/ConfirmModal/ConfirmationModal';
import ResultPage from '../../../components/Test/TestComponent/ResultPage/ResultPage';
import './FullTestPage.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { examAttemptService } from '../../../components/Test/services/examAttemptApi';
import type { ExamAttemptDto, ExamQuestionPreview, ExamSectionPreview, SubmitExamResult } from './examAttempt.types';
import { message } from 'antd';
import { useAntiCheat } from '../../../utils/useAntiCheat';


// Thêm helper flatten sections → questions (giữ orderIndex đúng)
const flattenQuestions = (sections: ExamSectionPreview[]): ExamQuestionPreview[] =>
  sections.flatMap(s => s.questions).sort((a, b) => a.orderIndex - b.orderIndex);

const parseExamData = (raw: any): ExamAttemptDto | null => {
  if (!raw) return null;
  if (raw.sections?.length && !raw.questions?.length) {
    raw.questions = flattenQuestions(raw.sections);
  }
  return raw as ExamAttemptDto;
};


const FullTestPage: React.FC = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const STORAGE_KEY = `exam_progress_${attemptId}`;
  const EXAM_DATA_KEY = `exam_data_${attemptId}`;

  const saveTimerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // ── FIX 1: Load examData — ưu tiên location.state, fallback sessionStorage
  // Lưu vào sessionStorage ngay khi có từ location.state
  // ── Load examData: ưu tiên location.state, sau đó sessionStorage ──────
  // State này là fallback khi cả 2 đều thiếu (tức là user reload lần đầu và sessionStorage chưa kịp ghi)
  const [resumedExamData, setResumedExamData] = useState<ExamAttemptDto | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  const examData = useMemo((): ExamAttemptDto | null => {
    if (resumedExamData) return resumedExamData;
    let raw: any = null;
    if (location.state?.examData) {
      raw = location.state.examData;
      try {
        sessionStorage.setItem(EXAM_DATA_KEY, JSON.stringify(raw));
      } catch { }
    } else {
      try {
        const saved = sessionStorage.getItem(EXAM_DATA_KEY);
        if (saved) raw = JSON.parse(saved);
      } catch { }
    }

    return parseExamData(raw);
  }, [EXAM_DATA_KEY, location.state, resumedExamData]);

  const savedProgress = useMemo((): Partial<TestState> | null => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return null;
  }, [STORAGE_KEY]);

  const [testState, setTestState] = useState<TestState>(() => {
    const initialAnswers = savedProgress?.answers ??
      new Array(TOTAL_QUESTIONS + 1).fill(null).map(() => ({ answer: null, marked: false }));

    return {
      currentQuestion: savedProgress?.currentQuestion ?? 1,
      answers: initialAnswers,
      timeLeft: savedProgress?.timeLeft ?? INITIAL_TIME,
      isTestCompleted: savedProgress?.isTestCompleted ?? false,
      currentSection: savedProgress?.currentSection ?? 'listening',
      listeningTimeLeft: savedProgress?.listeningTimeLeft ?? LISTENING_TIME,
      isListeningLocked: savedProgress?.isListeningLocked ?? false,
    };
  });

  const [examResult, setExamResult] = useState<SubmitExamResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [audioHasEnded, setAudioHasEnded] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        if (parsedState && parsedState.answers) {
          setTestState(parsedState); // Ép state trở lại đúng với lúc trước khi F5
        }
      } catch (e) {
        console.error("Lỗi khi parse Storage", e);
      }
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (examData || isResuming || !attemptId) return;

    setIsResuming(true);
    examAttemptService.resumeExam(attemptId)
      .then(data => {
        try { sessionStorage.setItem(EXAM_DATA_KEY, JSON.stringify(data)); } catch { }
        setResumedExamData(data);
      })
      .catch(() => {
        navigate('/full-test', { replace: true });
      })
      .finally(() => setIsResuming(false));
  }, [examData, attemptId, isResuming]);

  // ── Auto-save sessionStorage khi state thay đổi
  useEffect(() => {
    if (!attemptId || testState.isTestCompleted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(testState));
    } catch { }
  }, [testState, attemptId, STORAGE_KEY]);

  // ── Timer tổng
  useEffect(() => {
    if (testState.isTestCompleted) return;
    const timer = setInterval(() => {
      setTestState(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(timer);
          handleSubmit();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testState.isTestCompleted]);

  // ── Timer listening
  useEffect(() => {
    if (testState.isTestCompleted || testState.currentSection !== 'listening') return;
    const timer = setInterval(() => {
      setTestState(prev => {
        if (prev.listeningTimeLeft <= 0) {
          clearInterval(timer);
          transitionToReading();
          return prev;
        }
        return { ...prev, listeningTimeLeft: prev.listeningTimeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testState.isTestCompleted, testState.currentSection]);

  const transitionToReading = useCallback(() => {
    setShowSectionTransition(true);
    setTimeout(() => {
      setShowSectionTransition(false);
      setTestState((prev: TestState) => ({
        ...prev,
        currentQuestion: READING_QUESTIONS_START,
        currentSection: 'reading',
        isListeningLocked: true,
      }));
    }, 3000);
  }, []);

  const handleAudioEnd = useCallback(() => {
    setAudioHasEnded(true);
    setTimeout(() => {
      setAudioHasEnded(false);
      const nextQuestion = testState.currentQuestion + 1;
      if (nextQuestion > LISTENING_QUESTIONS_COUNT) {
        transitionToReading();
      } else {
        setTestState((prev: TestState) => ({
          ...prev,
          currentQuestion: nextQuestion,
        }));
      }
    }, 500);
  }, [testState.currentQuestion, transitionToReading]);

  const goToQuestion = useCallback((id: number) => {
    if (id < 1 || id > (examData?.totalQuestions ?? TOTAL_QUESTIONS)) return;
    setTestState(prev => ({ ...prev, currentQuestion: id }));
  }, [examData]);

  const handlePrev = useCallback(() => {
    goToQuestion(testState.currentQuestion - 1);
  }, [testState.currentQuestion, goToQuestion]);

  const handleNext = useCallback(() => {
    goToQuestion(testState.currentQuestion + 1);
  }, [testState.currentQuestion, goToQuestion]);

  const handleAnswer = useCallback((questionId: number, answerIndex: number) => {
    setTestState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[questionId] = { ...newAnswers[questionId], answer: answerIndex };
      return { ...prev, answers: newAnswers };
    });

    if (saveTimerRef.current[questionId]) {
      clearTimeout(saveTimerRef.current[questionId]);
    }

    saveTimerRef.current[questionId] = setTimeout(async () => {
      try {
        const apiQuestion = examData?.questions.find(q => q.orderIndex === questionId - 1);
        if (!apiQuestion || !attemptId) return;
        const selectedAnswer = apiQuestion.answers[answerIndex];
        if (!selectedAnswer) return;
        await examAttemptService.saveAnswer({
          attemptId,
          examQuestionId: apiQuestion.examQuestionId,
          selectedAnswerId: selectedAnswer.id,
        });
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }, 500);

    if (testState.currentSection === 'reading') {
      setTimeout(() => handleNext(), 300);
    }
  }, [testState.currentSection, handleNext, examData, attemptId]);

  // ── FIX 5: handleMarkToggle và handleExit phải khai báo TRƯỚC conditional return
  const handleMarkToggle = useCallback(() => {
    setTestState((prev: TestState) => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestion] = {
        ...newAnswers[prev.currentQuestion],
        marked: !newAnswers[prev.currentQuestion].marked,
      };
      return { ...prev, answers: newAnswers };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    try {
      const result = await examAttemptService.submitExam(attemptId);
      messageApi.success('Nộp bài thành công!', 2);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(EXAM_DATA_KEY);
      setExamResult(result);
      setTestState(prev => ({ ...prev, isTestCompleted: true }));
      navigate(`/full-test/result/${attemptId}`, {
        state: { result, attemptId },
      });
    } catch (err: any) {
      console.error('Submit failed:', err);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(EXAM_DATA_KEY);
      const errorMsg = err?.response?.data?.message || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!';
      messageApi.error(errorMsg, 5);
    }
  }, [attemptId, navigate, STORAGE_KEY, EXAM_DATA_KEY, messageApi]);

  const handleExit = useCallback(async () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn thoát? Bài thi sẽ được NỘP NGAY và không thể làm tiếp.'
    );
    if (!confirmed) return;
    try {
      await examAttemptService.submitExam(attemptId!);
    } catch (err) {
      console.error('Submit on exit failed:', err);
    } finally {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(EXAM_DATA_KEY);
      navigate('/full-test');
    }
  }, [navigate, attemptId, STORAGE_KEY, EXAM_DATA_KEY]);

  const toggleNav = useCallback(() => {
    setIsNavCollapsed(prev => !prev);
  }, []);

  // ── Đóng tab → nộp bài
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testState.isTestCompleted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testState.isTestCompleted]);

  if (testState.isTestCompleted && examResult) {
    return <ResultPage result={examResult} attemptId={attemptId!} />;
  }

  // Nếu chưa có examData → đang load resume
  if (!examData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Đang tải bài thi...</p>
      </div>
    );
  }

  const answeredCount = testState.answers.filter(a => a.answer !== null).length;
  const actualTotalQuestions = examData.totalQuestions ?? TOTAL_QUESTIONS;

  // Anti cheat các hook chống gian lận 
  const { warningCount } = useAntiCheat({
    maxWarnings: 3, // Vi phạm 3 lần là nộp bài luôn
    isTestCompleted: testState.isTestCompleted,
    onForceSubmit: () => {
      messageApi.error('Hệ thống đang tự động nộp bài do vi phạm quy chế...', 3);
      handleSubmit();
    }
  });

  return (
    <div className="full-test-page">
      {/* Section Transition Modal */}
      {showSectionTransition && (
        <div className="section-transition-overlay">
          <div className="section-transition-modal">
            <div className="transition-icon"></div>
            <h2>Phần Listening đã hoàn thành!</h2>
            <p>Đang chuyển sang phần Reading...</p>
            <div className="transition-spinner"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        timeLeft={testState.timeLeft}
        onSubmit={() => setIsModalOpen(true)}
        onExit={handleExit}
        answeredCount={answeredCount}
        totalQuestions={examData?.totalQuestions ?? TOTAL_QUESTIONS}
        currentQuestion={testState.currentQuestion}
        currentSection={testState.currentSection}
      />

      {/* Main Content */}
      <main className="test-main">
        <div className="test-container">
          {/* Question Area - Chiếm toàn bộ chiều rộng khi nav collapsed */}
          <div className={`question-section ${isNavCollapsed ? 'expanded' : ''}`}>
            <QuestionArea
              currentQuestion={testState.currentQuestion}
              answers={testState.answers}
              onAnswer={handleAnswer}
              onAudioEnd={handleAudioEnd}
              questions={examData?.questions ?? []}
            />
          </div>

          {/* Navigation Sidebar */}
          {/* {!isNavCollapsed && (
            <div className="nav-section">
              <QuestionNav
                currentQuestion={testState.currentQuestion}
                answers={testState.answers}
                onNavigate={goToQuestion}
                onPrev={handlePrev}
                onNext={handleNext}
                marked={testState.answers[testState.currentQuestion]?.marked}
                onMarkToggle={handleMarkToggle}
                onClose={toggleNav}
              />
            </div>
          )} */}
        </div>
      </main>

      {/* Floating Action Button cho mobile */}
      <button
        className="floating-nav-btn"
        onClick={toggleNav}
        title="Danh sách câu hỏi"
      >
        📋
        {answeredCount > 0 && (
          <span className="floating-badge">{answeredCount}</span>
        )}
      </button>

      <BottomQuestionBar
        currentQuestion={testState.currentQuestion}
        answers={testState.answers}
        onNavigate={goToQuestion}
        onPrev={handlePrev}
        onNext={handleNext}
        marked={testState.answers[testState.currentQuestion]?.marked ?? false}
        onMarkToggle={handleMarkToggle}
        totalQuestions={examData?.totalQuestions ?? 200}
        sections={examData?.sections ?? []}
        isListening={testState.currentSection === 'listening'}
        isListeningLocked={testState.isListeningLocked}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default FullTestPage;