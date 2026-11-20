from pathlib import Path


class DocumentStorage:
    def __init__(self, upload_dir: Path) -> None:
        self.upload_dir = upload_dir

    def save(self, document_id: str, data: bytes) -> Path:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        path = self.upload_dir / f"{document_id}.pdf"
        path.write_bytes(data)
        return path

    def path(self, document_id: str) -> Path:
        return self.upload_dir / f"{document_id}.pdf"

    def delete(self, document_id: str) -> None:
        path = self.path(document_id)
        if path.exists():
            path.unlink()
