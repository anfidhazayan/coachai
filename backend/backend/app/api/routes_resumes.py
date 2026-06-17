import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_parser import extract_text_from_pdf

router = APIRouter()

# In-memory database for resumes: {resume_id: {"filename": str, "raw_text": str}}
resumes_db = {}

@router.post("")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        raw_text = extract_text_from_pdf(content)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No readable text could be extracted from this PDF.")
            
        resume_id = str(uuid.uuid4())
        resumes_db[resume_id] = {
            "filename": file.filename,
            "raw_text": raw_text
        }
        
        return {
            "resume_id": resume_id,
            "filename": file.filename,
            "raw_text": raw_text
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.get("/{resume_id}")
async def get_resume(resume_id: str):
    if resume_id not in resumes_db:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resumes_db[resume_id]
