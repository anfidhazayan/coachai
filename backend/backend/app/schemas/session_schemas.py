from pydantic import BaseModel, Field

class QuestionSchema(BaseModel):
    question_text: str = Field(..., description="The question text to ask the candidate.")
    category: str = Field(..., description="The category of the question: technical, behavioral, or project-specific.")
    difficulty: str = Field(..., description="The difficulty: easy, medium, or hard.")
    source_context: str = Field(..., description="The resume snippet or experience that motivated this question.")

class QuestionListSchema(BaseModel):
    questions: list[QuestionSchema] = Field(..., description="List of generated questions.")
