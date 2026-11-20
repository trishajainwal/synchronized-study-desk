import type { EvidenceReference } from './evidence'

export type QuizDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false'

export interface QuizGenerationRequest {
  document_id: string
  session_id?: string | null
  chapter?: string | null
  topic?: string | null
  num_questions?: number
  difficulty?: QuizDifficulty
  question_types?: QuestionType[]
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  options?: string[]
  page_references?: number[]
}

export interface Quiz {
  id: string
  document_id: string
  chapter: string | null
  topic: string | null
  questions: QuizQuestion[]
}

export interface QuizAnswerSubmission {
  quiz_id: string
  answers: Record<string, string>
}

export interface QuestionEvaluation {
  question_id: string
  correct: boolean
  correct_answer: string
  evidence: EvidenceReference[]
  explanation?: string | null
}

export interface QuizEvaluation {
  quiz_id: string
  score: number
  total_questions: number
  percentage: number
  results: QuestionEvaluation[]
  generated_at: string
}
