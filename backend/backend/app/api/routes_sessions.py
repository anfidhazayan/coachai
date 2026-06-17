import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.api.routes_resumes import resumes_db
from app.services.question_generator import generate_questions
from app.services.answer_evaluator import evaluate_answer

router = APIRouter()

# In-memory database for sessions:
# {
#   session_id: {
#     "id": str,
#     "resume_id": str,
#     "role_target": str,
#     "seniority": str,
#     "focus": str,
#     "questions": [
#       {
#         "id": str,
#         "question_text": str,
#         "category": str,
#         "difficulty": str,
#         "source_context": str,
#         "order_index": int,
#         "answer": {
#            "answer_text": str,
#            "score": int,
#            "strengths": list[str],
#            "weaknesses": list[str],
#            "suggestions": list[str],
#            "model_answer": str
#         } | None
#       }
#     ]
#   }
# }
sessions_db = {}

class CreateSessionRequest(BaseModel):
    resume_id: str
    role_target: str = Field("Software Engineer", description="Target role (e.g. Frontend Engineer, Product Manager)")
    seniority: str = Field("mid", description="Expected seniority (junior, mid, senior)")
    focus: str = Field("mixed", description="Focus of questions (technical, behavioral, mixed)")
    num_questions: int = Field(3, description="Number of questions to generate", ge=1, le=5)

class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str = Field(..., min_length=1, description="Candidate's answer text")

@router.post("")
async def create_session(request: CreateSessionRequest):
    if request.resume_id not in resumes_db:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload the resume first.")
        
    resume_text = resumes_db[request.resume_id]["raw_text"]
    
    try:
        gemini_result = generate_questions(
            raw_resume_text=resume_text,
            num_questions=request.num_questions,
            role_target=request.role_target,
            seniority=request.seniority,
            focus=request.focus
        )
        
        generated_questions = gemini_result.get("questions", [])
        
        if not generated_questions:
            raise HTTPException(status_code=500, detail="Gemini did not return any questions.")
            
        session_id = str(uuid.uuid4())
        questions_list = []
        for index, q in enumerate(generated_questions):
            questions_list.append({
                "id": str(uuid.uuid4()),
                "question_text": q.get("question_text", ""),
                "category": q.get("category", "technical"),
                "difficulty": q.get("difficulty", "medium"),
                "source_context": q.get("source_context", ""),
                "order_index": index,
                "answer": None
            })
            
        sessions_db[session_id] = {
            "id": session_id,
            "resume_id": request.resume_id,
            "role_target": request.role_target,
            "seniority": request.seniority,
            "focus": request.focus,
            "questions": questions_list
        }
        
        return sessions_db[session_id]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview session: {str(e)}")

@router.get("/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found.")
    return sessions_db[session_id]

@router.post("/{session_id}/answers")
async def submit_answer(session_id: str, request: SubmitAnswerRequest):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    session = sessions_db[session_id]
    
    # Find the question
    target_q = None
    for q in session["questions"]:
        if q["id"] == request.question_id:
            target_q = q
            break
            
    if not target_q:
        raise HTTPException(status_code=404, detail="Question not found in this session.")
        
    # Get the resume text
    resume_id = session["resume_id"]
    resume_text = resumes_db[resume_id]["raw_text"]
    
    try:
        eval_result = evaluate_answer(
            question_text=target_q["question_text"],
            source_context=target_q["source_context"],
            answer_text=request.answer_text,
            raw_resume_text=resume_text,
            seniority=session["seniority"]
        )
        
        answer_data = {
            "answer_text": request.answer_text,
            "score": eval_result.get("score", 0),
            "strengths": eval_result.get("strengths", []),
            "weaknesses": eval_result.get("weaknesses", []),
            "suggestions": eval_result.get("suggestions", []),
            "model_answer": eval_result.get("model_answer", "")
        }
        
        target_q["answer"] = answer_data
        
        return answer_data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")
