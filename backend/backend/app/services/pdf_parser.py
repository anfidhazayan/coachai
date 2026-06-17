import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts raw text from pdf bytes, cleaning up extra whitespaces,
    empty lines, and basic headers/footers.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        
        full_text = "\n".join(extracted_text)
        
        # Simple cleanup
        lines = full_text.splitlines()
        cleaned_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped:
                cleaned_lines.append(stripped)
                
        return "\n".join(cleaned_lines)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")
