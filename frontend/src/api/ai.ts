import type { ChatRequest, ChatResponse } from '../types/chat'
import type { Quiz, QuizAnswerSubmission, QuizEvaluation, QuizGenerationRequest } from '../types/quiz'
import type { StudyReportRequest, StudyReportResponse } from '../types/report'
import type { SummaryRequest, SummaryResponse } from '../types/summary'
import { postJson } from './client'
import { endpoints } from './endpoints'

export function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return postJson<ChatResponse>(endpoints.chat, request)
}

export function generateQuiz(request: QuizGenerationRequest): Promise<Quiz> {
  return postJson<Quiz>(endpoints.quizzesGenerate, request)
}

export function submitQuizAnswers(request: QuizAnswerSubmission): Promise<QuizEvaluation> {
  return postJson<QuizEvaluation>(endpoints.quizzesAnswers, request)
}

export function generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
  return postJson<SummaryResponse>(endpoints.summariesGenerate, request)
}

export function generateStudyReport(request: StudyReportRequest): Promise<StudyReportResponse> {
  return postJson<StudyReportResponse>(endpoints.studyReportsGenerate, request)
}
