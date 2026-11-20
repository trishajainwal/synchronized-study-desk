from datetime import datetime

from pydantic import Field

from ..enums import QuestionType, QuizDifficulty
from .common import StrictModel
from .evidence import EvidenceReference


class QuizGenerationRequest(StrictModel):
    document_id: str = Field(min_length=1, max_length=36)
    session_id: str | None = Field(default=None, max_length=100)
    chapter: str | None = Field(default=None, max_length=200)
    topic: str | None = Field(default=None, max_length=200)
    num_questions: int = Field(default=5, ge=1, le=50)
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM
    question_types: list[QuestionType] = Field(
        default_factory=lambda: [QuestionType.MULTIPLE_CHOICE]
    )


class QuizQuestion(StrictModel):
    id: str = Field(min_length=1, max_length=100)
    type: QuestionType
    prompt: str
    options: list[str] = Field(default_factory=list)
    page_references: list[int] = Field(default_factory=list)


class Quiz(StrictModel):
    id: str
    document_id: str
    chapter: str | None
    topic: str | None
    questions: list[QuizQuestion]


class QuizAnswerSubmission(StrictModel):
    quiz_id: str = Field(min_length=1, max_length=100)
    answers: dict[str, str]


class QuestionEvaluation(StrictModel):
    question_id: str
    correct: bool
    correct_answer: str
    evidence: list[EvidenceReference]
    explanation: str | None = None


class QuizEvaluation(StrictModel):
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    results: list[QuestionEvaluation]
    generated_at: datetime
