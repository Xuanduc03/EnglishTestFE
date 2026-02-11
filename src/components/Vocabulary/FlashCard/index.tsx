import { Select } from "antd";
import { useState } from "react";
import "./FlashCard.scss";

const FlashCards: React.FC = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [totalCards, setTotalCards] = useState(50);
    const [category, setCategory] = useState("Business");
    const [isFlipped, setIsFlipped] = useState(false);

    const currentFlashcard = {
        word: "Strategy",
        meaning: "Chiến lược - Kế hoạch dài hạn để đạt được mục tiêu",
        example: "The company needs a new marketing strategy to increase sales."
    };


    const progressPercentage = (currentCard / totalCards) * 100;
    const handleNextCard = () => {
        if (currentCard > 1) {
            setCurrentCard(currentCard - 1);
            setIsFlipped(false);
        }
    };

    const handlePrevCard = () => {
        if (currentCard < totalCards) {
            setCurrentCard(currentCard + 1);
            setIsFlipped(false);
        }
    };

    const handleKnow = () => {
        console.log("Biết từ này");
        handleNextCard();
    };

    const handleLearning = () => {
        console.log("Đang học từ này");
        handleNextCard();
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <section id="flashcard-section" className="flashcard-section fade-in">
            <div className="flashcard-container">
                <div className="header-controls">
                    <div className="controls-wrapper">
                        <span className="level-badge">
                            Level: Beginner
                        </span>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="Business">Business</option>
                            <option value="Travel">Travel</option>
                            <option value="Office">Office</option>
                            <option value="Technology">Technology</option>
                        </select>
                    </div>
                </div>

                {/* Main Flashcard */}
                <div className="flashcard-main">
                    <div
                        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                        onClick={handleFlip}
                    >
                        <div className="flashcard-inner">
                            {/* Front: Word */}
                            <div className="flashcard-front">
                                <div className="flashcard-content">
                                    <h3 className="word-text">{currentFlashcard.word}</h3>
                                    <p className="instruction">Click để xem nghĩa</p>
                                </div>
                            </div>

                            {/* Back: Meaning & Example */}
                            <div className="flashcard-back">
                                <div className="flashcard-content">
                                    <h4 className="meaning-title">Nghĩa:</h4>
                                    <p className="meaning-text">{currentFlashcard.meaning}</p>
                                    <div className="example-section">
                                        <h5 className="example-title">Ví dụ:</h5>
                                        <p className="example-text">"{currentFlashcard.example}"</p>
                                    </div>
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
                        disabled={currentCard === 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <button
                        onClick={handleKnow}
                        className="action-btn know-btn"
                    >
                        <span>✅</span>
                        <span className="btn-text">Biết rồi</span>
                    </button>

                    <button
                        onClick={handleLearning}
                        className="action-btn learning-btn"
                    >
                        <span>📚</span>
                        <span className="btn-text">Đang học</span>
                    </button>

                    <button
                        onClick={handleNextCard}
                        className="action-btn next-btn"
                        disabled={currentCard === totalCards}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                    <div className="progress-info">
                        <span className="progress-text">Từ {currentCard}/{totalCards}</span>
                        <span className="progress-percent">{Math.round(progressPercentage)}% hoàn thành</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}


export default FlashCards;