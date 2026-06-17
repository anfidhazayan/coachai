import json
import google.generativeai as genai
from app.config import settings
from fastapi import HTTPException

# Configure SDK
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

def call_gemini_json(prompt: str, response_schema=None, model_name: str = "gemini-2.5-flash", temperature: float = 0.4) -> dict:
    """
    Call Gemini model and return a JSON parsed response.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server."
        )
    
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": temperature,
    }
    if response_schema:
        generation_config["response_schema"] = response_schema
        
    model = genai.GenerativeModel(
        model_name=model_name,
        generation_config=generation_config
    )
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        return json.loads(text)
    except json.JSONDecodeError as jde:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini returned invalid JSON structure: {str(jde)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API call failed: {str(e)}"
        )
