"""
Update session endpoints to use sample questions
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user_id
from pydantic import BaseModel
from typing import Optional, List
import json
import random
from datetime import datetime

# Try to import Redis, but make it optional
try:
    from app.core.redis_client import redis
    redis_client = redis
except Exception:
    redis_client = None
    print("⚠️ Redis not available, using in-memory session storage")

router = APIRouter()

# Import sample questions
from app.api.v1.questions import SAMPLE_QUESTIONS

class StartSessionRequest(BaseModel):
    student_id: str
    topic_id: Optional[str] = None
    difficulty: Optional[str] = "medium"
    num_questions: int = 5

class SubmitAnswerRequest(BaseModel):
    student_id: str
    question_id: str
    answer_given: str
    time_spent_seconds: int  # in seconds

# Global in-memory storage for sessions (fallback)
sessions_db = {}

@router.post("/start")
async def start_session(
    request: StartSessionRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Start a new learning session"""
    try:
        # Generate session ID
        session_id = f"session_{user_id}_{int(datetime.now().timestamp())}"
        
        # Select questions based on criteria
        filtered_questions = SAMPLE_QUESTIONS.copy()
        
        if request.topic_id:
            filtered_questions = [q for q in filtered_questions if q["topic_id"] == request.topic_id]
        
        if request.difficulty:
            filtered_questions = [q for q in filtered_questions if q["difficulty"] == request.difficulty]
        
        # Select random questions
        selected = random.sample(
            filtered_questions,
            min(request.num_questions, len(filtered_questions))
        ) if filtered_questions else SAMPLE_QUESTIONS[:request.num_questions]
        
        # Create session data
        session_data = {
            "session_id": session_id,
            "student_id": request.student_id,
            "questions": [q["id"] for q in selected],
            "current_index": 0,
            "answers": {},
            "started_at": datetime.now().isoformat(),
            "completed": False
        }
        
        # Store in Redis (or memory if Redis not available)
        stored = False
        try:
            if redis_client:
                redis_client.set(
                    f"session:{session_id}",
                    json.dumps(session_data),
                    ex=3600  # 1 hour expiry
                )
                stored = True
        except Exception as e:
            print(f"Redis error: {e}")
        
        if not stored:
            print(f"Storing session {session_id} in memory")
            sessions_db[session_id] = session_data
        
        return {
            "session_id": session_id,
            "total_questions": len(selected),
            "status": "started"
        }
        
    except Exception as e:
        print(f"Error starting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start session")

@router.get("/{session_id}/next-question")
async def get_next_question(
    session_id: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get next question in session"""
    try:
        # Try to retrieve session from Redis
        session_data = None
        try:
            if redis_client:
                session_json = redis_client.get(f"session:{session_id}")
                if session_json:
                    session_data = json.loads(session_json)
        except Exception as e:
            print(f"Redis error: {e}")
        
        # Try memory if not in Redis
        if not session_data:
            session_data = sessions_db.get(session_id)
        
        # If still not found, create a new session with sample questions (fallback for dev)
        if not session_data:
            print(f"Session {session_id} not found in Redis or memory, creating temp session")
            session_data = {
                "session_id": session_id,
                "questions": [q["id"] for q in SAMPLE_QUESTIONS[:5]],
                "current_index": 0,
                "answers": {},
                "completed": False
            }
            sessions_db[session_id] = session_data
        
        # Check if session completed
        if session_data.get("completed"):
            return {
                "session_id": session_id,
                "question": None,
                "question_number": session_data["current_index"],
                "total_questions": len(session_data["questions"]),
                "completed": True
            }
        
        # Get current question
        current_index = session_data.get("current_index", 0)
        questions_list = session_data.get("questions", [])
        
        if current_index >= len(questions_list):
            session_data["completed"] = True
            # Update storage
            if redis_client:
                try:
                    redis_client.set(f"session:{session_id}", json.dumps(session_data), ex=3600)
                except: pass
            sessions_db[session_id] = session_data
            
            return {
                "session_id": session_id,
                "question": None,
                "question_number": current_index,
                "total_questions": len(questions_list),
                "completed": True
            }
        
        question_id = questions_list[current_index]
        question = next((q for q in SAMPLE_QUESTIONS if q["id"] == question_id), None)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Return question without correct answer
        q_copy = question.copy()
        q_copy.pop('correct_answer', None)
        
        return {
            "session_id": session_id,
            "question": q_copy,
            "question_number": current_index + 1,
            "total_questions": len(questions_list),
            "completed": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting next question: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get next question")

from app.models import StudentProfile

@router.post("/{session_id}/submit-answer")
async def submit_answer(
    session_id: str,
    request: SubmitAnswerRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Submit answer for current question"""
    try:
        # Get session data
        session_data = None
        try:
            if redis_client:
                session_json = redis_client.get(f"session:{session_id}")
                if session_json:
                    session_data = json.loads(session_json)
        except Exception as e:
            print(f"Redis error: {e}")
        
        # Try memory if not in Redis
        if not session_data:
            session_data = sessions_db.get(session_id)
        
        if not session_data:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Find the question
        question = next((q for q in SAMPLE_QUESTIONS if q["id"] == request.question_id), None)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Check if answer is correct
        is_correct = question["correct_answer"] == request.answer_given
        
        # Store answer
        session_data["answers"][request.question_id] = {
            "answer_given": request.answer_given,
            "correct": is_correct,
            "time_spent_seconds": request.time_spent_seconds
        }
        
        # Move to next question
        session_data["current_index"] = session_data.get("current_index", 0) + 1
        
        # Update session in Redis and memory
        try:
            if redis_client:
                redis_client.set(
                    f"session:{session_id}",
                    json.dumps(session_data),
                    ex=3600
                )
        except Exception as e:
            print(f"Redis error: {e}")
            
        sessions_db[session_id] = session_data

        # Update Student Profile
        try:
            student_id = request.student_id
            profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
            
            if profile:
                # Update stats
                profile.total_interactions += 1
                
                # Simple moving average for accuracy (very basic)
                current_accuracy = profile.accuracy_consistency
                new_accuracy = (current_accuracy * (profile.total_interactions - 1) + (100 if is_correct else 0)) / profile.total_interactions
                profile.accuracy_consistency = new_accuracy
                
                db.commit()
        except Exception as e:
            print(f"Error updating profile: {e}")
            # Don't fail the request if profile update fails
        
        return {
            "is_correct": is_correct,
            "correct_answer": question["correct_answer"],
            "explanation": f"The correct answer is {question['correct_answer']}.",
            "updated_mastery": {
                "topic_id": question.get("topic_id", "math_001"),
                "mastery_score": 0.75 if is_correct else 0.5,
                "status": "improving" if is_correct else "needs_practice",
                "current_difficulty": question.get("difficulty", 1)
            },
            "profile_snapshot": {
                "processing_speed": 1.0,
                "accuracy_consistency": 0.8,
                "memory_retention": 0.7
            },
            "intervention": {
                "needs_intervention": not is_correct,
                "intervention_type": "hint" if not is_correct else "none",
                "message": "Try reviewing the basics" if not is_correct else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting answer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit answer")
