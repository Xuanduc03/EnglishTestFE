import { Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import "./FlashCard.scss";
import type { FlashcardDto } from "../../../pages/Student/Vocabulary/vocabulary.types";
import { VocabularyService } from "../../../pages/Student/Vocabulary/vocabulary.services";

const FlashCards: React.FC = () => {
    const [cards, setCards]           = useState<FlashcardDto[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isFlipped, setIsFlipped]   = useState(false);
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [emptyMsg, setEmptyMsg]     = useState("");
    const [sessionResults, setSessionResults] = useState<
        { word: string; remembered: boolean }[]
    >([]);
    const [isDone, setIsDone] = useState(false);

    const loadCards = useCallback(async () => {
        setLoading(true);
        setIsDone(false);
        setSessionResults([]);
        setCurrentIdx(0);
        setIsFlipped(false);
        try {
            const res = await VocabularyService.getToday(20);
            if (res.isEmpty) {
                setEmptyMsg(res.message);
                setIsDone(true);
            } else {
                setCards(res.cards);
            }
        } catch {
            setEmptyMsg("Không thể tải dữ liệu. Vui lòng thử lại.");
            setIsDone(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCards(); }, [loadCards]);

    const current            = cards[currentIdx];
    const progressPercentage = cards.length > 0
        ? Math.round((currentIdx / cards.length) * 100)
        : 0;

    const handleFlip = () => setIsFlipped(prev => !prev);

    const handleReview = async (remembered: boolean) => {
        if (!current || submitting) return;
        setSubmitting(true);
        try {
            await VocabularyService.review({ wordId: current.wordId, remembered });
            setSessionResults(prev => [...prev, { word: current.word, remembered }]);

            const next = currentIdx + 1;
            if (next >= cards.length) {
                setIsDone(true);
            } else {
                setCurrentIdx(next);
                setIsFlipped(false);
            }
        } catch {
            // silent
        } finally {
            setSubmitting(false);
        }
    };

    const handleKnow     = () => handleReview(true);
    const handleLearning = () => handleReview(false);

    const handleNextCard = () => {
        if (currentIdx < cards.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevCard = () => {
        if (currentIdx > 0) {
            setCurrentIdx(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const playAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (current?.audioUrl) {
            new Audio(current.audioUrl).play().catch(() => {});
        }
    };

    // ── Loading ────────────────────────────────────────────
    if (loading) {
        return (
            <section id="flashcard-section" className="flashcard-section fade-in">
                <div className="flashcard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                    <Spin size="large" tip="Đang tải thẻ học..." />
                </div>
            </section>
        );
    }

    // ── Done ───────────────────────────────────────────────
    if (isDone) {
        const remembered = sessionResults.filter(r => r.remembered).length;
        const forgotten  = sessionResults.filter(r => !r.remembered).length;

        return (
            <section id="flashcard-section" className="flashcard-section fade-in">
                <div className="flashcard-container">
                    <div className="flashcard-done">
                        <div className="done-icon">🎉</div>
                        <h3>{emptyMsg || "Hoàn thành phiên học!"}</h3>

                        {sessionResults.length > 0 && (
                            <div className="done-stats">
                                <div className="done-stat">
                                    <span className="done-num green">{remembered}</span>
                                    <span>Đã nhớ</span>
                                </div>
                                <div className="done-stat">
                                    <span className="done-num red">{forgotten}</span>
                                    <span>Chưa nhớ</span>
                                </div>
                                <div className="done-stat">
                                    <span className="done-num blue">
                                        {sessionResults.length > 0
                                            ? Math.round(remembered / sessionResults.length * 100)
                                            : 0}%
                                    </span>
                                    <span>Chính xác</span>
                                </div>
                            </div>
                        )}

                        <div className="done-actions">
                            <button className="action-btn know-btn" onClick={loadCards}>
                                🔄 Học lại
                            </button>
                            {forgotten > 0 && (
                                <button
                                    className="action-btn learning-btn"
                                    onClick={() => {
                                        const failIdx = sessionResults
                                            .map((r, i) => (!r.remembered ? i : -1))
                                            .filter(i => i >= 0);
                                        const failedCards = failIdx.map(i => cards[i]).filter(Boolean);
                                        if (failedCards.length > 0) {
                                            setCards(failedCards);
                                            setCurrentIdx(0);
                                            setIsFlipped(false);
                                            setSessionResults([]);
                                            setIsDone(false);
                                        }
                                    }}
                                >
                                    📚 Ôn lại từ chưa nhớ ({forgotten})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ── Flashcard ──────────────────────────────────────────
    return (
        <section id="flashcard-section" className="flashcard-section fade-in">
            <div className="flashcard-container">
                <div className="header-controls">
                    <div className="controls-wrapper">
                        <span className="level-badge">
                            {current?.status === "new" ? "Từ mới" :
                             current?.status === "learning" ? "Đang học" :
                             current?.status === "known" ? "Đã biết" : "Thành thạo"}
                        </span>
                        <span className="level-badge" style={{ background: "#f0f0f0", color: "#555" }}>
                            Đã ôn: {current?.timesReviewed ?? 0} lần
                        </span>
                    </div>
                </div>

                {/* Main Flashcard */}
                <div className="flashcard-main">
                    <div
                        className={`flashcard ${isFlipped ? "flipped" : ""}`}
                        onClick={handleFlip}
                    >
                        <div className="flashcard-inner">
                            {/* Front: Word */}
                            <div className="flashcard-front">
                                <div className="flashcard-content">
                                    <h3 className="word-text">{current?.word}</h3>
                                    <p className="phonetic-text">{current?.phonetic}</p>
                                    <p className="pos-text">{current?.partOfSpeech}</p>
                                    {current?.audioUrl && (
                                        <button className="audio-btn" onClick={playAudio}>
                                            🔊 Nghe phát âm
                                        </button>
                                    )}
                                    {current?.imageUrl && (
                                        <img
                                            src={current.imageUrl}
                                            alt={current.word}
                                            className="card-image"
                                            onClick={e => e.stopPropagation()}
                                        />
                                    )}
                                    <p className="instruction">Click để xem nghĩa</p>
                                </div>
                            </div>

                            {/* Back: Meaning & Example */}
                            <div className="flashcard-back">
                                <div className="flashcard-content">
                                    <h3 className="word-text word-text-sm">{current?.word}</h3>
                                    <h4 className="meaning-title">Nghĩa:</h4>
                                    <p className="meaning-text">{current?.meaning}</p>
                                    {current?.example && (
                                        <div className="example-section">
                                            <h5 className="example-title">Ví dụ:</h5>
                                            <p className="example-text">"{current.example}"</p>
                                            {current.exampleMeaning && (
                                                <p className="example-vi">{current.exampleMeaning}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        onClick={handlePrevCard}
                        className="action-btn prev-btn"
                        disabled={currentIdx === 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <button
                        onClick={handleKnow}
                        className="action-btn know-btn"
                        disabled={submitting || !isFlipped}
                    >
                        <span>✅</span>
                        <span className="btn-text">Nhớ rồi</span>
                    </button>

                    <button
                        onClick={handleLearning}
                        className="action-btn learning-btn"
                        disabled={submitting || !isFlipped}
                    >
                        <span>📚</span>
                        <span className="btn-text">Chưa nhớ</span>
                    </button>

                    <button
                        onClick={handleNextCard}
                        className="action-btn next-btn"
                        disabled={currentIdx === cards.length - 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                    <div className="progress-info">
                        <span className="progress-text">
                            Từ {currentIdx + 1}/{cards.length}
                        </span>
                        <span className="progress-percent">
                            {progressPercentage}% hoàn thành
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FlashCards;