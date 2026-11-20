export const endpoints = {
  health: '/api/health',
  ollamaHealth: '/api/health/ollama',
  documents: '/api/documents',
  document: (documentId: string) => `/api/documents/${encodeURIComponent(documentId)}`,
  documentPages: (documentId: string) =>
    `/api/documents/${encodeURIComponent(documentId)}/pages`,
  documentFile: (documentId: string) =>
    `/api/documents/${encodeURIComponent(documentId)}/file`,
  annotations: (sessionId: string) =>
    `/api/sessions/${encodeURIComponent(sessionId)}/annotations`,
  annotation: (sessionId: string, annotationId: string) =>
    `/api/sessions/${encodeURIComponent(sessionId)}/annotations/${encodeURIComponent(annotationId)}`,
  readingPosition: (sessionId: string) =>
    `/api/sessions/${encodeURIComponent(sessionId)}/reading-position`,
  chat: '/api/chat',
  quizzesGenerate: '/api/quizzes/generate',
  quizzesAnswers: '/api/quizzes/answers',
  summariesGenerate: '/api/summaries/generate',
  studyReportsGenerate: '/api/study-reports/generate',
  sessionSocket: (sessionId: string) => `/api/ws/sessions/${encodeURIComponent(sessionId)}`,
}
