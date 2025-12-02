from app.core.db import get_db
from sqlalchemy.orm import Session
from app.core.redis_client import get_redis_client
import uuid
import json

class SessionService:
    def __init__(self, db: Session):
        self.db = db
        self.redis = get_redis_client()

    def start_session(self, student_id: str, grade: int, subject: str):
        session_id = str(uuid.uuid4())
        session_data = {
            "student_id": student_id,
            "grade": grade,
            "subject": subject,
            "status": "active",
            "current_question_index": 0
        }
        # Store in Redis (Upstash)
        self.redis.set(f"session:{session_id}", json.dumps(session_data))
        return {"session_id": session_id, "message": "Session started"}

    def get_next_question(self, session_id: str):
        # Retrieve session from Redis
        session_data_str = self.redis.get(f"session:{session_id}")
        if not session_data_str:
            raise ValueError("Session not found")
        
        # Logic to get next question (mock)
        return {
            "session_id": session_id,
            "question": {
                "id": "q1",
                "topic_id": "t1",
                "question_text": "What is 5 + 7?",
                "question_type": "multiple_choice",
                "options": ["10", "11", "12", "13"],
                "difficulty": 1,
                "estimated_time_seconds": 30
            }
        }

    def submit_answer(self, session_id: str, student_id: str, question_id: str, answer_given: str, time_spent: int):
        # Logic to validate answer and update mastery
        # Mock response
        is_correct = (answer_given == "12")
        return {
            "is_correct": is_correct,
            "correct_answer": "12",
            "explanation": "5 + 7 equals 12",
            "updated_mastery": {
                "topic_id": "t1",
                "mastery_score": 85 if is_correct else 70,
                "status": "mastered" if is_correct else "learning",
                "current_difficulty": 2
            },
            "profile_snapshot": {
                "processing_speed": 60,
                "accuracy_consistency": 70,
                "memory_retention": 65
            },
            "intervention": {
                "needs_intervention": False,
                "intervention_type": "none",
                "message": None
            }
        }
