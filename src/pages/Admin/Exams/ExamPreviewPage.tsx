import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin, Tag, Badge, Typography, Button,
  Card, Alert, Space, Divider, Tooltip, Switch, Tabs, BackTop
} from "antd";
import {
  ArrowLeftOutlined, SoundOutlined, PictureOutlined,
  CheckCircleFilled, CloseCircleFilled, EyeOutlined,
  EyeInvisibleOutlined, ClockCircleOutlined, FileTextOutlined,
  OrderedListOutlined
} from "@ant-design/icons";
import { ExamService } from "./exams.service";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ── Types ─────────────────────────────────────────────────────────
interface PreviewAnswerOption {
  id: string;
  content: string;
  orderIndex: number;
  isCorrect: boolean;
}

interface PreviewQuestionDto {
  examQuestionId: string;
  questionId: string;
  orderIndex: number;
  point: number;
  content: string;
  questionType: string;
  audioUrl?: string;
  imageUrl?: string;
  explanation?: string;
  groupId?: string;
  groupContent?: string;
  groupAudioUrl?: string;
  groupImageUrl?: string;
  answers: PreviewAnswerOption[];
}

interface PreviewSectionDto {
  sectionId: string;
  sectionName: string;
  skillType: string;
  orderIndex: number;
  instructions?: string;
  questions: PreviewQuestionDto[];
}

interface ExamPreviewDto {
  examId: string;
  examTitle: string;
  examCode: string;
  status: string;
  timeLimitSeconds: number;
  totalQuestions: number;
  isPreview: boolean;
  showCorrectAnswers: boolean;
  sections: PreviewSectionDto[];
}

// ── Helpers ───────────────────────────────────────────────────────
const ANSWER_LABELS = ["A", "B", "C", "D", "E"];

const statusConfig: Record<string, { color: string; text: string }> = {
  Draft: { color: "default", text: "Bản nháp" },
  PendingReview: { color: "processing", text: "Chờ duyệt" },
  Published: { color: "success", text: "Đã xuất bản" },
  Suspended: { color: "warning", text: "Tạm ngưng" },
  Archived: { color: "error", text: "Lưu trữ" },
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// ── AnswerItem ─────────────────────────────────────────────────────
const AnswerItem: React.FC<{
  answer: PreviewAnswerOption;
  index: number;
  showCorrect: boolean;
}> = ({ answer, index, showCorrect }) => {
  const label = ANSWER_LABELS[index] ?? String(index + 1);
  const isCorrect = showCorrect && answer.isCorrect;
  const isWrong = showCorrect && !answer.isCorrect;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "8px 12px", borderRadius: 8, marginBottom: 6,
      background: isCorrect ? "#f6ffed" : "#fafafa",
      border: `1px solid ${isCorrect ? "#b7eb8f" : "#e8e8e8"}`,
    }}>
      <div style={{
        minWidth: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, fontSize: 13,
        background: isCorrect ? "#52c41a" : "#e0e0e0",
        color: isCorrect ? "#fff" : "#555",
      }}>
        {label}
      </div>
      <div
        style={{ flex: 1, lineHeight: "26px", color: isWrong ? "#aaa" : undefined }}
        dangerouslySetInnerHTML={{ __html: answer.content || "<em style='color:#bbb'>Trống</em>" }}
      />
      {showCorrect && (
        answer.isCorrect
          ? <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16, marginTop: 5 }} />
          : <CloseCircleFilled style={{ color: "#f0f0f0", fontSize: 16, marginTop: 5 }} />
      )}
    </div>
  );
};

// ── QuestionCard ───────────────────────────────────────────────────
const QuestionCard: React.FC<{
  question: PreviewQuestionDto;
  globalIndex: number;
  showCorrect: boolean;
}> = ({ question, globalIndex, showCorrect }) => (
  <Card
    size="small"
    style={{ marginBottom: 10, borderRadius: 8, border: "1px solid #e8e8e8" }}
    bodyStyle={{ padding: "12px 16px" }}
  >
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <Space size={6}>
        <Tag color="blue" style={{ fontWeight: 600, minWidth: 44, textAlign: "center" }}>
          Câu {globalIndex}
        </Tag>
        {question.audioUrl && (
          <Tooltip title="Có file âm thanh">
            <Tag icon={<SoundOutlined />} color="purple">Audio</Tag>
          </Tooltip>
        )}
        {question.imageUrl && (
          <Tooltip title="Có hình ảnh">
            <Tag icon={<PictureOutlined />} color="cyan">Image</Tag>
          </Tooltip>
        )}
      </Space>
      <Text type="secondary" style={{ fontSize: 12 }}>{question.point} điểm</Text>
    </div>

    {/* Question media */}
    {question.audioUrl && (
      <audio controls src={question.audioUrl}
        style={{ width: "100%", height: 36, marginBottom: 8 }} />
    )}
    {question.imageUrl && (
      <img src={question.imageUrl} alt="q"
        style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6, objectFit: "contain", marginBottom: 8 }} />
    )}

    {/* Content */}
    {question.content && (
      <div
        style={{ marginBottom: 10, fontWeight: 500 }}
        dangerouslySetInnerHTML={{ __html: question.content }}
      />
    )}

    {/* Answers */}
    {question.answers.map((a, i) => (
      <AnswerItem key={a.id} answer={a} index={i} showCorrect={showCorrect} />
    ))}

    {/* Explanation */}
    {showCorrect && question.explanation && (
      <>
        <Divider style={{ margin: "10px 0" }} />
        <div style={{
          background: "#fffbe6", border: "1px solid #ffe58f",
          borderRadius: 6, padding: "8px 12px",
        }}>
          <Text type="warning" strong style={{ fontSize: 12 }}>Giải thích: </Text>
          <Text style={{ fontSize: 12 }}>{question.explanation}</Text>
        </div>
      </>
    )}
  </Card>
);

// ── GroupBlock ─────────────────────────────────────────────────────
const GroupBlock: React.FC<{
  groupContent: string;
  groupAudioUrl?: string;
  groupImageUrl?: string;
  questions: PreviewQuestionDto[];
  startIndex: number;
  showCorrect: boolean;
}> = ({ groupContent, groupAudioUrl, groupImageUrl, questions, startIndex, showCorrect }) => (
  <div style={{
    marginBottom: 20,
    border: "1.5px solid #d3adf7",
    borderRadius: 10,
    overflow: "hidden",
  }}>
    {/* Group header */}
    <div style={{ background: "#f9f0ff", padding: "12px 16px", borderBottom: "1px solid #d3adf7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Tag color="purple">Nhóm câu hỏi</Tag>
        <Tag>{questions.length} câu</Tag>
        {groupAudioUrl && <Tag icon={<SoundOutlined />} color="blue">Audio</Tag>}
        {groupImageUrl && <Tag icon={<PictureOutlined />} color="cyan">Ảnh</Tag>}
      </div>

      {groupAudioUrl && (
        <audio controls src={groupAudioUrl}
          style={{ width: "100%", height: 36, marginBottom: 8 }} />
      )}

      {groupImageUrl && (
        <img src={groupImageUrl} alt="group"
          style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 6, objectFit: "contain", marginBottom: 8 }} />
      )}

      {groupContent && stripHtml(groupContent).trim() && (
        <div style={{
          background: "#fff", border: "1px solid #e9d5ff",
          borderRadius: 6, padding: "10px 14px",
          fontSize: 14, lineHeight: 1.8, color: "#333",
        }}
          dangerouslySetInnerHTML={{ __html: groupContent }}
        />
      )}
    </div>

    {/* Questions */}
    <div style={{ padding: "12px 16px", background: "#fff" }}>
      {questions.map((q, qi) => (
        <QuestionCard
          key={q.examQuestionId}
          question={q}
          globalIndex={startIndex + qi}
          showCorrect={showCorrect}
        />
      ))}
    </div>
  </div>
);

// ── SectionContent ─────────────────────────────────────────────────
const SectionContent: React.FC<{
  questions: PreviewQuestionDto[];
  sectionStart: number;
  showCorrect: boolean;
}> = ({ questions, sectionStart, showCorrect }) => {
  // Build ordered render items
  type RenderItem =
    | { type: "group"; groupId: string; questions: PreviewQuestionDto[] }
    | { type: "single"; question: PreviewQuestionDto };

  const items: RenderItem[] = [];
  const seenGroups = new Set<string>();

  questions.forEach(q => {
    if (q.groupId) {
      if (!seenGroups.has(q.groupId)) {
        seenGroups.add(q.groupId);
        items.push({
          type: "group",
          groupId: q.groupId,
          questions: questions.filter(x => x.groupId === q.groupId),
        });
      }
    } else {
      items.push({ type: "single", question: q });
    }
  });

  let idx = sectionStart;

  return (
    <>
      {items.map((item, i) => {
        if (item.type === "group") {
          const start = idx;
          idx += item.questions.length;
          const first = item.questions[0];
          return (
            <GroupBlock
              key={item.groupId}
              groupContent={first.groupContent ?? ""}
              groupAudioUrl={first.groupAudioUrl}
              groupImageUrl={first.groupImageUrl}
              questions={item.questions}
              startIndex={start}
              showCorrect={showCorrect}
            />
          );
        } else {
          const current = idx++;
          return (
            <QuestionCard
              key={item.question.examQuestionId}
              question={item.question}
              globalIndex={current}
              showCorrect={showCorrect}
            />
          );
        }
      })}
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const ExamPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ExamPreviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ExamService.getPreview(id, true)
      .then((res: any) => { setData(res); setShowAnswers(res.showCorrectAnswers ?? true); })
      .catch((err) => setError(err?.response?.data?.message || "Không thể tải preview đề thi"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <Spin size="large" tip="Đang tải đề thi..." />
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: 24 }}>
      <Alert type="error" message="Không thể tải preview" description={error}
        action={<Button onClick={() => navigate(-1)}>Quay lại</Button>} />
    </div>
  );

  const statusCfg = statusConfig[data.status] ?? statusConfig["Draft"];
  const durationMin = Math.round(data.timeLimitSeconds / 60);
  let globalCounter = 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
        <Title level={4} style={{ margin: 0, flex: 1 }}>Preview đề thi</Title>
        <Space>
          {showAnswers
            ? <EyeOutlined style={{ color: "#52c41a" }} />
            : <EyeInvisibleOutlined style={{ color: "#aaa" }} />}
          <Text style={{ fontSize: 13 }}>Hiện đáp án đúng</Text>
          <Switch checked={showAnswers} onChange={setShowAnswers} size="small" />
        </Space>
      </div>

      {/* Exam info */}
      <Card style={{ marginBottom: 20, borderRadius: 12, border: "1px solid #e8e8e8" }}
        bodyStyle={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <Space size={8} style={{ marginBottom: 6 }}>
              <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 13 }}>{data.examCode}</Tag>
              <Badge status={statusCfg.color as any} text={statusCfg.text} />
            </Space>
            <Title level={3} style={{ margin: 0 }}>{data.examTitle}</Title>
          </div>
          <Space size={16} wrap>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", fontSize: 11, marginBottom: 2 }}><ClockCircleOutlined /> Thời gian</div>
              <Text strong>{durationMin} phút</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", fontSize: 11, marginBottom: 2 }}><OrderedListOutlined /> Số câu</div>
              <Text strong>{data.totalQuestions}</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", fontSize: 11, marginBottom: 2 }}><FileTextOutlined /> Sections</div>
              <Text strong>{data.sections.length}</Text>
            </div>
          </Space>
        </div>
      </Card>

      {/* Sections */}
      {data.sections.length === 0 ? (
        <Alert type="warning" message="Đề thi chưa có câu hỏi nào"
          description="Vui lòng thêm câu hỏi vào các section trước khi preview." />
      ) : (
        <Tabs defaultActiveKey={data.sections[0]?.sectionId} type="card">
          {data.sections.map(section => {
            const sectionStart = globalCounter + 1;
            globalCounter += section.questions.length;

            return (
              <TabPane
                key={section.sectionId}
                tab={
                  <Space size={6}>
                    <Text strong>{section.sectionName}</Text>
                    <Tag color="blue">{section.questions.length}</Tag>
                  </Space>
                }
              >
                {section.instructions && (
                  <Alert type="info" message={section.instructions}
                    style={{ marginBottom: 14, borderRadius: 8 }} />
                )}

                {section.questions.length === 0 ? (
                  <Text type="secondary">Section này chưa có câu hỏi.</Text>
                ) : (
                  <SectionContent
                    questions={section.questions}
                    sectionStart={sectionStart}
                    showCorrect={showAnswers}
                  />
                )}
              </TabPane>
            );
          })}
        </Tabs>
      )}
      <BackTop>
        <div
          style={{
            height: 40,
            width: 40,
            lineHeight: "40px",
            borderRadius: 8,
            backgroundColor: "#1677ff",
            color: "#fff",
            textAlign: "center",
            fontSize: 18,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          ↑
        </div>
      </BackTop>
    </div>
  );
};

export default ExamPreviewPage;