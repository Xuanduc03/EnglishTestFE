import React, { useState, useEffect } from 'react';
import './Quiz.scss';
import axios from 'axios';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizProgress {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

type QuizProps = {
  onQuizComplete?: (score: number) => void;
};

const Quiz: React.FC<QuizProps> = ({ onQuizComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [progress, setProgress] = useState<QuizProgress>({
    currentQuestion: 1,
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });

  useEffect(() => {
    // Animation khi component mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    // Gọi API lấy câu hỏi quiz
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/quiz');
        setQuestions(res.data);
        setProgress(prev => ({
          ...prev,
          totalQuestions: res.data.length
        }));
      } catch (err: any) {
        setError('Không thể tải câu hỏi quiz!');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    setProgress(prev => ({
      ...prev,
      currentQuestion: currentQuestionIndex + 1
    }));
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedOption(optionIndex);
    setShowExplanation(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setProgress(prev => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      onQuizComplete?.(progress.correctAnswers);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    setProgress({
      currentQuestion: 1,
      totalQuestions: questions.length,
      correctAnswers: 0,
      incorrectAnswers: 0
    });
  };

  const getOptionClassName = (optionIndex: number) => {
    let className = 'option-button';
    if (!showExplanation) {
      return selectedOption === optionIndex ? `${className} selected` : className;
    }
    if (optionIndex === currentQuestion.correctAnswer) {
      return `${className} correct`;
    }
    if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctAnswer) {
      return `${className} incorrect`;
    }
    return `${className} disabled`;
  };

  const calculateProgressPercentage = () => {
    return progress.totalQuestions === 0 ? 0 : (progress.currentQuestion / progress.totalQuestions) * 100;
  };

  const calculateScorePercentage = () => {
    return progress.totalQuestions === 0 ? 0 : (progress.correctAnswers / progress.totalQuestions) * 100;
  };

  if (loading) {
    return (
      <section id="quiz-section" className={isVisible ? 'visible' : ''}>
        <div className="quiz-container">
          <div className="quiz-content">
            <p>Đang tải câu hỏi...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="quiz-section" className={isVisible ? 'visible' : ''}>
        <div className="quiz-container">
          <div className="quiz-content">
            <p className="error-message">{error}</p>
            <button className="restart-button" onClick={handleRestartQuiz}>Thử lại</button>
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section id="quiz-section" className={isVisible ? 'visible' : ''}>
        <div className="quiz-container">
          <div className="quiz-content">
            <p>Không có câu hỏi nào!</p>
          </div>
        </div>
      </section>
    );
  }

  if (quizCompleted) {
    const scorePercentage = calculateScorePercentage();
    return (
      <section id="quiz-section" className={isVisible ? 'visible' : ''}>
        <div className="quiz-container">
          <div className="quiz-content">
            <div className="quiz-results">
              <h2 className="results-title">🎉 Quiz Hoàn Thành!</h2>
              <div
                className="score-circle"
                style={{ '--percentage': `${scorePercentage}%` } as React.CSSProperties}
              >
                <span className="score-text">{Math.round(scorePercentage)}%</span>
              </div>
              <p className="results-message">
                Bạn đã trả lời đúng <strong>{progress.correctAnswers}</strong> trên tổng số{' '}
                <strong>{progress.totalQuestions}</strong> câu hỏi
              </p>
              <button
                className="restart-button"
                onClick={handleRestartQuiz}
              >
                Làm Lại Quiz
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quiz-section" className={isVisible ? 'visible' : ''}>
      <div className="quiz-container">
        {/* Quiz Header */}
        <div className="quiz-header">
          <div className="header-content">
            <h2 className="quiz-title">🎯 Quiz Từ Vựng</h2>
            <div className="score-container">
              <div className="score-item">
                <p className="score-value correct">
                  {progress.correctAnswers}
                </p>
                <p className="score-label">Đúng</p>
              </div>
              <div className="score-item">
                <p className="score-value incorrect">
                  {progress.incorrectAnswers}
                </p>
                <p className="score-label">Sai</p>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="quiz-progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${calculateProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="quiz-progress-text">
            Câu {progress.currentQuestion}/{progress.totalQuestions}
          </p>
        </div>
        {/* Quiz Content */}
        <div className="quiz-content">
          {currentQuestion ? (
            <>
              <h3 className="question-text">{currentQuestion.question}</h3>
              <div className="options-container">
                {currentQuestion && currentQuestion.options ? (
                  currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      className={getOptionClassName(index)}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showExplanation}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <p>Không có đáp án!</p>
                )}
              </div>
              {showExplanation && currentQuestion.explanation && (
                <div className="explanation">
                  <strong>Giải thích:</strong> {currentQuestion.explanation}
                </div>
              )}
              {showExplanation && (
                <button
                  className="next-button"
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}
                </button>
              )}
            </>
          ) : (
            <p>Không tìm thấy câu hỏi!</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Quiz;
