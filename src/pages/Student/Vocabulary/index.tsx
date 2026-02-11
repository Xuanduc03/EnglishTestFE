import React from "react";
import "./Vocabulary.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Progress, Tabs } from "antd";

const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "flash-card", label: "Flashcards" },
    { key: "quiz", label: "Quiz" },
    { key: "practice", label: "Luyện tập" },
    { key: "suggestion", label: "Gợi ý từ vựng" },
    { key: "stats", label: "Thống kê" },
  ]
  return (
    <div className="vocab-layout">
      {/* Tabs */}
      <Tabs
        activeKey={
          items.find((i) => location.pathname.endsWith(i.key))?.key || "flash-card"
        }
        items={items}
       onChange={(key) => navigate(`/vocabulary/${key}`)}
        centered
        className="vocab-tabs"
      />

      {/* Nội dung động */}
      <div className="vocab-content">
        <Outlet />
      </div>
    </div>
  );
};

export default VocabularyPage;
