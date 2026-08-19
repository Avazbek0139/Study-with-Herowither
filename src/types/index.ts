export type Difficulty = 'easy' | 'normal' | 'hard'
export type QuestionType = 'translation' | 'multiple_choice' | 'sentence_challenge' | 'spelling' | 'context' | 'matching' | 'mixed'
export type TestStatus = 'configuring' | 'in_progress' | 'completed'
export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface VocabularyItem {
  id: string
  userId: string
  word: string
  translation: string | null
  partOfSpeech: string | null
  pronunciation: string | null
  exampleSentence: string | null
  synonyms: string | null
  antonyms: string | null
  personalNote: string | null
  difficultyLevel: string
  isLearned: boolean
  createdAt: string
  updatedAt: string
  progress?: VocabularyProgressData | null
}

export interface VocabularyProgressData {
  id: string
  vocabularyId: string
  userId: string
  correctCount: number
  wrongCount: number
  accuracy: number
  attempts: number
  lastReviewed: string | null
  confidenceScore: number
  nextReviewDate: string | null
}

export interface TestConfig {
  totalQuestions: number
  questionTypes: QuestionType
  difficulty: Difficulty
}

export interface TestData {
  id: string
  userId: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeTaken: number | null
  difficulty: string
  questionTypes: string
  status: string
  createdAt: string
  questions: TestQuestionData[]
}

export interface TestQuestionData {
  id: string
  testId: string
  type: string
  questionData: QuestionContent
  correctAnswer: string
  userAnswer: string | null
  isCorrect: boolean | null
  blockNumber: number
  orderInBlock: number
  explanation: string | null
}

export interface QuestionContent {
  question: string
  options?: string[]
  word?: string
  translation?: string
  sentence?: string
  context?: string
  // Sentence Challenge specific
  sentences?: string[]
  wordBank?: string[]
  correctMapping?: Record<number, string>
}

export interface SentenceChallengeData {
  sentences: string[]
  wordBank: string[]
  correctMapping: Record<number, string>
  extraWord: string
}

export interface UserStats {
  totalWords: number
  wordsLearned: number
  wordsLearning: number
  wordsToReview: number
  testsCompleted: number
  averageAccuracy: number
  bestAccuracy: number
  currentStreak: number
}

export interface DashboardData {
  stats: UserStats
  recentWords: VocabularyItem[]
  wordsToReview: VocabularyItem[]
  todayProgress: {
    wordsStudied: number
    dailyGoal: number
    testsToday: number
    accuracyToday: number
  }
}

export interface TestBlock {
  blockNumber: number
  questions: TestQuestionData[]
  totalBlocks: number
}

export interface TestResult {
  testId: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeTaken: number
  incorrectWords: {
    word: string
    yourAnswer: string
    correctAnswer: string
    example: string
    explanation: string
  }[]
}

export interface ProgressChartData {
  date: string
  value: number
  label?: string
}

export interface SearchResult {
  id: string
  word: string
  translation: string | null
  pronunciation: string | null
  exampleSentence: string | null
  accuracy: number
  lastReviewed: string | null
  confidenceScore: number
}
