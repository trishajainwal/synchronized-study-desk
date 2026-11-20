import pymupdf


def build_pdf(page_texts: list[str]) -> bytes:
    document = pymupdf.open()
    for text in page_texts:
        page = document.new_page(width=400, height=400)
        page.insert_text((40, 60), text, fontsize=14)
    pdf_bytes = document.tobytes()
    document.close()
    return pdf_bytes
