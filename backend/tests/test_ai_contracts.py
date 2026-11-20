from fastapi.testclient import TestClient


def test_ai_contracts_are_explicitly_not_implemented(client: TestClient) -> None:
    chat_response = client.post(
        "/api/chat",
        json={"session_id": "session-1", "question": "What does the source say?"},
    )
    assert chat_response.status_code == 501
    assert "not implemented" in chat_response.json()["detail"]

    quiz_response = client.post(
        "/api/quizzes/generate",
        json={"document_id": "doc-1", "num_questions": 3},
    )
    assert quiz_response.status_code == 501

    summary_response = client.post(
        "/api/summaries/generate",
        json={"document_id": "doc-1"},
    )
    assert summary_response.status_code == 501

    report_response = client.post(
        "/api/study-reports/generate",
        json={"session_id": "session-1", "document_id": "doc-1"},
    )
    assert report_response.status_code == 501
