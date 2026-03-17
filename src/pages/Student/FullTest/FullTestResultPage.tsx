import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ResultPage from '../../../components/Test/TestComponent/ResultPage/ResultPage';
import { examAttemptService } from '../../../components/Test/services/examAttemptApi';
import type { SubmitExamResult } from './examAttempt.types';

/**
 * Wrapper page cho màn hình kết quả Full Test.
 * Route: /full-test/result/:attemptId
 *
 * Nhận data theo thứ tự ưu tiên:
 * 1. location.state.result  ← từ handleSubmit navigate
 * 2. Gọi API getExamResult(attemptId) ← khi user reload hoặc vào thẳng URL
 */
const FullTestResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<SubmitExamResult | null>(
    location.state?.result ?? null
  );
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu đã có result từ navigate state → không cần gọi API
    if (result || !attemptId) return;

    setLoading(true);
    examAttemptService.getExamResult(attemptId)
      .then((data) => setResult(data as unknown as SubmitExamResult))
      .catch(() => setError('Không thể tải kết quả bài thi.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '80vh', flexDirection: 'column', gap: 16
      }}>
        <div style={{ fontSize: 48 }}>⏳</div>
        <p style={{ fontSize: 18, color: '#475569' }}>Đang tải kết quả bài thi...</p>
      </div>
    );
  }

  if (error || !result || !attemptId) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '80vh', flexDirection: 'column', gap: 16
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ fontSize: 18, color: '#ef4444' }}>{error ?? 'Không tìm thấy kết quả.'}</p>
        <button
          onClick={() => navigate('/full-test')}
          style={{
            padding: '10px 28px', background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15
          }}
        >
          Về danh sách đề thi
        </button>
      </div>
    );
  }

  return <ResultPage result={result} attemptId={attemptId} />;
};

export default FullTestResultPage;
