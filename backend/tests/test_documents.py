from fastapi.testclient import TestClient

from app.enums import DocumentStatus

from .helpers import build_pdf


def test_pdf_upload_extracts_pages_and_metadata(client: TestClient) -> None:
    response = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", build_pdf(["Chapter One", "Chapter Two"]), "application/pdf")},
    )

    assert response.status_code == 201
    document = response.json()
    assert document["status"] == DocumentStatus.READY.value
    assert document["page_count"] == 2
    assert document["original_filename"] == "chapter.pdf"
    assert document["sha256"]

    pages_response = client.get(f"/api/documents/{document['id']}/pages")
    assert pages_response.status_code == 200
    pages = pages_response.json()["pages"]
    assert [page["page_number"] for page in pages] == [1, 2]
    assert "Chapter One" in pages[0]["text"]
    assert "Chapter Two" in pages[1]["text"]
    assert pages[0]["char_count"] == len(pages[0]["text"])


def test_document_file_returns_original_pdf(client: TestClient) -> None:
    pdf_bytes = build_pdf(["Chapter One"])
    upload = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", pdf_bytes, "application/pdf")},
    )
    document = upload.json()

    response = client.get(f"/api/documents/{document['id']}/file")

    assert response.status_code == 200
    assert response.content == pdf_bytes
    assert response.headers["content-type"] == "application/pdf"


def test_upload_rejects_non_pdf(client: TestClient) -> None:
    response = client.post(
        "/api/documents",
        files={"file": ("notes.txt", b"not a pdf", "text/plain")},
    )

    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]


def test_get_missing_document_returns_404(client: TestClient) -> None:
    response = client.get("/api/documents/missing")

    assert response.status_code == 404
