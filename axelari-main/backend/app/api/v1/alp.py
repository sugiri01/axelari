from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.modules.alp.service import ALPService
from pydantic import BaseModel

router = APIRouter()

class GeneratePathRequest(BaseModel):
    student_id: str
    grade: int
    subject: str

@router.post("/generate")
async def generate_path(request: GeneratePathRequest, db: Session = Depends(get_db)):
    service = ALPService(db)
    return service.generate_initial_path(request.student_id, request.grade, request.subject)

@router.get("/next-topic/{student_id}")
async def get_next_topic(student_id: str, db: Session = Depends(get_db)):
    service = ALPService(db)
    return service.get_next_topic(student_id)

@router.post("/schedule-reviews/{student_id}")
async def schedule_reviews(student_id: str):
    return {"message": "Reviews scheduled"}
