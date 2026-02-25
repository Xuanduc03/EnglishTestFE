import React, { useState, useEffect, useCallback } from 'react';
import type { TestState } from '../../../types/test';
import { TOTAL_QUESTIONS, INITIAL_TIME, LISTENING_TIME, LISTENING_QUESTIONS_COUNT, READING_QUESTIONS_START } from '../../../constants/test';
import { getQuestionData, isListeningQuestion, getCurrentSection } from '../../../utils/testHelper';
import Header from '../../../components/Test/TestComponent/Header/Header';
import QuestionArea from '../../../components/Test/TestComponent/QuestionArea/QuestionArea';
import QuestionNav from '../../../components/Test/TestComponent/QuestionNav/QuestionNav';
import BottomQuestionBar from '../../../components/Test/TestComponent/BottomQuestionBar/BottomQuestionBar';
import ConfirmationModal from '../../../components/Test/TestComponent/ConfirmModal/ConfirmationModal';
import ResultPage from '../../../components/Test/TestComponent/ResultPage/ResultPage';
import './FullTestPage.scss';


const FullTestPage: React.FC = () => {
  const [testState, setTestState] = useState<TestState>({
    currentQuestion: 1,
    answers: new Array(TOTAL_QUESTIONS + 1).fill(null).map(() => ({
      answer: null,
      marked: false,
    })),
    timeLeft: INITIAL_TIME,
    isTestCompleted: false,
    currentSection: 'listening', // Start with Listening section
    listeningTimeLeft: LISTENING_TIME, // 45 minutes for Listening
    isListeningLocked: false, // Lock after moving to Reading
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [audioHasEnded, setAudioHasEnded] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);

  // Main timer effect (total test time)
  useEffect(() => {
    if (testState.isTestCompleted) return;

    const timer = setInterval(() => {
      setTestState((prev: TestState) => {
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

  // Listening section timer effect
  useEffect(() => {
    if (testState.isTestCompleted || testState.currentSection !== 'listening') return;

    const listeningTimer = setInterval(() => {
      setTestState((prev: TestState) => {
        if (prev.listeningTimeLeft <= 0) {
          clearInterval(listeningTimer);
          // Auto-transition to Reading section when Listening time expires
          transitionToReading();
          return prev;
        }
        return { ...prev, listeningTimeLeft: prev.listeningTimeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(listeningTimer);
  }, [testState.isTestCompleted, testState.currentSection]);

  const transitionToReading = useCallback(() => {
    setShowSectionTransition(true);

    // Auto-hide notification after 3 seconds and move to Reading
    setTimeout(() => {
      setShowSectionTransition(false);
      setTestState((prev: TestState) => ({
        ...prev,
        currentQuestion: READING_QUESTIONS_START, // Jump to question 101
        currentSection: 'reading',
        isListeningLocked: true,
      }));
    }, 3000);
  }, []);

  const handleAnswer = useCallback((questionId: number, answerIndex: number) => {
    setTestState((prev: TestState) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionId] = { ...newAnswers[questionId], answer: answerIndex };
      return { ...prev, answers: newAnswers };
    });

    // For Listening section: Do NOT auto-advance on answer
    // Wait for audio to end (handled by handleAudioEnd)

    // For Reading section: Auto-advance for single questions only
    if (testState.currentSection === 'reading') {
      const questionData = getQuestionData(questionId);
      if (questionData.type !== 'reading_block') {
        setTimeout(() => handleNext(), 300);
      }
    }
  }, [testState.currentSection]);

  const handleAudioEnd = useCallback(() => {
    setAudioHasEnded(true);

    // Auto-advance to next question after audio ends
    setTimeout(() => {
      setAudioHasEnded(false);

      const nextQuestion = testState.currentQuestion + 1;

      // Check if we've completed Listening section
      if (nextQuestion > LISTENING_QUESTIONS_COUNT) {
        transitionToReading();
      } else {
        setTestState((prev: TestState) => ({
          ...prev,
          currentQuestion: nextQuestion,
        }));
      }
    }, 500); // Small delay for better UX
  }, [testState.currentQuestion, transitionToReading]);

  const goToQuestion = useCallback((id: number) => {
    // STRICT RULE: Cannot navigate during Listening section
    if (testState.currentSection === 'listening') {
      console.warn('Navigation disabled during Listening section');
      return;
    }

    // STRICT RULE: Cannot go back to Listening section once in Reading
    if (testState.isListeningLocked && isListeningQuestion(id)) {
      console.warn('Cannot navigate back to Listening section');
      return;
    }

    if (id < 1 || id > TOTAL_QUESTIONS) return;

    const data = getQuestionData(id);
    if (data.type === 'reading_block') {
      setTestState((prev: TestState) => ({ ...prev, currentQuestion: data.questions[0].id }));
    } else {
      setTestState((prev: TestState) => ({ ...prev, currentQuestion: id }));
    }
  }, [testState.currentSection, testState.isListeningLocked]);

  const handlePrev = useCallback(() => {
    // STRICT RULE: No Previous button during Listening
    if (testState.currentSection === 'listening') {
      return;
    }

    const data = getQuestionData(testState.currentQuestion);
    let prevId = testState.currentQuestion - 1;

    // Don't go back to Listening section
    if (prevId < READING_QUESTIONS_START) {
      return;
    }

    if (data.type === 'reading_block') {
      const prevData = getQuestionData(testState.currentQuestion - 1);
      if (prevData.type === 'reading_block') {
        prevId = prevData.questions[0].id;
      }
    }

    goToQuestion(prevId);
  }, [testState.currentQuestion, testState.currentSection, goToQuestion]);

  const handleNext = useCallback(() => {
    // STRICT RULE: No manual Next during Listening (auto-advance only)
    if (testState.currentSection === 'listening') {
      return;
    }

    const data = getQuestionData(testState.currentQuestion);
    let nextId = testState.currentQuestion + 1;

    if (data.type === 'reading_block') {
      nextId = data.questions[data.questions.length - 1].id + 1;
    }

    goToQuestion(nextId);
  }, [testState.currentQuestion, testState.currentSection, goToQuestion]);

  const handleMarkToggle = useCallback(() => {
    const data = getQuestionData(testState.currentQuestion);

    setTestState((prev: TestState) => {
      const newAnswers = [...prev.answers];
      if (data.type === 'reading_block') {
        data.questions.forEach((q: any) => {
          newAnswers[q.id] = {
            ...newAnswers[q.id],
            marked: !newAnswers[testState.currentQuestion].marked,
          };
        });
      } else {
        newAnswers[testState.currentQuestion] = {
          ...newAnswers[testState.currentQuestion],
          marked: !newAnswers[testState.currentQuestion].marked,
        };
      }
      return { ...prev, answers: newAnswers };
    });
  }, [testState.currentQuestion]);

  const handleSubmit = useCallback(() => {
    setTestState((prev: TestState) => ({ ...prev, isTestCompleted: true }));
    setIsModalOpen(false);
  }, []);

  const toggleNav = useCallback(() => {
    setIsNavCollapsed(prev => !prev);
  }, []);

  // Tính toán số câu đã làm
  const answeredCount = testState.answers.filter(answer => answer.answer !== null).length;
  const progressPercentage = (answeredCount / TOTAL_QUESTIONS) * 100;

  if (testState.isTestCompleted) {
    return <ResultPage />;
  }

  return (
    <div className="full-test-page">
      {/* Section Transition Modal */}
      {showSectionTransition && (
        <div className="section-transition-overlay">
          <div className="section-transition-modal">
            <div className="transition-icon">✅</div>
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
        answeredCount={answeredCount}
        totalQuestions={TOTAL_QUESTIONS}
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
            />
          </div>

          {/* Navigation Sidebar - ONLY show during Reading section */}
          {testState.currentSection === 'reading' && !isNavCollapsed && (
            <div className="nav-section">
              <QuestionNav
                currentQuestion={testState.currentQuestion}
                answers={testState.answers}
                onNavigate={goToQuestion}
                onPrev={handlePrev}
                onNext={handleNext}
                marked={testState.answers[testState.currentQuestion].marked}
                onMarkToggle={handleMarkToggle}
                onClose={toggleNav}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button cho mobile - ONLY in Reading */}
      {testState.currentSection === 'reading' && (
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
      )}

      {/* Bottom Question Number Bar - ONLY in Reading */}
      {testState.currentSection === 'reading' && (
        <BottomQuestionBar
          currentQuestion={testState.currentQuestion}
          answers={testState.answers}
          onNavigate={goToQuestion}
          totalQuestions={TOTAL_QUESTIONS}
        />
      )}

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