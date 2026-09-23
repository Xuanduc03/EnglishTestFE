import React, { useState, useEffect, useRef } from 'react';
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
  isFillInType,
  isTfngType,
  normalizeQuestionType,
} from '../types/examDigitize';
import './ExamDigitizeModal.scss';
import { Select } from 'antd';
const { Option } = Select;
import { categorieservice } from '../../../../../pages/Admin/Categories/category.service';

type Step = 'upload' | 'preview' | 'saving';
type UploadMode = 'auto' | 'split';
type SplitStep = 'passage' | 'questions';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

// ── TFNG options ──────────────────────────────────────────
const TFNG_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'];
const YNNG_OPTIONS = ['YES', 'NO', 'NOT GIVEN'];

const ExamDigitizeModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('IELTS_READING');
  const [dragOver, setDragOver] = useState<string | null>(null);

  // ── Upload mode ──────────────────────────────────────────
  const [uploadMode, setUploadMode] = useState<UploadMode>('auto');
  const [splitStep, setSplitStep] = useState<SplitStep>('passage');

  // ── Image files ──────────────────────────────────────────
  const [autoFiles, setAutoFiles] = useState<File[]>([]);
  const [passageFiles, setPassageFiles] = useState<File[]>([]);
  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ── Audio file (for LISTENING) ────────────────────────────
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  // ── Extracted data ───────────────────────────────────────
  const [extracted, setExtracted] = useState<ExtractedExamDto | null>(null);
  const [passageData, setPassageData] = useState<ExtractedExamDto | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [passageDone, setPassageDone] = useState(false);

  // ── Save config ──────────────────────────────────────────
  const [categoryId, setCategoryId] = useState('');
  const [difficultyId, setDifficultyId] = useState('');
  const [tags, setTags] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [difficulties, setDifficulties] = useState<{ id: string; name: string }[]>([]);
  const [diagramFile, setDiagramFile] = useState<File | null>(null);
  const hasMatchingDiagram = questions.some(q => q.questionType === 4);
  const diagramInputRef = useRef<HTMLInputElement>(null);


  const isListening = examType.includes('LISTENING');
  const isReading = examType.includes('READING');

  // Auto switch mode based on exam type
  useEffect(() => {
    if (examType === 'IELTS_READING') setUploadMode('split');
    else setUploadMode('auto');
  }, [examType]);

  // Clean up audio object URL on change
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioPreview('');
    }
  }, [audioFile]);

  const loadCategories = async (currentExamType: string) => {
    try {
      const [resSkill, resLevel] = await Promise.all([
        categorieservice.getSelectCategory('skill', currentExamType),
        categorieservice.getSelectCategory('level'),
      ]);
      setCategories(resSkill.map((x: any) => ({
        id: x.value,
        name: x.label.replace(/ \(.*\)$/, ''),
      })));
      setDifficulties(resLevel
        .filter((x: any) => !x.label.includes('Danh mục'))
        .map((x: any) => ({
          id: x.value,
          name: x.label.replace(/ \(.*\)$/, ''),
        }))
      );
    } catch { }
  };


  // ── Image file helpers ────────────────────────────────────
  const addFiles = (newFiles: File[], setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    const images = newFiles.filter(f => f.type.startsWith('image/'));
    if (!images.length) { toast.warning('Only JPG/PNG images accepted'); return; }
    setter(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...images.filter(f => !existing.has(f.name + f.size))];
    });
  };

  const makeHandlers = (
    setter: React.Dispatch<React.SetStateAction<File[]>>,
    zoneId: string,
  ) => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(zoneId); },
    onDragLeave: () => setDragOver(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault(); setDragOver(null);
      addFiles(Array.from(e.dataTransfer.files), setter);
    },
    onClick: () => document.getElementById(`file-input-${zoneId}`)?.click(),
  });

  const makeFileInput = (
    setter: React.Dispatch<React.SetStateAction<File[]>>,
    zoneId: string,
  ) => (
    <input
      id={`file-input-${zoneId}`}
      type="file" accept="image/*" multiple
      style={{ display: 'none' }}
      onChange={e => { addFiles(Array.from(e.target.files ?? []), setter); e.target.value = ''; }}
    />
  );

  // ── Extract handlers ─────────────────────────────────────
  /**
   * Apply normalizeQuestionType to every question coming from AI.
   * This fixes misidentified types (e.g. AI returns 12=FormCompletion for a
   * NoteCompletion IELTS Listening question).
   */
  const normalizeQuestions = (qs: ExtractedQuestion[], type: string): ExtractedQuestion[] =>
    qs.map(q => ({ ...q, questionType: normalizeQuestionType(q, type) }));

  const handleExtractAuto = async () => {
    if (!autoFiles.length) { toast.warning('Please select at least 1 image'); return; }
    setLoading(true);
    try {
      const res = await examDigitizeService.extract(autoFiles, examType);
      const normalized = normalizeQuestions(res.data.questions, examType);
      setExtracted({ ...res.data, questions: normalized });
      setQuestions(normalized);
      await loadCategories(examType);
      setStep('preview');
      toast.success(`Extracted ${normalized.length} questions successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI could not read the image, please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractPassage = async () => {
    if (!passageFiles.length) { toast.warning('Please select passage images'); return; }
    setLoading(true);
    try {
      const res = await examDigitizeService.extract(passageFiles, examType, true, false);
      setPassageData(res.data);
      setPassageDone(true);
      setSplitStep('questions');
      toast.success('Passage read! Now upload question images.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error reading passage!');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractQuestions = async () => {
    if (!questionFiles.length) { toast.warning('Please select question images'); return; }
    setLoading(true);
    try {
      const res = await examDigitizeService.extract(
        questionFiles, examType, false, true, passageData?.passageContent ?? '',
      );
      const normalized = normalizeQuestions(res.data.questions, examType);
      const merged: ExtractedExamDto = {
        ...res.data,
        passageTitle: passageData?.passageTitle ?? null,
        passageContent: passageData?.passageContent ?? null,
        questions: normalized,
      };
      setExtracted(merged);
      setQuestions(normalized);
      await loadCategories(examType);
      setStep('preview');
      toast.success(`Extracted ${normalized.length} questions successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error reading questions!');
    } finally {
      setLoading(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!categoryId) { toast.error('Please select Part / Section / Passage'); return; }
    if (!difficultyId) { toast.error('Please select difficulty'); return; }
    if (!extracted) return;
    setStep('saving');
    try {
      const command: SaveDigitizedExamCommand = {
        categoryId,
        difficultyId,
        audioFile: isListening && audioFile ? audioFile : undefined,
        audioUrl: isListening && !audioFile && audioUrl ? audioUrl : undefined,
        imageFile: diagramFile ?? undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        extractedData: { ...extracted, questions },
      };

      const res = await examDigitizeService.save(command);
      toast.success('Exam saved successfully!');
      onSuccess?.(res.data.groupId);
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error while saving');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setStep('upload'); setSplitStep('passage');
    setAutoFiles([]); setPassageFiles([]); setQuestionFiles([]);
    setExtracted(null); setPassageData(null); setPassageDone(false);
    setQuestions([]); setCategoryId(''); setDifficultyId('');
    setDiagramFile(null);
    setTags(''); setAudioUrl(''); setAudioFile(null);
    onClose();
  };

  // ── Question helpers ─────────────────────────────────────
  const updateQuestion = (idx: number, field: keyof ExtractedQuestion, value: any) =>
    setQuestions(prev => { const n = [...prev]; (n[idx] as any)[field] = value; return n; });

  const updateAnswer = (qi: number, ai: number, field: string, value: any) =>
    setQuestions(prev => {
      const n = [...prev];
      const answers = [...n[qi].answers];
      (answers[ai] as any)[field] = value;
      if (field === 'isCorrect' && value)
        answers.forEach((a, i) => { if (i !== ai) a.isCorrect = false; });
      n[qi] = { ...n[qi], answers };
      return n;
    });

  const removeQuestion = (idx: number) =>
    setQuestions(prev =>
      prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i + 1 }))
    );

  // ── File grid component (extracted outside render to avoid remount) ──
  // NOTE: defined as inner component — kept here for prop access but stable via key
  const FileGrid = ({
    files, setter, zoneId, label, hint,
  }: {
    files: File[];
    setter: React.Dispatch<React.SetStateAction<File[]>>;
    zoneId: string;
    label: string;
    hint?: string;
  }) => {
    const handlers = makeHandlers(setter, zoneId);
    return (
      <div>
        <div className="drop-zone-label">{label}</div>
        {hint && <div className="drop-zone-hint-text">{hint}</div>}
        <div
          className={`drop-zone ${dragOver === zoneId ? 'drag-over' : ''} ${files.length ? 'has-files' : ''}`}
          {...handlers}
        >
          {makeFileInput(setter, zoneId)}
          {files.length > 0 ? (
            <div className="file-grid-wrapper">
              <div className="file-grid">
                {files.map((f, idx) => (
                  <div key={idx} className="file-item">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="file-item__img" />
                    <span className="file-item__order">{idx + 1}</span>
                    <button
                      className="file-item__remove"
                      onClick={e => { e.stopPropagation(); setter(p => p.filter((_, i) => i !== idx)); }}
                    >✕</button>
                    <span className="file-item__name">{f.name}</span>
                  </div>
                ))}
                <div
                  className="file-item file-item--add"
                  onClick={e => { e.stopPropagation(); document.getElementById(`file-input-${zoneId}`)?.click(); }}
                >
                  <span style={{ fontSize: 24 }}>+</span>
                  <span>Add image</span>
                </div>
              </div>
              <div className="file-count">{files.length} image{files.length > 1 ? 's' : ''}</div>
            </div>
          ) : (
            <div className="drop-zone__placeholder">
              <div className="drop-zone__icon">📤</div>
              <div className="drop-zone__text">Drag & drop or click to select</div>
              <div className="drop-zone__hint">JPG, PNG — multiple files allowed</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Audio drop zone (for LISTENING) ──────────────────────
  const renderAudioUpload = () => {
    const handleAudioDrop = (e: React.DragEvent) => {
      e.preventDefault(); setDragOver(null);
      const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('audio/'));
      if (file) setAudioFile(file);
      else toast.warning('Only audio files accepted (MP3, WAV, M4A...)');
    };

    return (
      <div className="audio-upload-section">
        <div className="drop-zone-label">🎵 Audio File <span className="badge badge--optional">optional</span></div>
        <div className="drop-zone-hint-text">Upload the listening audio for this group (MP3, WAV, M4A...)</div>

        <div
          className={`drop-zone drop-zone--audio ${dragOver === 'audio' ? 'drag-over' : ''} ${audioFile ? 'has-files' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver('audio'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={handleAudioDrop}
          onClick={() => audioInputRef.current?.click()}
        >
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) setAudioFile(file);
              e.target.value = '';
            }}
          />

          {audioFile ? (
            <div className="audio-preview">
              <div className="audio-preview__info">
                <span className="audio-preview__icon">🎵</span>
                <div>
                  <div className="audio-preview__name">{audioFile.name}</div>
                  <div className="audio-preview__size">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  className="file-item__remove"
                  onClick={e => { e.stopPropagation(); setAudioFile(null); }}
                >✕</button>
              </div>
              {audioPreview && (
                <audio
                  controls
                  src={audioPreview}
                  className="audio-preview__player"
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          ) : (
            <div className="drop-zone__placeholder">
              <div className="drop-zone__icon">🎵</div>
              <div className="drop-zone__text">Drag & drop audio or click to select</div>
              <div className="drop-zone__hint">MP3, WAV, M4A, OGG</div>
            </div>
          )}
        </div>

        {/* Alternative: paste URL directly */}
        <div className="audio-url-alt">
          <span className="audio-url-alt__label">Or paste a URL:</span>
          <input
            type="text"
            className="form-control audio-url-alt__input"
            value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)}
            placeholder="https://cdn.example.com/audio.mp3"
          />
        </div>
      </div>
    );
  };

  // ── Preview question card render ──────────────────────────
  const renderQuestionAnswers = (q: ExtractedQuestion, qi: number) => {
    const type = q.questionType;

    // Fill-in types (NoteCompletion, FormCompletion, ShortAnswer, etc.)
    if (isFillInType(type) || q.isAiGraded) {
      return (
        <div className="fillin-row">
          <div className="fillin-field">
            <label>Correct Answer</label>
            <input
              type="text" className="form-control"
              value={q.sampleAnswer ?? ''}
              onChange={e => updateQuestion(qi, 'sampleAnswer', e.target.value)}
              placeholder="e.g. marketing"
            />
          </div>
          <div className="fillin-field fillin-field--small">
            <label>Max Words</label>
            <input
              type="number" className="form-control"
              value={q.maxWords ?? 1}
              onChange={e => updateQuestion(qi, 'maxWords', Number(e.target.value))}
              min={1} max={10}
            />
          </div>
        </div>
      );
    }

    // True/False/Not Given
    if (isTfngType(type)) {
      const opts = type === 9 /* YesNoNotGiven */ ? YNNG_OPTIONS : TFNG_OPTIONS;

      // Determine which option is currently selected
      // If AI returned multiple answers, find the one with isCorrect=true.
      // If AI just returned 1 answer, use its content.
      const selectedContent = q.answers.find(a => a.isCorrect)?.content || q.answers[0]?.content;

      return (
        <div className="answers-list">
          {opts.map((opt, ai) => {
            const isSelected = selectedContent === opt;
            return (
              <div key={ai} className={`answer-row ${isSelected ? 'correct' : ''}`}>
                <button
                  className={`answer-correct-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    // Update answers: explicitly create 3 options, mark clicked one as correct
                    const newAnswers = opts.map((o, i) => ({
                      content: o,
                      isCorrect: i === ai,
                      orderIndex: i + 1,
                    }));
                    updateQuestion(qi, 'answers', newAnswers);
                  }}
                >{isSelected ? '✓' : '○'}</button>
                <span className="answer-label">{opt}</span>
              </div>
            );
          })}
        </div>
      );
    }

    // MCQ (Single / Multiple Choice)
    const isMultipleChoice = type === 7; // 7 = QType.MultipleChoice

    return (
      <div className="answers-list">
        {q.answers.map((a, ai) => (
          <div key={ai} className={`answer-row ${a.isCorrect ? 'correct' : ''}`}>
            <button
              className={`answer-correct-btn ${a.isCorrect ? 'active' : ''}`}
              onClick={() => {
                if (isMultipleChoice) {
                  // Checkbox behavior: toggle current option
                  updateAnswer(qi, ai, 'isCorrect', !a.isCorrect);
                } else {
                  // Radio behavior: set current to true, all others to false
                  const newAnswers = q.answers.map((opt, optIdx) => ({
                    ...opt,
                    isCorrect: optIdx === ai,
                  }));
                  updateQuestion(qi, 'answers', newAnswers);
                }
              }}
            >
              {a.isCorrect ? (isMultipleChoice ? '☑' : '✓') : (isMultipleChoice ? '☐' : '○')}
            </button>
            <input
              type="text" className="form-control answer-input"
              value={a.content}
              onChange={e => updateAnswer(qi, ai, 'content', e.target.value)}
            />
          </div>
        ))}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="digitize-overlay">
      <div className="digitize-modal">

        {/* HEADER */}
        <div className="digitize-header">
          <div className="digitize-header__title">
            <span>🤖</span><span>Quét câu hỏi sử dụng AI</span>
          </div>
          <div className="digitize-steps">
            <span className={`step ${step === 'upload' ? 'active' : 'done'}`}>1. Upload</span>
            <span className="step-arrow">→</span>
            <span className={`step ${step === 'preview' || step === 'saving' ? 'active' : ''}`}>2. Review</span>
            <span className="step-arrow">→</span>
            <span className={`step ${step === 'saving' ? 'active' : ''}`}>3. Save</span>
          </div>
          <button className="digitize-close" onClick={handleClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="digitize-body">

          {/* ── STEP 1: UPLOAD ──────────────────────────── */}
          {step === 'upload' && (
            <div className="upload-step">

              {/* Exam type selector */}
              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <div className="exam-type-grid">
                  {EXAM_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`exam-type-btn ${examType === opt.value ? 'active' : ''}`}
                      onClick={() => setExamType(opt.value)}
                    >
                      <span>{opt.icon}</span><span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio upload — LISTENING only */}
              {isListening && renderAudioUpload()}

              {/* Upload mode toggle — Reading only */}
              {isReading && (
                <div className="mode-toggle-wrapper">
                  <div className="mode-toggle">
                    <button
                      className={`mode-btn ${uploadMode === 'auto' ? 'active' : ''}`}
                      onClick={() => setUploadMode('auto')}
                    >
                      ⚡ Auto
                    </button>
                    <button
                      className={`mode-btn ${uploadMode === 'split' ? 'active' : ''}`}
                      onClick={() => { setUploadMode('split'); setSplitStep('passage'); }}
                    >
                      ✂️ Split (passage + questions)
                    </button>
                  </div>

                  {uploadMode === 'auto' && (
                    <div className="mode-info mode-info--warning">
                      <span className="mode-info__icon">⚠️</span>
                      <div>
                        <div className="mode-info__title">Auto mode</div>
                        <div className="mode-info__desc">
                          Upload all images at once. Works for short passages (&lt;8 questions).
                          For long passages (2+ pages), AI may truncate JSON mid-response.
                        </div>
                      </div>
                    </div>
                  )}
                  {uploadMode === 'split' && (
                    <div className="mode-info mode-info--success">
                      <span className="mode-info__icon">✅</span>
                      <div>
                        <div className="mode-info__title">Split mode (recommended)</div>
                        <div className="mode-info__desc">
                          Step 1: Upload passage images → AI reads passage.<br />
                          Step 2: Upload question images → AI reads questions &amp; merges automatically.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── AUTO MODE ───────────────────────────── */}
              {uploadMode === 'auto' && (
                <FileGrid
                  files={autoFiles}
                  setter={setAutoFiles}
                  zoneId="auto"
                  label="Exam Images"
                  hint="Upload all pages in order"
                />
              )}

              {/* ── SPLIT MODE ──────────────────────────── */}
              {uploadMode === 'split' && (
                <div className="split-mode">
                  <div className="split-progress">
                    <div className={`split-step ${splitStep === 'passage' ? 'active' : passageDone ? 'done' : ''}`}>
                      <span className="split-step__num">{passageDone ? '✓' : '1'}</span>
                      <span>Passage</span>
                    </div>
                    <div className="split-progress__line" />
                    <div className={`split-step ${splitStep === 'questions' ? 'active' : ''}`}>
                      <span className="split-step__num">2</span>
                      <span>Questions</span>
                    </div>
                  </div>

                  {splitStep === 'passage' && (
                    <div className="split-panel">
                      <div className="split-panel__header">
                        <span className="split-panel__badge">Step 1 / 2</span>
                        <span className="split-panel__title">Upload passage images</span>
                      </div>
                      <div className="split-panel__tip">
                        💡 Capture all pages containing the reading passage.
                        If passage spans 2 pages, upload both images.
                        Do NOT include question pages in this step.
                      </div>
                      <FileGrid
                        files={passageFiles}
                        setter={setPassageFiles}
                        zoneId="passage"
                        label="Passage page images"
                      />
                    </div>
                  )}

                  {splitStep === 'questions' && (
                    <div className="split-panel">
                      <div className="split-panel__header">
                        <span className="split-panel__badge split-panel__badge--green">Step 2 / 2</span>
                        <span className="split-panel__title">Upload question images</span>
                      </div>

                      {passageData && (
                        <div className="passage-done-banner">
                          <span>✓</span>
                          <div>
                            <strong>Passage read:</strong>{' '}
                            {passageData.passageTitle ?? 'No title'}
                            <button
                              className="passage-redo-btn"
                              onClick={() => { setSplitStep('passage'); setPassageDone(false); setPassageData(null); }}
                            >
                              Re-read
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="split-panel__tip">
                        💡 Capture pages containing questions (Questions 1–7, Questions 8–13...).
                        If questions span multiple pages, upload all of them.
                      </div>
                      <FileGrid
                        files={questionFiles}
                        setter={setQuestionFiles}
                        zoneId="questions"
                        label="Question page images"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tips */}
              <div className="upload-tips">
                <div className="tip">💡 Use sharp, well-lit, straight images for best results</div>
                <div className="tip">💡 AI auto-detects: MCQ, T/F/NG, Note/Table/Form Completion, Matching...</div>
                <div className="tip">💡 You can edit all extracted content before saving</div>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ─────────────────────────── */}
          {(step === 'preview' || step === 'saving') && extracted && (
            <div className="preview-step">
              <div className="preview-layout">
                <div className="preview-left">
                  <div className="preview-section__title">
                    📋 Extracted Content
                    <span className="badge">{questions.length} questions</span>
                    {uploadMode === 'split' && (
                      <span className="badge badge--info">Split mode</span>
                    )}
                  </div>

                  {extracted.passageContent && (
                    <div className="passage-box">
                      <label className="form-label fw-bold">
                        {extracted.passageTitle ?? 'Passage'}
                      </label>
                      <textarea
                        className="form-control passage-textarea"
                        value={extracted.passageContent}
                        onChange={e => setExtracted(p => p ? { ...p, passageContent: e.target.value } : p)}
                        rows={8}
                      />
                    </div>
                  )}

                  {questions.map((q, qi) => (
                    <div key={qi} className="question-card">
                      <div className="question-card__header">
                        <span className="question-card__num">Q{q.orderIndex}</span>
                        <span className="question-card__type">
                          {QUESTION_TYPE_LABEL[q.questionType] ?? `Type ${q.questionType}`}
                        </span>
                        {(isFillInType(q.questionType) || q.isAiGraded) && (
                          <span className="badge badge--ai">✏️ Fill-in</span>
                        )}
                        <button className="question-card__remove" onClick={() => removeQuestion(qi)}>✕</button>
                      </div>

                      <textarea
                        className="form-control question-text"
                        value={q.questionText}
                        onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                        rows={2}
                        placeholder="Question content..."
                      />
                      <textarea
                        className="form-control question-explanation"
                        value={q.explanation ?? ''}
                        onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                        rows={2}
                        placeholder="💡 Explanation (optional)..."
                      />

                      {renderQuestionAnswers(q, qi)}
                    </div>
                  ))}

                  {/* ── IMAGE PREVIEW BOTTOM SECTION ───────────────── */}
                  <div className="preview-source-images">
                    <div className="preview-source-images__title">
                      🖼️ Source Images uploaded ({uploadMode === 'auto' ? autoFiles.length : passageFiles.length + questionFiles.length})
                    </div>
                    <div className="preview-source-images__grid">
                      {(uploadMode === 'auto' ? autoFiles : [...passageFiles, ...questionFiles]).map((f, i) => (
                        <div
                          key={i}
                          className="source-image-thumb"
                          onClick={() => setPreviewImage(URL.createObjectURL(f))}
                        >
                          <img src={URL.createObjectURL(f)} alt={`source-${i}`} />
                          <div className="zoom-icon">🔍</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: save config */}
                <div className="preview-right">
                  {hasMatchingDiagram && (
                    <div className="form-group">
                      <label className="form-label">
                        📐 Diagram Image <span className="badge badge--optional">for Matching Q</span>
                      </label>
                      <div className="drop-zone drop-zone--small"
                        onClick={() => diagramInputRef.current?.click()}
                        onDrop={e => {
                          e.preventDefault();
                          const f = e.dataTransfer.files[0];
                          if (f?.type.startsWith('image/')) setDiagramFile(f);
                        }}
                        onDragOver={e => e.preventDefault()}
                      >
                        <input ref={diagramInputRef} type="file" accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) setDiagramFile(f); }} />
                        {diagramFile ? (
                          <div className="diagram-preview">
                            <img src={URL.createObjectURL(diagramFile)} alt="diagram" style={{ maxHeight: 120 }} />
                            <button onClick={() => setDiagramFile(null)}>✕</button>
                          </div>
                        ) : (
                          <div className="drop-zone__placeholder">
                            <div>📐 Upload diagram A-H</div>
                            <div className="drop-zone__hint">Ảnh chứa hình vẽ A-H cho câu Matching</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="save-config">
                    <div className="save-config__title">⚙️ Save Configuration</div>

                    <div className="form-group">
                      <label className="form-label">
                        Part / Section / Passage <span className="text-danger">*</span>
                      </label>

                      <Select
                        value={categoryId || undefined}
                        onChange={(value) => setCategoryId(value)}
                        placeholder="-- Select category --"
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {categories.map(c => (
                          <Option key={c.id} value={c.id}>
                            {c.name}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Difficulty <span className="text-danger">*</span>
                      </label>

                      <Select
                        value={difficultyId || undefined}
                        onChange={(value) => setDifficultyId(value)}
                        placeholder="-- Select difficulty --"
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {difficulties.map(d => (
                          <Option key={d.id} value={d.id}>
                            {d.name}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* Audio info summary for listening */}
                    {isListening && (
                      <div className="form-group">
                        <label className="form-label">Audio</label>
                        {audioFile ? (
                          <div className="audio-summary">
                            <span>🎵 {audioFile.name}</span>
                            <button
                              className="passage-redo-btn"
                              onClick={() => setAudioFile(null)}
                            >Remove</button>
                          </div>
                        ) : audioUrl ? (
                          <div className="audio-summary">
                            <span>🔗 URL set</span>
                            <button
                              className="passage-redo-btn"
                              onClick={() => setAudioUrl('')}
                            >Clear</button>
                          </div>
                        ) : (
                          <div className="audio-missing-warn">
                            ⚠️ No audio set — go back to upload if needed
                          </div>
                        )}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Tags</label>
                      <input
                        type="text" className="form-control" value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="ielts,listening,cambridge18"
                      />
                    </div>

                    <div className="summary-box">
                      <div className="summary-row"><span>Exam Type</span><span>{examType}</span></div>
                      <div className="summary-row"><span>Mode</span><span>{uploadMode === 'split' ? '✂️ Split' : '⚡ Auto'}</span></div>
                      <div className="summary-row"><span>Questions</span><span>{questions.length}</span></div>
                      <div className="summary-row"><span>Fill-in</span><span>{questions.filter(q => isFillInType(q.questionType) || q.isAiGraded).length}</span></div>
                      <div className="summary-row"><span>MCQ</span><span>{questions.filter(q => !isFillInType(q.questionType) && !q.isAiGraded).length}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="digitize-footer">
          {step === 'upload' && uploadMode === 'auto' && (
            <>
              <button className="btn btn-default" onClick={handleClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleExtractAuto}
                disabled={!autoFiles.length || loading}>
                {loading
                  ? <><span className="spinner" /> Processing...</>
                  : <>🤖 Extract {autoFiles.length > 0 ? `${autoFiles.length} image${autoFiles.length > 1 ? 's' : ''}` : ''}</>}
              </button>
            </>
          )}

          {step === 'upload' && uploadMode === 'split' && splitStep === 'passage' && (
            <>
              <button className="btn btn-default" onClick={handleClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleExtractPassage}
                disabled={!passageFiles.length || loading}>
                {loading
                  ? <><span className="spinner" /> Reading passage...</>
                  : <>📖 Read Passage ({passageFiles.length} image{passageFiles.length !== 1 ? 's' : ''})</>}
              </button>
            </>
          )}

          {step === 'upload' && uploadMode === 'split' && splitStep === 'questions' && (
            <>
              <button className="btn btn-default"
                onClick={() => { setSplitStep('passage'); setPassageDone(false); }}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={handleExtractQuestions}
                disabled={!questionFiles.length || loading}>
                {loading
                  ? <><span className="spinner" /> Reading questions...</>
                  : <>❓ Read Questions ({questionFiles.length} image{questionFiles.length !== 1 ? 's' : ''})</>}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button className="btn btn-default" onClick={() => setStep('upload')}>← Re-upload</button>
              <div className="footer-right">
                <span className="footer-hint">⚠️ Review carefully before saving</span>
                <button className="btn btn-success" onClick={handleSave}
                  disabled={!categoryId || !difficultyId}>
                  💾 Save to Database
                </button>
              </div>
            </>
          )}

          {step === 'saving' && (
            <div className="saving-indicator">
              <span className="spinner" /> Saving...
            </div>
          )}

        </div>

        {/* ── FULL SCREEN IMAGE OVERLAY ──────────────────────── */}
        {previewImage && (
          <div className="fullscreen-image-overlay" onClick={() => setPreviewImage(null)}>
            <button className="fullscreen-close" onClick={() => setPreviewImage(null)}>✕</button>
            <img src={previewImage} alt="Fullscreen preview" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDigitizeModal;