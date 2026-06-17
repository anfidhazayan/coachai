from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_resumes import router as resumes_router
from app.api.routes_sessions import router as sessions_router

app = FastAPI(title="AI Interview Coach API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resumes_router, prefix="/api/resumes", tags=["resumes"])
app.include_router(sessions_router, prefix="/api/sessions", tags=["sessions"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
