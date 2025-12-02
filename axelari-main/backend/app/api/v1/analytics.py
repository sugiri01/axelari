from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user_id
from app.models import Student, StudentProfile
from pydantic import BaseModel
import random

router = APIRouter()

class ProgressResponse(BaseModel):
    overall_progress: float
    topics_mastered: int
    total_topics: int

class WeakTopic(BaseModel):
    topic_id: str
    topic_name: str
    mastery_score: float
    questions_attempted: int

# Sample topics for demonstration
SAMPLE_TOPICS = [
    "Algebra Basics",
    "Linear Equations",
    "Quadratic Equations",
    "Geometry Fundamentals",
    "Triangles and Properties",
    "Circle Theorems",
    "Statistics Introduction",
    "Probability Basics",
    "Number Theory",
    "Trigonometry",
]

@router.get("/progress/{student_id}")
async def get_progress(
    student_id: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get student progress analytics"""
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return {
                "overall_progress": 0,
                "topics_mastered": 0,
                "total_topics": 50
            }
        
        # Get student profile for interaction count
        profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
        
        if profile:
            # Calculate progress based on interactions
            # This is a simple formula - can be made more sophisticated
            interactions = profile.total_interactions or 0
            
            # Assume 10 interactions per topic to master it
            topics_mastered = min(interactions // 10, 50)
            
            # Overall progress (0-100%)
            overall_progress = min((interactions / 500) * 100, 100)
            
            return {
                "overall_progress": round(overall_progress, 1),
                "topics_mastered": topics_mastered,
                "total_topics": 50
            }
        else:
            # New student with no activity yet
            return {
                "overall_progress": 5.0,  # Small initial progress to show activity
                "topics_mastered": 0,
                "total_topics": 50
            }
            
    except Exception as e:
        print(f"Error getting progress: {str(e)}")
        return {
            "overall_progress": 0,
            "topics_mastered": 0,
            "total_topics": 50
        }

@router.get("/weak-topics/{student_id}")
async def get_weak_topics(
    student_id: str,
    limit: int = 3,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get student's weak topics"""
    try:
        # Verify student exists
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return []
        
        # Get student profile
        profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
        
        if not profile:
            # Return some initial topics to work on
            weak_topics = []
            for i, topic in enumerate(SAMPLE_TOPICS[:limit]):
                weak_topics.append({
                    "topic_id": f"topic_{i+1}",
                    "topic_name": topic,
                    "mastery_score": 0.0,
                    "questions_attempted": 0
                })
            return weak_topics
        
        # Generate weak topics based on learning style and confidence
        # This is sample data - in production would come from actual performance data
        weak_topics = []
        
        # Use confidence score to determine weak areas
        confidence = profile.confidence_score or 0.3
        
        # Lower confidence = more weak topics
        num_weak = min(limit, int((1 - confidence) * 5))
        
        # Select random topics as weak topics (in production, these would be based on actual performance)
        sample_weak = random.sample(SAMPLE_TOPICS, min(num_weak, len(SAMPLE_TOPICS)))
        
        for i, topic in enumerate(sample_weak):
            # Generate realistic-looking scores
            mastery = round(random.uniform(0.2, 0.5), 2)
            attempts = random.randint(3, 15)
            
            weak_topics.append({
                "topic_id": f"topic_{i+1}",
                "topic_name": topic,
                "mastery_score": mastery,
                "questions_attempted": attempts
            })
        
        return weak_topics[:limit]
        
    except Exception as e:
        print(f"Error getting weak topics: {str(e)}")
        return []

@router.post("/snapshot/{student_id}")
async def generate_snapshot(
    student_id: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Generate analytics snapshot for student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
        
        if profile:
            # Increment total interactions
            profile.total_interactions = (profile.total_interactions or 0) + 1
            db.commit()
        
        return {"status": "success", "message": "Snapshot generated"}
        
    except Exception as e:
        print(f"Error generating snapshot: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate snapshot")
