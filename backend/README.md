# Synchronized Study Desk — Backend Foundation

FastAPI backend for a local-first study assistant. This milestone provides the storage, document ingestion, Ollama connectivity check, typed API contracts, and WebSocket synchronization skeleton. It intentionally does **not** implement grounded chat answers, chunking/embeddings/FAISS/BM25 retrieval, quiz generation/evaluation, summaries, or study reports. Those routes return `501 Not Implemented` until their pipelines are built.

## Requirements

- Python 3.11+
- Ollama running locally if you want the Ollama health check to report a connected model
- No CUDA dependency; all current processing runs on CPU

## Installation

From this `backend` directory:

```bash
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Running

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:

- Health: `http://127.0.0.1:8000/api/health`
- Ollama check: `http://127.0.0.1:8000/api/health/ollama`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Tests

```bash
python -m pytest -q
```

## Configuration

All settings use the `STUDYDESK_` prefix and are defined in `.env.example`.

The local model is configured with:

```text
STUDYDESK_OLLAMA_MODEL=qwen3.5:4b
```

Change this value to whatever model is installed in your local Ollama instance. The model name is read from settings and is not hardcoded in the application logic.

`STUDYDESK_DATA_DIR` and `STUDYDESK_UPLOAD_DIR` may be absolute paths. Relative paths are resolved from the process working directory. The default database is SQLite at `data/studydesk.db`, and uploaded PDFs are stored under `data/uploads`.

## Implemented endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Application and database health |
| `GET` | `/api/health/ollama` | Ollama connection and configured-model availability |
| `POST` | `/api/documents` | Validate and upload a PDF, then extract page text |
| `GET` | `/api/documents` | List document metadata and processing status |
| `GET` | `/api/documents/{document_id}` | Get document metadata |
| `GET` | `/api/documents/{document_id}/pages` | Get extracted text with preserved page numbers |
| `POST` | `/api/sessions/{session_id}/annotations` | Create a persisted annotation |
| `GET` | `/api/sessions/{session_id}/annotations` | List annotations |
| `PATCH` | `/api/sessions/{session_id}/annotations/{annotation_id}` | Update an annotation |
| `DELETE` | `/api/sessions/{session_id}/annotations/{annotation_id}` | Delete an annotation |
| `GET` | `/api/sessions/{session_id}/reading-position` | Get the persisted reading position |
| `PUT` | `/api/sessions/{session_id}/reading-position` | Persist the reading position |
| `WS` | `/api/ws/sessions/{session_id}` | Shared-session synchronization events |

## WebSocket events

Connect with:

```text
ws://127.0.0.1:8000/api/ws/sessions/{session_id}?device_id={device_id}&document_id={document_id}
```

Client-to-server events:

- `page_changed`
- `citation_navigated`
- `annotation_create`
- `annotation_update`
- `annotation_delete`

Server-to-client events:

- `session_state`
- `connection_status`
- `page_changed`
- `citation_navigated`
- `annotation_created`
- `annotation_updated`
- `annotation_deleted`
- `error`

Every event includes `session_id`, optional `document_id`, `origin_device_id`, and `timestamp`. The server does not echo an event back to the originating device, so clients can use `origin_device_id` to prevent loops. Page state and annotations are persisted in SQLite; event broadcasting is independent of the AI routes.

## API contracts not yet implemented

These paths validate requests against typed Pydantic schemas and return `501`:

- `POST /api/chat`
- `POST /api/quizzes/generate`
- `POST /api/quizzes/answers`
- `POST /api/summaries/generate`
- `POST /api/study-reports/generate`

The future chat pipeline is designed to retrieve real document/page/chunk passages first, pass them to the model as evidence, refuse when evidence is inadequate, and return structured evidence references. The prompt builder and provider-independent retrieval protocol are already defined; no model call is made yet.
