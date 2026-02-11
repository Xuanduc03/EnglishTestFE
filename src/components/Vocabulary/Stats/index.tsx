import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import "./Stats.scss";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const Stat: React.FC = () => {
  // dữ liệu giả lập
  const weeklyData = [15, 20, 18, 25, 30, 28, 35]; // số từ học mỗi ngày
  const testScores = [550, 600, 650, 700, 720, 760, 800]; // điểm TOEIC theo lần thi

  const barData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Từ đã học",
        data: weeklyData,
        backgroundColor: "#2563eb",
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: ["Lần 1", "Lần 2", "Lần 3", "Lần 4", "Lần 5", "Lần 6", "Lần 7"],
    datasets: [
      {
        label: "Điểm số",
        data: testScores,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#16a34a",
      },
    ],
  };

  return (
    <div className="stat-container">
      <h2 className="stat-title">Thống kê học tập</h2>

      <div className="stat-charts">
        <div className="stat-card">
          <h3 className="stat-card-title">Số từ học theo tuần</h3>
          <Bar data={barData} />
        </div>

        <div className="stat-card">
          <h3 className="stat-card-title">Tiến bộ điểm số</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Stat;
