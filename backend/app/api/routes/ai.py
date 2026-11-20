from fastapi import APIRouter, HTTPException, status

from ...schemas.chat import ChatRequest, ChatResponse
from ...schemas.quiz import Quiz, QuizAnswerSubmission, QuizEvaluation, QuizGenerationRequest
from ...schemas.report import StudyReportRequest, StudyReportResponse
from ...schemas.summary import SummaryRequest, SummaryResponse

router = APIRouter(prefix="/api", tags=["ai-contracts"])

NOT_IMPLEMENTED_DETAIL = "This API contract is defined but not implemented in milestone 1."


def _not_implemented() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=NOT_IMPLEMENTED_DETAIL,
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={status.HTTP_501_NOT_IMPLEMENTED: {"description": NOT_IMPLEMENTED_DETAIL}},
)
def chat(payload: ChatRequest) -> ChatResponse:
    raise _not_implemented()


@router.post(
    "/quizzes/generate",
    response_model=Quiz,
    responses={status.HTTP_501_NOT_IMPLEMENTED: {"description": NOT_IMPLEMENTED_DETAIL}},
)
def generate_quiz(payload: QuizGenerationRequest) -> Quiz:
    raise _not_implemented()


@router.post(
    "/quizzes/answers",
    response_model=QuizEvaluation,
    responses={status.HTTP_501_NOT_IMPLEMENTED: {"description": NOT_IMPLEMENTED_DETAIL}},
)
def submit_quiz_answers(payload: QuizAnswerSubmission) -> QuizEvaluation:
    raise _not_implemented()


@router.post(
    "/summaries/generate",
    response_model=SummaryResponse,
    responses={status.HTTP_501_NOT_IMPLEMENTED: {"description": NOT_IMPLEMENTED_DETAIL}},
)
def generate_summary(payload: SummaryRequest) -> SummaryResponse:
    raise _not_implemented()


@router.post(
    "/study-reports/generate",
    response_model=StudyReportResponse,
    responses={status.HTTP_501_NOT_IMPLEMENTED: {"description": NOT_IMPLEMENTED_DETAIL}},
)
def generate_study_report(payload: StudyReportRequest) -> StudyReportResponse:
    raise _not_implemented()
