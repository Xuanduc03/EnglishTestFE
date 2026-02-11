export const TOTAL_QUESTIONS = 200;
export const INITIAL_TIME = 120 * 60; // 120 minutes in seconds

export const DUMMY_QUESTIONS = [
  // Listening Part 1
  ...Array(6).fill(0).map((_, i) => ({
    id: i + 1,
    part: 1,
    type: 'listening' as const,
    image: `https://placehold.co/600x400/e2e8f0/cbd5e0?text=Image+for+Q${i+1}`,
    audio: 'audio_placeholder.mp3',
    options: ['A', 'B', 'C', 'D']
  })),
  // Reading Part 5
  ...Array(30).fill(0).map((_, i) => ({
    id: i + 101,
    part: 5,
    type: 'reading_single' as const,
    question: `Câu ${i + 101}. The marketing team will _______ a new strategy to increase online engagement.`,
    options: ['implementation', 'implement', 'implementing', 'implemented']
  })),
  // Reading Part 7
  ...Array(5).fill(0).map((_, i) => ({
    id: 153 + i * 3,
    part: 7,
    type: 'reading_block' as const,
    passage: `<strong>To:</strong> All Staff<br><strong>From:</strong> Management<br><strong>Date:</strong> October 26<br><strong>Subject:</strong> Office Renovation<br><br>Please be advised that the main office area will be undergoing renovation from November 1st to November 5th. During this period, all staff are requested to work from home. Access to the office will be restricted. We apologize for any inconvenience this may cause and appreciate your cooperation.`,
    questions: [
      { id: 153 + i * 3, text: 'What is the purpose of this memo?', options: ['To announce a holiday', 'To inform about renovation', 'To introduce a new policy', 'To request a meeting'] },
      { id: 154 + i * 3, text: 'When will the renovation take place?', options: ['October 26', 'November 1-5', 'All of November', 'Immediately'] },
      { id: 155 + i * 3, text: 'What are staff asked to do?', options: ['Work overtime', 'Clean the office', 'Work from home', 'Attend a training'] }
    ]
  }))
];