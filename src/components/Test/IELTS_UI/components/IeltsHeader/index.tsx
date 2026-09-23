import React from 'react';

interface Props {
    candidateName?: string;
    candidateNumber?: string;
    testTitle: string;
    timeLeftSeconds: number;
}

const IeltsHeader: React.FC<Props> = ({ testTitle, timeLeftSeconds }) => {
    const minutes = Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeLeftSeconds % 60).toString().padStart(2, '0');
    
    const isWarning = timeLeftSeconds <= 600; // Dưới 10 phút đổi viền vàng
    const isDanger = timeLeftSeconds <= 60;   // Dưới 1 phút đổi đỏ chớp nháy

    return (
        <header className="ielts-header">
            <div className="ielts-header__left">
                <div className="ielts-header__logo">IDP IELTS</div>
                <div className="ielts-header__test-title">{testTitle}</div>
            </div>

            <div className="ielts-header__right">
                <div className={`ielts-header__timer ${isDanger ? 'ielts-header__timer--danger' : isWarning ? 'ielts-header__timer--warning' : ''}`}>
                    ⏱ {minutes}:{seconds}
                </div>
                <button className="ielts-header__btn ielts-header__btn--exit">Hide time</button>
                <button className="ielts-header__btn ielts-header__btn--submit">Help</button>
            </div>
        </header>
    );
};

export default IeltsHeader;