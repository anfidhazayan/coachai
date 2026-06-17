from pydantic import BaseModel, Field

class AnswerEvaluationSchema(BaseModel):
    score: int = Field(..., description="Score from 0 to 100 indicating answer quality.")
    strengths: list[str] = Field(..., description="Key strengths identified in the answer.")
    weaknesses: list[str] = Field(..., description="Weaknesses or gaps in the answer.")
    suggestions: list[str] = Field(..., description="Concrete suggestions to improve the answer.")
    model_answer: str = Field(..., description="A realistic model answer suited to the candidate's seniority.")
