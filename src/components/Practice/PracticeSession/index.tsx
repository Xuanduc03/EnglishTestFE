import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Modal, Progress } from "antd";
import {
  ClockCircleOutlined,
  FlagOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { PracticeService } from "../Services/practice.service";
import "./PracticeSession.scss";
import QuestionNavigator from "../QuestionNavigator";
import type { PracticeState } from "../Types/practice.type";
import QuestionDisplay from "../QuestionDisplay";
import { formatTime } from "../../../utils/testHelper";
import ConfirmModal from "../../shared/modal/ConfirmModal";
import useConfirmModal from "../../shared/modal/useConfirmModal";
import { toast } from "react-toastify";

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
    isSubmitting: false,
  });

  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─────────────────────────────────────────────
  // SUBMIT — gom tất cả answers local, call API 1 lần
  // ─────────────────────────────────────────────

  const submitPractice = useCallback(async () => {
    if (!state.session) return;

    try {
      setState((prev) => ({ ...prev, isSubmitting: true }));

      // Clear timer trước khi submit
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Tính tổng thời gian đã làm
      const totalTimeSeconds = Math.floor(
        (new Date().getTime() - state.startTime.getTime()) / 1000
      );

      // Gom toàn bộ câu trả lời local thành 1 payload
      const allQuestions = state.session.parts.flatMap((p) => p.questions);
      const answersPayload = allQuestions.map((q) => ({
        questionId: q.questionId,
        answerId: state.answers.get(q.questionId) ?? null,
        isMarkedForReview: state.markedForReview.has(q.questionId),
      }));

      await PracticeService.submitPractice({
        sessionId: sessionId!,
        answers: answersPayload,
        totalTimeSeconds,
      });

      message.success("Nộp bài thành công!");
      navigate(`/practice/result/${sessionId}`);
    } catch (error: any) {
      console.error("Submit practice error:", error);
      message.error("Nộp bài thất bại. Vui lòng thử lại.");
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [sessionId, navigate, state.session, state.answers, state.markedForReview, state.startTime]);

  const displayPages = useMemo(() => {
    if (!state.session) return [];

    // Mảng chứa các trang. Mỗi trang có thể là 1 câu (Part 1,2) hoặc nhiều câu (Part 3,4,6,7)
    const pages: { part: any; questions: any[]; startIndex: number }[] = [];
    let absoluteIndex = 0; // Chạy từ 0 đến Tổng số câu hỏi

    state.session.parts.forEach((part) => {
      let currentGroup: any[] = [];
      let currentGroupId: string | null = null;

      part.questions.forEach((q) => {
        if (!q.groupId) {
          // Nếu là câu đơn -> Đóng gói luôn thành 1 trang riêng
          if (currentGroup.length > 0) {
            pages.push({ part, questions: currentGroup, startIndex: absoluteIndex - currentGroup.length });
            currentGroup = [];
          }
          pages.push({ part, questions: [q], startIndex: absoluteIndex });
        } else {
          // Nếu là câu nhóm -> Gom vào currentGroup
          if (q.groupId === currentGroupId) {
            currentGroup.push(q);
          } else {
            // Khi sang nhóm mới, chốt sổ nhóm cũ đẩy vào mảng
            if (currentGroup.length > 0) {
              pages.push({ part, questions: currentGroup, startIndex: absoluteIndex - currentGroup.length });
            }
            currentGroupId = q.groupId;
            currentGroup = [q];
          }
        }
        absoluteIndex++;
      });
      // Chốt sổ nhóm cuối cùng của Part (nếu có)
      if (currentGroup.length > 0) {
        pages.push({ part, questions: currentGroup, startIndex: absoluteIndex - currentGroup.length });
      }
    });

    return pages;
  }, [state.session]);

  // Tìm Trang hiện tại đang hiển thị
  const activePageIndex = displayPages.findIndex(
    (page) =>
      state.currentQuestionIndex >= page.startIndex &&
      state.currentQuestionIndex < page.startIndex + page.questions.length
  );
  const activePage = activePageIndex >= 0 ? displayPages[activePageIndex] : null;

  // ─────────────────────────────────────────────
  // 📍 2. NAVIGATION (ĐIỀU HƯỚNG BẰNG TRANG)
  // ─────────────────────────────────────────────

  const handleNextPage = () => {
    if (activePageIndex < displayPages.length - 1) {
      const nextPage = displayPages[activePageIndex + 1];
      goToQuestion(nextPage.startIndex);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      const prevPage = displayPages[activePageIndex - 1];
      goToQuestion(prevPage.startIndex);
    }
  };

  const { modalConfig, openConfirmModal, closeModal } = useConfirmModal();

  const handleSubmit = useCallback(() => {
    if (!state.session) return;

    const unanswered = state.session.totalQuestions - state.answers.size;

    if (unanswered > 0) {
      openConfirmModal(
        "Xác nhận nộp bài",
        `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
        () => submitPractice(),
        "Nộp bài",
        "Tiếp tục làm"
      );
    } else {
      openConfirmModal(
        "Xác nhận nộp bài",
        "Bạn đã hoàn thành tất cả câu hỏi. Xác nhận nộp bài?",
        () => submitPractice(),
        "Nộp bài",
        "Xem lại"
      );
    }
  }, [submitPractice, state.session, state.answers.size]);

  const handleTimeOut = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    openConfirmModal(
      "Hết giờ!",
      "Thời gian luyện tập đã hết. Bài thi sẽ được tự động nộp.",
      () => submitPractice(),
      "OK",
      ""
    );
  }, [submitPractice]);

  // ─────────────────────────────────────────────
  // LOAD SESSION — chỉ gọi API 1 lần khi mount
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) {
      message.error("Session ID không hợp lệ");
      navigate("/practice");
      return;
    }

    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await PracticeService.resumePractice(sessionId);

        // Restore answers + marked từ session đã làm dở
        const restoredAnswers = new Map<string, string>();
        const restoredMarked = new Set<string>();

        session.parts.forEach((part) => {
          part.questions.forEach((q) => {
            if (q.selectedAnswerId) {
              restoredAnswers.set(q.questionId, q.selectedAnswerId);
            }
            if (q.isMarkedForReview) {
              restoredMarked.add(q.questionId);
            }
          });
        });

        setState((prev) => ({
          ...prev,
          session,
          answers: restoredAnswers,
          markedForReview: restoredMarked,
          startTime: new Date(),
        }));

        if (session.duration > 0) {
          setTimeRemaining(session.duration * 60);
        }
      } catch (error: any) {
        console.error("Load session error:", error);
        toast.error("Không thể tải session practice");
        navigate("/practice");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, navigate]);

  // ─────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeout(() => handleTimeOut(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTimeOut]);

  // ─────────────────────────────────────────────
  // CURRENT QUESTION
  // ─────────────────────────────────────────────

  const currentQuestion = (() => {
    if (!state.session) return null;
    let count = 0;
    for (const part of state.session.parts) {
      if (state.currentQuestionIndex < count + part.questions.length) {
        return part.questions[state.currentQuestionIndex - count];
      }
      count += part.questions.length;
    }
    return null;
  })();

  const currentPart = (() => {
    if (!state.session) return null;
    let count = 0;
    for (const part of state.session.parts) {
      if (state.currentQuestionIndex < count + part.questions.length) {
        return part;
      }
      count += part.questions.length;
    }
    return null;
  })();
  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────

  const goToQuestion = (index: number) => {
    if (!state.session) return;
    if (index < 0 || index >= state.session.totalQuestions) return;
    setState((prev) => ({ ...prev, currentQuestionIndex: index }));
  };

  // ─────────────────────────────────────────────
  // ANSWER — chỉ cập nhật local state, KHÔNG gọi API
  // ─────────────────────────────────────────────

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setState((prev) => {
      const newAnswers = new Map(prev.answers);
      newAnswers.set(questionId, answerId);
      return { ...prev, answers: newAnswers };
    });
  };

  // ─────────────────────────────────────────────
  // MARK FOR REVIEW — chỉ local state
  // ─────────────────────────────────────────────

  const handleMarkForReview = (questionId: string) => {
    setState((prev) => {
      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return { ...prev, markedForReview: newMarked };
    });
  };

  // ─────────────────────────────────────────────
  // ABANDON
  // ─────────────────────────────────────────────
  const handleAbandon = () => {
    openConfirmModal(
      "Thoát khỏi bài luyện tập?",
      "Tiến trình của bạn sẽ được lưu lại. Bạn có thể tiếp tục sau.",
      async () => {
        try {
          await PracticeService.abandonPractice(sessionId!);
          navigate("/practice/list");
        } catch {
          navigate("/practice/list");
        }
      },
      "Thoát",
      "Ở lại"
    );
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="practice-session loading">
        <div className="loading-spinner">
          <div className="spinner" />
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
            showInfo={false}
            strokeColor="#52c41a"
            trailColor="#e8e8e8"
          />
          <span className="progress-text">
            {answeredCount}/{state.session.totalQuestions}
          </span>
        </div>

        <div className="header-right">
          {timeRemaining !== null && (
            <div className={`timer ${timeRemaining < 300 ? "warning" : ""}`}>
              <ClockCircleOutlined />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="practice-content">

        <div className="question-area">
          {activePage && (
            <QuestionDisplay
              questions={activePage.questions} // Đẩy nguyên 1 mảng các câu hỏi vào đây
              partNumber={activePage.part.partNumber}
              answersMap={state.answers}
              markedSet={state.markedForReview}
              onSelectAnswer={handleSelectAnswer}
              onMarkForReview={handleMarkForReview}
            />
          )}

          {/* Navigation Buttons */}
          <div className="question-navigation">
            <button
              className="nav-btn prev"
              onClick={() => goToQuestion(state.currentQuestionIndex - 1)}
              disabled={state.currentQuestionIndex === 0}
            >
              <LeftOutlined /> Câu trước
            </button>

            <button
              className={`nav-btn mark ${state.markedForReview.has(currentQuestion.questionId)
                ? "active"
                : ""
                }`}
              onClick={() =>
                handleMarkForReview(currentQuestion.questionId)
              }
            >
              <FlagOutlined />
              {state.markedForReview.has(currentQuestion.questionId)
                ? "Bỏ đánh dấu"
                : "Đánh dấu xem lại"}
            </button>

            <button
              className="nav-btn next"
              onClick={() => goToQuestion(state.currentQuestionIndex + 1)}
              disabled={
                state.currentQuestionIndex ===
                state.session.totalQuestions - 1
              }
            >
              Câu sau <RightOutlined />
            </button>
          </div>
        </div>
      </div>

      {/* footer question */}
      <QuestionNavigator
        session={state.session}
        currentIndex={state.currentQuestionIndex}
        answers={state.answers}
        markedForReview={state.markedForReview}
        onNavigate={goToQuestion}
      />

      {/* Modal xác nhận thoát */}
      <ConfirmModal
        open={modalConfig.open}
        title={modalConfig.title}
        content={modalConfig.content}
        okText={modalConfig.okText}
        cancelText={modalConfig.cancelText}
        onOk={modalConfig.onOk}
        onCancel={closeModal}
      />
    </div>
  );
};

export default PracticeSession;