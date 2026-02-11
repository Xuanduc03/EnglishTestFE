import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Modal,
  Tag,
  Typography,
  Space,
  Divider,
  Image,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type {
  QuestionGroupDetailDto,
  SingleQuestionDetailDto,
  AnswerDto,
  GroupQuestionItemDto,
} from "../components/Quesion.config";
import "./QuestionDetailModal.scss";

const { Text } = Typography;

type Props = {
  question: SingleQuestionDetailDto | QuestionGroupDetailDto | null;
  open: boolean;
  onClose: () => void;
  highlightQuestionId?: string | undefined;
};

const QuestionDetailModal: React.FC<Props> = ({
  question,
  open,
  onClose,
  highlightQuestionId,
}) => {

  const isGroup = useMemo(
    () => !!question && (question as QuestionGroupDetailDto).questions !== undefined,
    [question]
  );

  // refs for subquestions to scroll / highlight
  const subQuestionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // selection states
  const [singleSelectedId, setSingleSelectedId] = useState<string | null>(null);
  const [groupSelections, setGroupSelections] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!open) {
      // clear internal state when modal closed
      setSingleSelectedId(null);
      setGroupSelections({});
      subQuestionRefs.current = {};
    }
  }, [open]);

  // When question loaded and highlightQuestionId provided, scroll & highlight
  useEffect(() => {
    if (!open) return;
    if (isGroup && highlightQuestionId) {
      setTimeout(() => {
        const el = subQuestionRefs.current[highlightQuestionId];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight-target");
          setTimeout(() => el.classList.remove("highlight-target"), 1200);
        }
      }, 150);
    }
  }, [open, isGroup, highlightQuestionId, question]);

  // helper to find media
  const findMediaUrl = (media: any[] | undefined, type: "audio" | "image") =>
    media?.find((m) => m.mediaType === type)?.url ?? null;

  // handlers
  const handleSelectSingle = (answerId: string) => setSingleSelectedId(answerId);
  const handleSelectGroup = (qId: string, answerId: string) =>
    setGroupSelections((s) => ({ ...s, [qId]: answerId }));

  const renderAnswers = (
    answers: AnswerDto[] = [],
    selectedId: string | null,
    onSelect: (id: string) => void
  ) => {
    return (
      <div className="answers-list">
        {answers.map((ans, idx) => {
          const isSelected = selectedId === ans.id;
          const isCorrect = !!ans.isCorrect;
          const showWrongSelected = isSelected && !isCorrect;
          const showCorrectHighlight = isCorrect;

          const classes = [
            "answer-item",
            isSelected ? "selected" : "",
            showCorrectHighlight ? "correct" : "",
            showWrongSelected ? "wrong" : "",
          ].join(" ");

          return (
            <div
              key={ans.id ?? idx}
              className={classes}
              onClick={() => onSelect(ans.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(ans.id);
              }}
            >
              <div className="answer-index">{String.fromCharCode(65 + idx)}</div>
              <div className="answer-content" dangerouslySetInnerHTML={{ __html: ans.content || "" }} />
              <div className="answer-badge">
                {isSelected && isCorrect && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Đúng</Tag>
                )}
                {isSelected && !isCorrect && (
                  <Tag color="error" icon={<CloseCircleOutlined />}>Sai</Tag>
                )}
                {!isSelected && isCorrect && (
                  <Tag color="success" style={{ opacity: 0.85 }}>Đáp án đúng</Tag>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Difficulty label helper
  const difficultyLabel = (q: any) => {
    if (!q) return "N/A";
    if (q.difficultyName) return q.difficultyName;
    const level = q.difficultyLevel ?? q.difficultyLevel;
    switch (level) {
      case 1: return "Nhận biết";
      case 2: return "Thông hiểu";
      case 3: return "Vận dụng";
      default: return "N/A";
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Tag color="blue">{(question as any)?.categoryName || "Chi tiết câu hỏi"}</Tag>
          <Text strong>ID: {(question as any)?.id ? (question as any).id.slice(0, 8) + "..." : "-"}</Text>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      className="question-detail-modal"
      destroyOnClose
    >
      <div className="question-detail-body">
        {/* If no question yet -> show loading spinner */}
        {!question ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>Đang tải chi tiết câu hỏi...</div>
          </div>
        ) : (
          <>
            <Card size="small" className="meta-card">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Text type="secondary">Độ khó:</Text>
                  <div style={{ marginTop: 8 }}><Tag color="gold">{difficultyLabel(question)}</Tag></div>
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary">Loại câu hỏi:</Text>
                  <div style={{ marginTop: 8 }}><Tag>{(question as any).questionType || "N/A"}</Tag></div>
                </Col>
                <Col xs={24} sm={8}>
                  <Text type="secondary">Trạng thái:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Badge status={(question as any).isActive ? "success" : "error"} text={(question as any).isActive ? "Hoạt động" : "Ẩn"} />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* MEDIA */}
            {(
              (!!findMediaUrl((question as SingleQuestionDetailDto).media, "image")) ||
              (!!findMediaUrl((question as SingleQuestionDetailDto).media, "audio")) ||
              (!!findMediaUrl((question as QuestionGroupDetailDto).media, "image")) ||
              (!!findMediaUrl((question as QuestionGroupDetailDto).media, "audio"))
            ) && (
              <div className="media-area">
                {isGroup ? (
                  <>
                    {findMediaUrl((question as QuestionGroupDetailDto).media, "image") && (
                      <div className="media-image">
                        <Image src={findMediaUrl((question as QuestionGroupDetailDto).media, "image")!} alt="group-image" height={220} />
                      </div>
                    )}
                    {findMediaUrl((question as QuestionGroupDetailDto).media, "audio") && (
                      <div className="media-audio">
                        <SoundOutlined className="icon-audio" />
                        <audio controls><source src={findMediaUrl((question as QuestionGroupDetailDto).media, "audio")!} /></audio>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {findMediaUrl((question as SingleQuestionDetailDto).media, "image") && (
                      <div className="media-image">
                        <Image src={findMediaUrl((question as SingleQuestionDetailDto).media, "image")!} alt="question-image" height={220} />
                      </div>
                    )}
                    {findMediaUrl((question as SingleQuestionDetailDto).media, "audio") && (
                      <div className="media-audio"><SoundOutlined className="icon-audio" /><audio controls><source src={findMediaUrl((question as SingleQuestionDetailDto).media, "audio")!} /></audio></div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* CONTENT + ANSWERS */}
            {isGroup ? (
              <div className="group-area">
                <Divider orientation="left"><FileTextOutlined /> Passage</Divider>
                <div className="group-passage" dangerouslySetInnerHTML={{ __html: (question as QuestionGroupDetailDto).content || '<i style="color:#999">Không có passage</i>' }} />

                <Divider orientation="left">Câu hỏi trong nhóm</Divider>
                {(question as QuestionGroupDetailDto).questions?.map((q: GroupQuestionItemDto, qIdx: number) => {
                  const selectedId = groupSelections[q.id] ?? null;
                  return (
                    <Card key={q.id || qIdx} className={["subquestion-card", highlightQuestionId === q.id ? "highlight" : ""].join(" ")}>
                      <div ref={(el) => { if (q.id) subQuestionRefs.current[q.id] = el; }} className="subquestion-header">
                        <div style={{ flex: 1 }}>
                          <Text strong>Câu {qIdx + 1}. <span dangerouslySetInnerHTML={{ __html: q.content || "" }} /></Text>
                        </div>
                        <div style={{ marginLeft: 8 }}><Tag>{q.questionType}</Tag></div>
                      </div>

                      {q.media?.length > 0 && (
                        <div className="sub-media" style={{ marginTop: 12 }}>
                          {findMediaUrl(q.media, "image") && <Image src={findMediaUrl(q.media, "image")!} height={140} />}
                          {findMediaUrl(q.media, "audio") && <div className="media-audio small"><SoundOutlined className="icon-audio" /><audio controls><source src={findMediaUrl(q.media, "audio")!} /></audio></div>}
                        </div>
                      )}

                      <div style={{ marginTop: 12 }}>
                        {renderAnswers(q.answers || [], selectedId, (aid) => handleSelectGroup(q.id, aid))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="single-area">
                <Divider orientation="left"><FileTextOutlined /> Nội dung câu hỏi</Divider>
                <div className="single-content" dangerouslySetInnerHTML={{ __html: (question as SingleQuestionDetailDto).content || '<i style="color:#999">Câu hỏi này không có nội dung văn bản (chỉ nghe/nhìn)</i>' }} />

                <Divider orientation="left">Đáp án</Divider>
                <div style={{ marginBottom: 12 }}>
                  {renderAnswers((question as SingleQuestionDetailDto).answers || [], singleSelectedId, handleSelectSingle)}
                </div>

                {(question as SingleQuestionDetailDto).explanation && (
                  <>
                    <Divider orientation="left">Giải thích</Divider>
                    <Card className="explain-card"><div dangerouslySetInnerHTML={{ __html: (question as SingleQuestionDetailDto).explanation || "" }} /></Card>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ textAlign: "right", marginTop: 12 }}>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </Modal>
  );
};

export default QuestionDetailModal;