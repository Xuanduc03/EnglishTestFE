import React, { useState, useEffect } from 'react';
import './Practice.scss';

export interface FillInBlankQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  explanation?: string;
  hint?: string;
}

export interface PracticeSession {
  questions: FillInBlankQuestion[];
  currentQuestionIndex: number;
  userAnswers: { [key: number]: string };
  showExplanation: boolean;
  isCompleted: boolean;
}

const PracticeSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [session, setSession] = useState<PracticeSession>({
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    showExplanation: false,
    isCompleted: false
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentQuestion = session.questions[session.currentQuestionIndex];

  useEffect(() => {
    // Fetch câu hỏi từ API
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/practice-questions');
        const data = await res.json();
        setSession(prev => ({
          ...prev,
          questions: data
        }));
      } catch (err) {
        // Nếu lỗi, có thể dùng dữ liệu mẫu
        setSession(prev => ({
          ...prev,
          questions: [
            {
              id: 1,
              question: "She ___ to school every day.",
              correctAnswer: "goes",
              explanation: "Chủ ngữ 'She' đi với động từ thêm 'es' ở thì hiện tại đơn.",
              hint: "Động từ thường, chủ ngữ là 'She'"
            },
            {
              id: 2,
              question: "They ___ football on Sundays.",
              correctAnswer: "play",
              explanation: "Với 'They', động từ giữ nguyên ở thì hiện tại đơn.",
              hint: "Động từ thường, chủ ngữ là số nhiều"
            }
          ]
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleCheckAnswer = () => {
    if (!currentAnswer.trim()) return;

    const isCorrect = currentAnswer.trim().toLowerCase() === 
                     currentQuestion.correctAnswer.toLowerCase();

    const updatedAnswers = {
      ...session.userAnswers,
      [session.currentQuestionIndex]: currentAnswer
    };

    setSession(prev => ({
      ...prev,
      userAnswers: updatedAnswers,
      showExplanation: true
    }));

    setShowHint(false);
  };

  const handleNextQuestion = () => {
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showExplanation: false
      }));
      setCurrentAnswer('');
      setShowHint(false);
    } else {
      setSession(prev => ({
        ...prev,
        isCompleted: true
      }));
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handleRestartPractice = () => {
    setSession({
      questions: session.questions,
      currentQuestionIndex: 0,
      userAnswers: {},
      showExplanation: false,
      isCompleted: false
    });
    setCurrentAnswer('');
    setShowHint(false);
  };

  const calculateScore = () => {
    let correctCount = 0;
    session.questions.forEach((question, index) => {
      const userAnswer = session.userAnswers[index];
      if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    return (correctCount / session.questions.length) * 100;
  };

  const calculateProgress = () => {
    return session.questions.length === 0
      ? 0
      : ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
  };

  const getCurrentAnswerStatus = () => {
    if (!session.showExplanation) return '';
    const isCorrect = currentAnswer.trim().toLowerCase() === 
                     currentQuestion.correctAnswer.toLowerCase();
    return isCorrect ? 'correct' : 'incorrect';
  };

  const getQuestionTextWithBlank = (questionText: string) => {
    const parts = questionText.split('___');
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className={`blank ${currentAnswer ? 'filled' : ''}`}>
                {session.showExplanation ? currentQuestion.correctAnswer : '___'}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  if (loading || !session.questions || session.questions.length === 0) {
    return (
      <section id="practice-section" className={isVisible ? 'visible' : ''}>
        <div className="practice-container">
          <div className="practice-content">
            <div className="practice-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải câu hỏi...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (session.isCompleted) {
    const score = calculateScore();
    const correctCount = Object.values(session.userAnswers).filter(
      (answer, index) => answer.toLowerCase() === session.questions[index].correctAnswer.toLowerCase()
    ).length;

    return (
      <section id="practice-section" className={isVisible ? 'visible' : ''}>
        <div className="practice-container">
          <div className="practice-content">
            <div className="practice-results">
              <h2 className="results-title">🎉 Hoàn Thành Bài Luyện Tập!</h2>
              <div className="score-display">
                <span className="score-percentage">{Math.round(score)}%</span>
              </div>
              <div className="results-summary">
                <p>
                  Bạn đã trả lời đúng <strong>{correctCount}</strong> trên tổng số{' '}
                  <strong>{session.questions.length}</strong> câu hỏi
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  {score >= 80 ? '🎯 Xuất sắc! Tiếp tục phát huy nhé!' : 
                   score >= 60 ? '👍 Khá tốt! Ôn tập thêm để cải thiện!' :
                   '💪 Cố gắng hơn nữa! Bạn sẽ tiến bộ nhanh thôi!'}
                </p>
              </div>
              <button 
                className="restart-button"
                onClick={handleRestartPractice}
              >
                Làm Lại Bài Tập
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="practice-section" className={isVisible ? 'visible' : ''}>
      <div className="practice-container">
        {/* Header */}
        <div className="practice-header">
          <div className="header-content">
            <h2 className="practice-title">Điền từ</h2>
            <div className="progress-container">
              <span className="progress-text">
                Câu {session.currentQuestionIndex + 1}/{session.questions.length}
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="practice-progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
        {/* Content */}
        <div className="practice-content">
          <div className="question-content">
            <h3 className="question-text">
              {getQuestionTextWithBlank(currentQuestion.question)}
            </h3>
            <div className="answer-input-container">
              <label className="input-label">Nhập đáp án của bạn:</label>
              <input
                type="text"
                className={`answer-input ${getCurrentAnswerStatus()}`}
                value={currentAnswer}
                onChange={handleAnswerChange}
                disabled={session.showExplanation}
                placeholder="Gõ câu trả lời..."
              />
              {showHint && currentQuestion.hint && (
                <div className="input-hint">
                  💡 Gợi ý: {currentQuestion.hint}
                </div>
              )}
            </div>
            {session.showExplanation && (
              <div className={`result-feedback ${getCurrentAnswerStatus()}`}>
                {getCurrentAnswerStatus() === 'correct' ? '✅ Chính xác!' : '❌ Chưa đúng!'}
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="action-buttons">
            {!session.showExplanation ? (
              <>
                <button
                  className="practice-button check-button"
                  onClick={handleCheckAnswer}
                  disabled={!currentAnswer.trim()}
                >
                  Kiểm tra
                </button>
                {currentQuestion.hint && !showHint && (
                  <button
                    className="practice-button hint-button"
                    onClick={handleShowHint}
                  >
                    Gợi ý
                  </button>
                )}
              </>
            ) : (
              <button
                className="practice-button next-button"
                onClick={handleNextQuestion}
              >
                {session.currentQuestionIndex < session.questions.length - 1 
                  ? 'Câu tiếp theo' 
                  : 'Xem kết quả'}
              </button>
            )}
          </div>
          {/* Explanation */}
          {session.showExplanation && currentQuestion.explanation && (
            <div className="explanation">
              <strong>Giải thích:</strong> {currentQuestion.explanation}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PracticeSection;
// filepath: d:\PersonalProject\Web_Thi\toeic-web-fe\src\components\Vocabulary\Practice.tsx