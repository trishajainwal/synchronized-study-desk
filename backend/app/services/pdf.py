from dataclasses import dataclass

import pymupdf

from .errors import InvalidPdfError, PdfTooLargeError


@dataclass(frozen=True, slots=True)
class ExtractedPage:
    page_number: int
    text: str


@dataclass(frozen=True, slots=True)
class ExtractedPdf:
    page_count: int
    pages: list[ExtractedPage]


class PdfExtractor:
    def validate_upload(
        self,
        *,
        filename: str,
        content_type: str,
        size_bytes: int,
        max_bytes: int,
    ) -> None:
        normalized_content_type = content_type.lower()
        has_pdf_name = filename.lower().endswith(".pdf")
        has_pdf_content_type = normalized_content_type in {"application/pdf", "application/x-pdf"}
        if not has_pdf_name and not has_pdf_content_type:
            raise InvalidPdfError("Upload must be a PDF file.")
        if size_bytes <= 0:
            raise InvalidPdfError("Uploaded PDF is empty.")
        if size_bytes > max_bytes:
            raise PdfTooLargeError("Uploaded PDF exceeds the configured size limit.")

    def extract(self, data: bytes) -> ExtractedPdf:
        if not data.startswith(b"%PDF-"):
            raise InvalidPdfError("Uploaded file is not a valid PDF.")

        try:
            with pymupdf.open(stream=data, filetype="pdf") as pdf:
                if pdf.needs_pass:
                    raise InvalidPdfError("Password-protected PDFs are not supported.")
                pages = [
                    ExtractedPage(page_number=index + 1, text=page.get_text("text").strip())
                    for index, page in enumerate(pdf)
                ]
        except InvalidPdfError:
            raise
        except (pymupdf.FileDataError, RuntimeError, ValueError) as exc:
            raise InvalidPdfError(f"Could not read PDF: {exc}") from exc

        if not pages:
            raise InvalidPdfError("PDF has no readable pages.")

        return ExtractedPdf(page_count=len(pages), pages=pages)
