import React, { useState, useEffect, useCallback } from 'react';
import type { TestState } from '../../../types/test';
import { TOTAL_QUESTIONS, INITIAL_TIME } from '../../../constants/test';
import { getQuestionData } from '../../../utils/testHelper';
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
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Timer effect
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

  const handleAnswer = useCallback((questionId: number, answerIndex: number) => {
    setTestState((prev: TestState) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionId] = { ...newAnswers[questionId], answer: answerIndex };
      return { ...prev, answers: newAnswers };
    });

    const questionData = getQuestionData(questionId);
    if (questionData.type !== 'reading_block') {
      setTimeout(() => handleNext(), 300);
    }
  }, []);

  const goToQuestion = useCallback((id: number) => {
    if (id < 1 || id > TOTAL_QUESTIONS) return;

    const data = getQuestionData(id);
    if (data.type === 'reading_block') {
      setTestState((prev: TestState) => ({ ...prev, currentQuestion: data.questions[0].id }));
    } else {
      setTestState((prev: TestState) => ({ ...prev, currentQuestion: id }));
    }
  }, []);

  const handlePrev = useCallback(() => {
    const data = getQuestionData(testState.currentQuestion);
    let prevId = testState.currentQuestion - 1;

    if (data.type === 'reading_block') {
      const prevData = getQuestionData(testState.currentQuestion - 1);
      if (prevData.type === 'reading_block') {
        prevId = prevData.questions[0].id;
      }
    }

    goToQuestion(prevId);
  }, [testState.currentQuestion, goToQuestion]);

  const handleNext = useCallback(() => {
    const data = getQuestionData(testState.currentQuestion);
    let nextId = testState.currentQuestion + 1;

    if (data.type === 'reading_block') {
      nextId = data.questions[data.questions.length - 1].id + 1;
    }

    goToQuestion(nextId);
  }, [testState.currentQuestion, goToQuestion]);

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
      {/* Header */}
      <Header
        timeLeft={testState.timeLeft}
        onSubmit={() => setIsModalOpen(true)}
        progressPercentage={progressPercentage}
        answeredCount={answeredCount}
        totalQuestions={TOTAL_QUESTIONS}
      />

      {/* Main Content */}
      <main className="test-main">
        <div className="test-container">
          {/* Question Area - Chiếm toàn bộ chiều rộng khi nav collapsed */}
          <div className={`question-section ${isNavCollapsed ? 'expanded' : ''}`}>
            <div className="question-area-header">
              <button 
                className="nav-toggle-btn"
                onClick={toggleNav}
                title={isNavCollapsed ? "Hiện danh sách câu hỏi" : "Ẩn danh sách câu hỏi"}
              >
                {isNavCollapsed ? '📋' : '✕'}
              </button>
              <div className="current-question-info">
                <span className="part-badge">Part {getQuestionData(testState.currentQuestion).part}</span>
                <h2>Câu hỏi {testState.currentQuestion}</h2>
                <span className="progress-text">
                  {answeredCount}/{TOTAL_QUESTIONS} câu đã làm
                </span>
              </div>
            </div>
            
            <QuestionArea
              currentQuestion={testState.currentQuestion}
              answers={testState.answers}
              onAnswer={handleAnswer}
            />
          </div>

          {/* Navigation Sidebar */}
          {!isNavCollapsed && (
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

      {/* Bottom Question Number Bar */}
      <BottomQuestionBar
        currentQuestion={testState.currentQuestion}
        answers={testState.answers}
        onNavigate={goToQuestion}
        totalQuestions={TOTAL_QUESTIONS}
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