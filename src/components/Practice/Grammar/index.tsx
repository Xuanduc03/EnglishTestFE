import React from 'react';
import PracticeList from '../../PracticeList';

const GrammarPage: React.FC = () => {
  // Dữ liệu với đúng kiểu type
  const grammarTests = [
    {
      id: 1,
      title: 'NOUNS',
      subtitle: 'Master the basics of nouns',
      correctRate: 0,
      questionCount: 10,
      participants: 5578,
      isFree: true,
      hasExplanation: true,
      difficulty: 'easy' as const,
      status: 'not-started' as const,
      timeEstimate: '10m',
    },
    {
      id: 2,
      title: 'COMPARISON',
      subtitle: 'Comparative and superlative forms',
      correctRate: 0,
      questionCount: 20,
      participants: 3613,
      isFree: true,
      hasExplanation: true,
      difficulty: 'medium' as const,
      status: 'not-started' as const,
      timeEstimate: '15m',
    },
    {
      id: 3,
      title: 'PHRASES & CLAUSES',
      subtitle: 'Understanding sentence structures',
      correctRate: 0,
      questionCount: 10,
      participants: 4678,
      isFree: true,
      hasExplanation: false,
      difficulty: 'hard' as const,
      status: 'not-started' as const,
      timeEstimate: '12m',
    },
    {
      id: 4,
      title: 'ADVERBIAL CLAUSES',
      subtitle: 'Advanced adverb usage',
      correctRate: 0,
      questionCount: 10,
      participants: 3778,
      isFree: true,
      hasExplanation: false,
      difficulty: 'hard' as const,
      status: 'in-progress' as const,
      timeEstimate: '20m',
    },
    {
      id: 5,
      title: 'CONDITIONALS',
      subtitle: 'If clauses and their uses',
      correctRate: 65,
      questionCount: 15,
      participants: 2876,
      isFree: false,
      hasExplanation: true,
      difficulty: 'medium' as const,
      status: 'completed' as const,
      timeEstimate: '18m',
    },
    {
      id: 6,
      title: 'RELATIVE CLAUSES',
      subtitle: 'Who, which, that clauses',
      correctRate: 42,
      questionCount: 12,
      participants: 1923,
      isFree: true,
      hasExplanation: true,
      difficulty: 'medium' as const,
      status: 'in-progress' as const,
      timeEstimate: '14m',
    },
    {
      id: 7,
      title: 'PREPOSITIONS',
      subtitle: 'In, on, at and other prepositions',
      correctRate: 0,
      questionCount: 10,
      participants: 3677,
      isFree: true,
      hasExplanation: false,
      difficulty: 'easy' as const,
      status: 'not-started' as const,
      timeEstimate: '8m',
    },
    {
      id: 8,
      title: 'TENSES',
      subtitle: 'Past, present and future tenses',
      correctRate: 78,
      questionCount: 25,
      participants: 4876,
      isFree: true,
      hasExplanation: true,
      difficulty: 'hard' as const,
      status: 'completed' as const,
      timeEstimate: '25m',
    },
  ];

  const handleStartTest = (testId: string | number) => {
    console.log('Starting test:', testId);
    // Logic để bắt đầu bài test
  };

  const handleViewExplanation = (testId: string | number) => {
    console.log('Viewing explanation for test:', testId);
    // Logic để xem giải thích
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <PracticeList
        title="Grammar Practice Tests"
        description="Master English grammar with our comprehensive practice tests. Track your progress and improve your skills."
        category="GRAMMAR"
        totalTests={38}
        tests={grammarTests}
        onStartTest={handleStartTest}
        onViewExplanation={handleViewExplanation}
      />
    </div>
  );
};

export default GrammarPage;