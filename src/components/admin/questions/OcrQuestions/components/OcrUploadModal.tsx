import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { examDigitizeService } from '../services/examDigitizeService';
import type {
  ExtractedExamDto,
  ExtractedQuestion,
  SaveDigitizedExamCommand,
} from '../types/examDigitize';
import {
  EXAM_TYPE_OPTIONS,
  QUESTION_TYPE_LABEL,
} from '../types/examDigitize';
import './ExamDigitizeModal.scss';
import { categorieservice } from '../../../../../pages/Admin/Categories/category.service';

type Step = 'upload' | 'preview' | 'saving';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

const ExamDigitizeModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  // ── Step state ───────────────────────────────────────────
  const [step, setStep]             = useState<Step>('upload');
  const [loading, setLoading]       = useState(false);

  // ── Upload state ─────────────────────────────────────────
  const [file, setFile]             = useState<File | null>(null);
  const [examType, setExamType]     = useState('IELTS_READING');
  const [dragOver, setDragOver]     = useState(false);

  // ── Preview state ────────────────────────────────────────
  const [extracted, setExtracted]   = useState<ExtractedExamDto | null>(null);
  const [questions, setQuestions]   = useState<ExtractedQuestion[]>([]);

  // ── Save state ───────────────────────────────────────────
  const [categoryId, setCategoryId]   = useState('');
  const [difficultyId, setDifficultyId] = useState('');
  const [tags, setTags]               = useState('');
  const [audioUrl, setAudioUrl]       = useState('');
  const [categories, setCategories]   = useState<{id:string;name:string}[]>([]);
  const [difficulties, setDifficulties] = useState<{id:string;name:string}[]>([]);

  const isListening = examType.includes('LISTENING');

  // ── Load categories khi mở preview ───────────────────────
  const loadCategories = async () => {
    if (categories.length > 0) return;
    try {
      const [resSkill, resLevel] = await Promise.all([
        categorieservice.getSelectCategory('skill'),
        categorieservice.getSelectCategory('level'),
      ]);
      setCategories(resSkill.map((x: any) => ({
        id: x.value, name: x.label.replace(' (SKILL)', ''),
      })));
      setDifficulties(resLevel.map((x: any) => ({
        id: x.value, name: x.label.replace(' (LEVEL)', ''),
      })));
    } catch { }
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setFile(f);
  };

  const handleExtract = async () => {
    if (!file) { toast.warning('Vui lòng chọn ảnh đề thi'); return; }
    setLoading(true);
    try {
      const res = await examDigitizeService.extract(file, examType);
      setExtracted(res.data);
      setQuestions(res.data.questions);
      await loadCategories();
      setStep('preview');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI không thể đọc ảnh, thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryId)  { toast.error('Vui lòng chọn Part/Section/Passage'); return; }
    if (!difficultyId){ toast.error('Vui lòng chọn độ khó'); return; }
    if (!extracted)   return;

    setStep('saving');
    try {
      const command: SaveDigitizedExamCommand = {
        categoryId,
        difficultyId,
        audioUrl:      isListening ? audioUrl : undefined,
        tags:          tags.split(',').map(t => t.trim()).filter(Boolean),
        extractedData: { ...extracted, questions },
      };
      const res = await examDigitizeService.save(command);
      toast.success('Lưu đề thi thành công!');
      onSuccess?.(res.data.groupId);
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setExtracted(null);
    setQuestions([]);
    setCategoryId('');
    setDifficultyId('');
    setTags('');
    setAudioUrl('');
    onClose();
  };

  // ── Question editor helpers ───────────────────────────────
  const updateQuestion = (idx: number, field: keyof ExtractedQuestion, value: any) => {
    setQuestions(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      return next;
    });
  };

  const updateAnswer = (qIdx: number, aIdx: number, field: string, value: any) => {
    setQuestions(prev => {
      const next = [...prev];
      const answers = [...next[qIdx].answers];
      (answers[aIdx] as any)[field] = value;
      // isCorrect: chỉ 1 đáp án đúng
      if (field === 'isCorrect' && value === true) {
        answers.forEach((a, i) => { if (i !== aIdx) a.isCorrect = false; });
      }
      next[qIdx] = { ...next[qIdx], answers };
      return next;
    });
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  if (!open) return null;

  return (
    <div className="digitize-overlay">
      <div className="digitize-modal">

        {/* HEADER */}
        <div className="digitize-header">
          <div className="digitize-header__title">
            <span className="digitize-header__icon">🤖</span>
            <span>Số hóa đề thi bằng AI</span>
          </div>
          <div className="digitize-steps">
            <span className={`step ${step === 'upload' ? 'active' : step !== 'upload' ? 'done' : ''}`}>
              1. Upload ảnh
            </span>
            <span className="step-arrow">→</span>
            <span className={`step ${step === 'preview' || step === 'saving' ? 'active' : ''}`}>
              2. Kiểm tra & chỉnh sửa
            </span>
            <span className="step-arrow">→</span>
            <span className={`step ${step === 'saving' ? 'active' : ''}`}>
              3. Lưu vào hệ thống
            </span>
          </div>
          <button className="digitize-close" onClick={handleClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="digitize-body">

          {/* ── STEP 1: UPLOAD ─────────────────────────── */}
          {step === 'upload' && (
            <div className="upload-step">
              {/* Exam type */}
              <div className="form-group">
                <label className="form-label">Loại đề thi</label>
                <div className="exam-type-grid">
                  {EXAM_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`exam-type-btn ${examType === opt.value ? 'active' : ''}`}
                      onClick={() => setExamType(opt.value)}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('digitize-file-input')?.click()}
              >
                <input
                  id="digitize-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="drop-zone__preview">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="drop-zone__img"
                    />
                    <div className="drop-zone__filename">{file.name}</div>
                    <button
                      className="drop-zone__remove"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                    >
                      Đổi ảnh
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone__placeholder">
                    <div className="drop-zone__icon">📤</div>
                    <div className="drop-zone__text">Kéo thả hoặc click để chọn ảnh đề thi</div>
                    <div className="drop-zone__hint">JPG, PNG — Trang đề thi chụp rõ, không mờ</div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="upload-tips">
                <div className="tip">💡 Chụp rõ toàn bộ trang đề, tránh bị cắt</div>
                <div className="tip">💡 Nên upload từng trang riêng lẻ để AI đọc chính xác hơn</div>
                <div className="tip">💡 AI sẽ tự nhận dạng dạng câu hỏi (MCQ, Fill-in, Matching...)</div>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ────────────────────────── */}
          {(step === 'preview' || step === 'saving') && extracted && (
            <div className="preview-step">
              <div className="preview-layout">

                {/* LEFT: passage + questions */}
                <div className="preview-left">
                  <div className="preview-section">
                    <div className="preview-section__title">
                      📋 Nội dung trích xuất
                      <span className="badge">{questions.length} câu hỏi</span>
                    </div>

                    {/* Passage */}
                    {extracted.passageContent && (
                      <div className="passage-box">
                        <label className="form-label">
                          {extracted.passageTitle || 'Đoạn văn (Passage)'}
                        </label>
                        <textarea
                          className="form-control passage-textarea"
                          value={extracted.passageContent}
                          onChange={e => setExtracted(prev =>
                            prev ? { ...prev, passageContent: e.target.value } : prev
                          )}
                          rows={8}
                        />
                      </div>
                    )}

                    {/* Questions */}
                    {questions.map((q, qi) => (
                      <div key={qi} className="question-card">
                        <div className="question-card__header">
                          <span className="question-card__num">Q{q.orderIndex}</span>
                          <span className="question-card__type">
                            {QUESTION_TYPE_LABEL[q.questionType] ?? `Type ${q.questionType}`}
                          </span>
                          {q.isAiGraded && (
                            <span className="badge badge--ai">🤖 Auto grade</span>
                          )}
                          <button
                            className="question-card__remove"
                            onClick={() => removeQuestion(qi)}
                            title="Xóa câu hỏi"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Question text */}
                        <textarea
                          className="form-control question-text"
                          value={q.questionText}
                          onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                          rows={2}
                          placeholder="Nội dung câu hỏi..."
                        />

                        {/* Fill-in: sample answer */}
                        {q.isAiGraded ? (
                          <div className="fillin-row">
                            <div className="fillin-field">
                              <label>Đáp án đúng</label>
                              <input
                                type="text"
                                className="form-control"
                                value={q.sampleAnswer ?? ''}
                                onChange={e => updateQuestion(qi, 'sampleAnswer', e.target.value)}
                                placeholder="VD: Receptionist"
                              />
                            </div>
                            <div className="fillin-field fillin-field--small">
                              <label>Số từ tối đa</label>
                              <input
                                type="number"
                                className="form-control"
                                value={q.maxWords ?? 3}
                                onChange={e => updateQuestion(qi, 'maxWords', Number(e.target.value))}
                                min={1} max={10}
                              />
                            </div>
                          </div>
                        ) : (
                          /* MCQ answers */
                          <div className="answers-list">
                            {q.answers.map((a, ai) => (
                              <div key={ai} className={`answer-row ${a.isCorrect ? 'correct' : ''}`}>
                                <button
                                  className={`answer-correct-btn ${a.isCorrect ? 'active' : ''}`}
                                  onClick={() => updateAnswer(qi, ai, 'isCorrect', true)}
                                  title="Đánh dấu đúng"
                                >
                                  {a.isCorrect ? '✓' : '○'}
                                </button>
                                <input
                                  type="text"
                                  className="form-control answer-input"
                                  value={a.content}
                                  onChange={e => updateAnswer(qi, ai, 'content', e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: save config */}
                <div className="preview-right">
                  <div className="save-config">
                    <div className="save-config__title">⚙️ Cấu hình lưu</div>

                    <div className="form-group">
                      <label className="form-label">
                        Part / Section / Passage
                        <span className="text-danger"> *</span>
                      </label>
                      <select
                        className="form-select"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Độ khó
                        <span className="text-danger"> *</span>
                      </label>
                      <select
                        className="form-select"
                        value={difficultyId}
                        onChange={e => setDifficultyId(e.target.value)}
                      >
                        <option value="">-- Chọn độ khó --</option>
                        {difficulties.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Audio URL cho Listening */}
                    {isListening && (
                      <div className="form-group">
                        <label className="form-label">URL Audio (nếu có)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={audioUrl}
                          onChange={e => setAudioUrl(e.target.value)}
                          placeholder="https://cloudinary.com/..."
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Tags (cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="ielts,reading,cambridge18"
                      />
                    </div>

                    {/* Summary */}
                    <div className="summary-box">
                      <div className="summary-row">
                        <span>Loại đề</span>
                        <span>{examType}</span>
                      </div>
                      <div className="summary-row">
                        <span>Số câu hỏi</span>
                        <span>{questions.length}</span>
                      </div>
                      <div className="summary-row">
                        <span>Auto grade</span>
                        <span>{questions.filter(q => q.isAiGraded).length} câu</span>
                      </div>
                      <div className="summary-row">
                        <span>MCQ</span>
                        <span>{questions.filter(q => !q.isAiGraded).length} câu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="digitize-footer">
          {step === 'upload' && (
            <>
              <button className="btn btn-default" onClick={handleClose}>Hủy</button>
              <button
                className="btn btn-primary"
                onClick={handleExtract}
                disabled={!file || loading}
              >
                {loading
                  ? <><span className="spinner" /> AI đang đọc ảnh...</>
                  : <><span>🤖</span> Bắt đầu bóc tách</>}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                className="btn btn-default"
                onClick={() => setStep('upload')}
              >
                ← Upload lại
              </button>
              <div className="footer-right">
                <span className="footer-hint">
                  Kiểm tra kỹ trước khi lưu — AI có thể sai!
                </span>
                <button
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={!categoryId || !difficultyId}
                >
                  💾 Lưu vào hệ thống
                </button>
              </div>
            </>
          )}

          {step === 'saving' && (
            <div className="saving-indicator">
              <span className="spinner" /> Đang lưu vào hệ thống...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDigitizeModal;