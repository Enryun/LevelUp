from io import BytesIO

from pypdf import PdfReader


def extract_pdf_text(pdf_bytes: bytes) -> tuple[str, int]:
    reader = PdfReader(BytesIO(pdf_bytes))
    page_text = []

    for page in reader.pages:
        text = page.extract_text() or ""
        page_text.append(text.strip())

    raw_text = "\n\n".join(text for text in page_text if text)

    return raw_text, len(reader.pages)
