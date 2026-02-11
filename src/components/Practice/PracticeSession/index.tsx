import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal, Progress } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FlagOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { PracticeService } from '../Services/practice.service';
import './PracticeSession.scss';
import QuestionNavigator from '../QuestionNavigator';
import type { PracticeState } from '../Types/practice.type';
import QuestionDisplay from '../QuestionDisplay';

const PracticeSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<PracticeState>({
    session: null,
    currentQuestionIndex: 0,
    answers: new Map(),
    markedForReview: new Set(),
    startTime: new Date(),
    timeSpent: 0,
    isSubmitting: false
  });

  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // ============================================
  // LOAD SESSION
  // ============================================

  useEffect(() => {
    if (!sessionId) {
      message.error('Session ID không hợp lệ');
      navigate('/practice');
      return;
    }

    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const session = await PracticeService.resumePractice(sessionId!);
      
      setState(prev => ({
        ...prev,
        session,
        startTime: new Date()
      }));

      // Set timer if timed practice
      if (session.duration > 0) {
        setTimeRemaining(session.duration * 60); // Convert minutes to seconds
      }
    } catch (error: any) {
      console.error('Load session error:', error);
      message.error('Không thể tải session practice');
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TIMER
  // ============================================

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleTimeOut = () => {
    Modal.warning({
      title: 'Hết giờ!',
      content: 'Thời gian luyện tập đã hết. Bài thi sẽ được tự động nộp.',
      onOk: () => handleSubmit()
    });
  };

  // ============================================
  // CURRENT QUESTION
  // ============================================

  const currentQuestion = (() => {
    if (!state.session) return null;

    let questionCount = 0;
    for (const part of state.session.parts) {
      if (state.currentQuestionIndex < questionCount + part.questions.length) {
        return part.questions[state.currentQuestionIndex - questionCount];
      }
      questionCount += part.questions.length;
    }
    return null;
  })();

  // ============================================
  // NAVIGATION
  // ============================================

  const goToQuestion = (index: number) => {
    if (!state.session) return;
    
    const totalQuestions = state.session.totalQuestions;
    if (index < 0 || index >= totalQuestions) return;

    setState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }));
  };

  const goToPrevious = () => {
    goToQuestion(state.currentQuestionIndex - 1);
  };

  const goToNext = () => {
    goToQuestion(state.currentQuestionIndex + 1);
  };

  // ============================================
  // ANSWER HANDLING
  // ============================================

  const handleSelectAnswer = async (questionId: string, answerId: string) => {
    // Update local state
    setState(prev => {
      const newAnswers = new Map(prev.answers);
      newAnswers.set(questionId, answerId);
      return { ...prev, answers: newAnswers };
    });

    // Submit to backend
    try {
      await PracticeService.submitAnswer({
        sessionId: sessionId!,
        questionId,
        answerId,
        isMarkedForReview: state.markedForReview.has(questionId)
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      // Don't show error to user, just log it
    }
  };

  const handleMarkForReview = (questionId: string) => {
    setState(prev => {
      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return { ...prev, markedForReview: newMarked };
    });
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    const unanswered = state.session!.totalQuestions - state.answers.size;

    if (unanswered > 0) {
      Modal.confirm({
        title: 'Xác nhận nộp bài',
        content: `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
        okText: 'Nộp bài',
        cancelText: 'Tiếp tục làm',
        onOk: () => submitPractice()
      });
    } else {
      Modal.confirm({
        title: 'Xác nhận nộp bài',
        content: 'Bạn đã hoàn thành tất cả câu hỏi. Xác nhận nộp bài?',
        okText: 'Nộp bài',
        cancelText: 'Xem lại',
        onOk: () => submitPractice()
      });
    }
  };

  const submitPractice = async () => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      const result = await PracticeService.submitPractice(sessionId!);
      
      message.success('Nộp bài thành công!');
      navigate(`/practice/result/${sessionId}`);
    } catch (error: any) {
      console.error('Submit practice error:', error);
      message.error('Nộp bài thất bại. Vui lòng thử lại.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // ============================================
  // ABANDON
  // ============================================

  const handleAbandon = () => {
    Modal.confirm({
      title: 'Thoát khỏi bài luyện tập?',
      content: 'Tiến trình của bạn sẽ được lưu lại. Bạn có thể tiếp tục sau.',
      okText: 'Thoát',
      cancelText: 'Ở lại',
      onOk: async () => {
        try {
          await PracticeService.abandonPractice(sessionId!);
          navigate('/practice');
        } catch (error) {
          console.error('Abandon error:', error);
          navigate('/practice');
        }
      }
    });
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="practice-session loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải bài luyện tập...</p>
        </div>
      </div>
    );
  }

  if (!state.session || !currentQuestion) {
    return (
      <div className="practice-session error">
        <p>Không tìm thấy session</p>
      </div>
    );
  }

  const answeredCount = state.answers.size;
  const progress = (answeredCount / state.session.totalQuestions) * 100;

  return (
    <div className="practice-session">
      {/* Header */}
      <div className="practice-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleAbandon}>
            <LeftOutlined /> Thoát
          </button>
          <h2 className="session-title">{state.session.title}</h2>
        </div>

        <div className="header-center">
          <Progress
            percent={Math.round(progress)}
            size="small"
            format={() => `${answeredCount}/${state.session!.totalQuestions}`}
          />
        </div>

        <div className="header-right">
          {timeRemaining !== null && (
            <div className="timer">
              <ClockCircleOutlined />
              <span className={timeRemaining < 300 ? 'warning' : ''}>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}
          
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="practice-content">
        {/* Question Navigator Sidebar */}
        <QuestionNavigator
          session={state.session}
          currentIndex={state.currentQuestionIndex}
          answers={state.answers}
          markedForReview={state.markedForReview}
          onNavigate={goToQuestion}
        />

        {/* Question Display */}
        <div className="question-area">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={state.currentQuestionIndex + 1}
            selectedAnswerId={state.answers.get(currentQuestion.questionId)}
            isMarkedForReview={state.markedForReview.has(currentQuestion.questionId)}
            onSelectAnswer={(answerId) => handleSelectAnswer(currentQuestion.questionId, answerId)}
            onMarkForReview={() => handleMarkForReview(currentQuestion.questionId)}
          />

          {/* Navigation Buttons */}
          <div className="question-navigation">
            <button
              className="nav-btn prev"
              onClick={goToPrevious}
              disabled={state.currentQuestionIndex === 0}
            >
              <LeftOutlined /> Câu trước
            </button>

            <button
              className="nav-btn mark"
              onClick={() => handleMarkForReview(currentQuestion.questionId)}
            >
              <FlagOutlined />
              {state.markedForReview.has(currentQuestion.questionId) 
                ? 'Bỏ đánh dấu' 
                : 'Đánh dấu xem lại'}
            </button>

            <button
              className="nav-btn next"
              onClick={goToNext}
              disabled={state.currentQuestionIndex === state.session.totalQuestions - 1}
            >
              Câu sau <RightOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;