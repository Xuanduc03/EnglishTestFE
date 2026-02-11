import React, { useMemo, useState } from "react";
import "./PreviewImportModal.scss";
import type { PartData, PreviewZipResponse } from "../../../types/PreviewData.type";
import { transformPreviewData } from "../../../utils/TranformJson";
import { Spin } from "antd";

interface PreviewImportModalProps {
  open: boolean;
  data: PreviewZipResponse;
  onClose: () => void;
  onImport: () => void;
  loading: boolean
}

const PreviewImportModal: React.FC<PreviewImportModalProps> = ({
  data,
  open,
  onClose,
  onImport, loading
}) => {
  const [activePart, setActivePart] = useState<number>(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Transform backend data sang flattened structure
  const partsData: PartData[] = useMemo(() => transformPreviewData(data), [data]);

  // Get active part data
  const activePartData = useMemo(
    () => partsData.find((p) => p.part === activePart),
    [partsData, activePart]
  );

  // Get active question
  const activeQuestion = useMemo(
    () =>
      activePartData?.questions.find((q) => q.id === activeQuestionId) ??
      activePartData?.questions[0],
    [activePartData, activeQuestionId]
  );

  // Calculate stats
  const totalValidQuestions = partsData.reduce(
    (sum, p) => sum + p.questions.filter((q) => !q.hasError).length,
    0
  );

  const totalQuestions = partsData.reduce(
    (sum, p) => sum + p.questions.length,
    0
  );

  const errorCount = partsData.reduce(
    (sum, p) => sum + p.questions.filter((q) => q.hasError).length,
    0
  );

  if (!open) return null;

  return (
    <Spin spinning={loading} tip="Đang import...">
      <div className="preview-import-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-container">
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <h2 className="modal-title">Preview Import Questions</h2>
              <div className="import-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{totalQuestions}</span>
                </div>
                <div className="stat-item stat-valid">
                  <span className="stat-label">Valid:</span>
                  <span className="stat-value">{totalValidQuestions}</span>
                </div>
                <div className="stat-item stat-error">
                  <span className="stat-label">Errors:</span>
                  <span className="stat-value">{errorCount}</span>
                </div>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Missing Media Files Warning */}
          {data.missingMediaFiles && data.missingMediaFiles.length > 0 && (
            <div className="missing-media-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h4>Missing Media Files ({data.missingMediaFiles.length})</h4>
                <div className="missing-files-list">
                  {data.missingMediaFiles.slice(0, 5).map((file, idx) => (
                    <span key={idx} className="missing-file">{file}</span>
                  ))}
                  {data.missingMediaFiles.length > 5 && (
                    <span className="more-files">
                      +{data.missingMediaFiles.length - 5} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Part Tabs */}
          <div className="part-tabs">
            {partsData.map((p) => {
              const errorCount = p.questions.filter((q) => q.hasError).length;
              const isActive = p.part === activePart;

              return (
                <button
                  key={p.part}
                  className={`tab-button ${isActive ? "active" : ""} ${p.sheetError ? "sheet-error" : ""
                    }`}
                  onClick={() => {
                    setActivePart(p.part);
                    setActiveQuestionId(null);
                  }}
                >
                  <span className="tab-title">Part {p.part}</span>
                  {p.sheetError ? (
                    <span className="tab-badge error">Error</span>
                  ) : p.questions.length > 0 ? (
                    <span className={`tab-badge ${errorCount > 0 ? "error" : "success"}`}>
                      {p.questions.length}
                    </span>
                  ) : (
                    <span className="tab-badge empty">Empty</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="modal-divider"></div>

          {/* Main Content */}
          <div className="modal-content">
            {/* Sidebar - Question List */}
            <div className="sidebar">
              <div className="sidebar-header">
                <h3>Question List</h3>
                <span className="subtitle">
                  Part {activePart} • {activePartData?.questions.length || 0} questions
                </span>
              </div>

              {/* Sheet-level Error Banner */}
              {activePartData?.sheetError && (
                <div className="sheet-error-banner">
                  <span className="error-icon">⚠️</span>
                  <span className="error-message">{activePartData.sheetError}</span>
                </div>
              )}

              {activePartData?.questions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p className="empty-text">No questions in this part</p>
                </div>
              ) : (
                <div className="question-list">
                  {activePartData?.questions.map((q) => (
                    <div
                      key={q.id}
                      className={`question-item ${q.id === activeQuestion?.id ? "active" : ""
                        } ${q.hasError ? "has-error" : ""} ${q.isGroupQuestion ? "group-question" : ""
                        }`}
                      onClick={() => setActiveQuestionId(q.id)}
                    >
                      <div className="question-info">
                        <span className="question-index">
                          {q.isGroupQuestion ? `G${q.questionNumber}` : `Q${q.index}`}
                        </span>
                        <span className="question-preview">
                          {q.content.substring(0, 40)}...
                        </span>
                      </div>
                      <div className="question-status">
                        {q.hasError ? (
                          <span className="status-badge error">
                            <span className="status-icon">⚠</span>
                            Error
                          </span>
                        ) : (
                          <span className="status-badge success">
                            <span className="status-icon">✓</span>
                            OK
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Question Detail */}
            <div className="question-detail">
              <div className="detail-header">
                <h3>Question Details</h3>
                {activeQuestion && (
                  <div className="question-meta">
                    {activeQuestion.isGroupQuestion && (
                      <span className="meta-badge group">
                        Group Question {activeQuestion.questionNumber}
                      </span>
                    )}
                    {activeQuestion.difficultyName && (
                      <span className={`difficulty-badge ${activeQuestion.difficultyName.toLowerCase()}`}>
                        {activeQuestion.difficultyName}
                      </span>
                    )}
                    <span className="question-id">ID: {activeQuestion.id}</span>
                  </div>
                )}
              </div>

              {!activeQuestion ? (
                <div className="empty-state select">
                  <div className="empty-icon">👈</div>
                  <p className="empty-text">Select a question to view details</p>
                </div>
              ) : (
                <div className="detail-content">
                  {/* Group Information */}
                  {activeQuestion.isGroupQuestion && (
                    <>
                      <div className="detail-section group-section">
                        <h4 className="section-title">Group Information</h4>
                        <div className="group-info">
                          <div className="group-title">
                            <strong>Title:</strong> {activeQuestion.groupTitle}
                          </div>
                          <div className="group-meta">
                            <span>Row {activeQuestion.groupStartRow} - {activeQuestion.groupEndRow}</span>
                          </div>
                          <div className="group-content">
                            <strong>Passage/Conversation:</strong>
                            <p>{activeQuestion.groupContent}</p>
                          </div>
                        </div>
                      </div>
                      <div className="detail-divider"></div>
                    </>
                  )}

                  {/* Question Content */}
                  <div className="detail-section">
                    <h4 className="section-title">Question Content</h4>
                    <p className="question-content">{activeQuestion.content}</p>
                  </div>

                  <div className="detail-divider"></div>

                  {/* Answers Section */}
                  {activeQuestion.answers && activeQuestion.answers.length > 0 && (
                    <>
                      <div className="detail-section">
                        <h4 className="section-title">Answers</h4>
                        <div className="answers-list">
                          {activeQuestion.answers.map((ans, idx) => (
                            <div
                              key={idx}
                              className={`answer-item ${ans.isCorrect ? "correct" : ""}`}
                            >
                              <span className="answer-label">
                                {String.fromCharCode(65 + ans.orderIndex - 1)}
                              </span>
                              <span className="answer-content">{ans.content}</span>
                              {ans.isCorrect && (
                                <span className="correct-badge">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="detail-divider"></div>
                    </>
                  )}

                  {/* Explanation */}
                  {activeQuestion.explanation && (
                    <>
                      <div className="detail-section">
                        <h4 className="section-title">Explanation</h4>
                        <div className="explanation-content">
                          {activeQuestion.explanation}
                        </div>
                      </div>
                      <div className="detail-divider"></div>
                    </>
                  )}

                  {/* Media Section */}
                  {(activeQuestion.audioFileName || activeQuestion.imageFileName) && (
                    <>
                      <div className="detail-section">
                        <h4 className="section-title">Media Files</h4>
                        <div className="media-files">
                          {activeQuestion.audioFileName && (
                            <div className="media-item audio">
                              <span className="media-icon">🎵</span>
                              <div className="media-info">
                                <span className="media-name">{activeQuestion.audioFileName}</span>
                                <span className="media-type">Audio file</span>
                              </div>
                            </div>
                          )}
                          {activeQuestion.imageFileName && (
                            <div className="media-item image">
                              <span className="media-icon">🖼️</span>
                              <div className="media-info">
                                <span className="media-name">{activeQuestion.imageFileName}</span>
                                <span className="media-type">Image file</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="detail-divider"></div>
                    </>
                  )}

                  {/* Tags */}
                  {activeQuestion.tags && activeQuestion.tags.length > 0 && (
                    <>
                      <div className="detail-section">
                        <h4 className="section-title">Tags</h4>
                        <div className="tags-list">
                          {activeQuestion.tags.map((tag, idx) => (
                            <span key={idx} className="tag-badge">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="detail-divider"></div>
                    </>
                  )}

                  {/* Error Section */}
                  {activeQuestion.hasError && activeQuestion.errors && activeQuestion.errors.length > 0 && (
                    <div className="detail-section error-section">
                      <h4 className="section-title error-title">Data Issues</h4>
                      <div className="error-list">
                        {activeQuestion.errors.map((error, idx) => (
                          <div key={idx} className="error-item">
                            <span className="error-icon">❌</span>
                            <span className="error-text">{error}</span>
                          </div>
                        ))}
                      </div>
                      <div className="error-note">
                        Please fix these issues before importing.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-divider"></div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="footer-actions">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <div className="import-summary">
                <span className="summary-text">
                  Ready to import <strong>{totalValidQuestions}</strong> valid questions
                </span>
                {errorCount > 0 && (
                  <span className="summary-note">
                    ({errorCount} questions with errors will be skipped)
                  </span>
                )}
              </div>
              <button
                className={`btn btn-primary ${totalValidQuestions === 0 ? "disabled" : ""}`}
                disabled={totalValidQuestions === 0}
                onClick={onImport}
              >
                <span className="btn-icon">📥</span>
                Import Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </Spin>

  );
};

export default PreviewImportModal;