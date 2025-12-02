from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Axelari Backend", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Axelari Backend"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from app.api.v1 import profiles, session, alp, ai, analytics, questions
app.include_router(profiles.router, prefix="/api/v1/profile", tags=["profiles"])
app.include_router(session.router, prefix="/api/v1/session", tags=["sessions"])
app.include_router(alp.router, prefix="/api/v1/learning-path", tags=["learning-path"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["questions"])
