from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user_id
from app.models import Student, StudentProfile
from pydantic import BaseModel

router = APIRouter()

class CreateProfileRequest(BaseModel):
    user_id: int
    email: str
    name: str
    grade: int = 8
    board: str = 'CBSE'

@router.get("/by-user/{user_id}")
async def get_profile_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get student profile by user_id from JWT"""
    # Verify user can only access their own profile
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return {"id": str(student.id), "email": student.email, "name": student.name}

@router.post("/create")
async def create_student_profile(
    request: CreateProfileRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create initial student profile"""
    # Verify user is creating their own profile
    if request.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if profile already exists
    existing = db.query(Student).filter(Student.user_id == request.user_id).first()
    if existing:
        return {"id": str(existing.id), "message": "Profile already exists"}
    
    # Create new student record
    new_student = Student(
        email=request.email,
        name=request.name,
        grade=request.grade,
        board=request.board,
        user_id=request.user_id
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Create initial student_profile
    new_profile = StudentProfile(
        student_id=new_student.id,
        processing_speed=50,
        accuracy_consistency=50,
        memory_retention=50,
        learning_style='visual',
        confidence_score=0.3,
        total_interactions=0
    )
    db.add(new_profile)
    db.commit()
    
    return {"id": str(new_student.id), "message": "Profile created"}

@router.get("/{student_id}")
async def get_student_profile(
    student_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get full student profile statistics"""
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
    
    if not profile:
        # If student exists but no profile, create default one
        student = db.query(Student).filter(Student.id == student_id).first()
        if student:
            profile = StudentProfile(
                student_id=student.id,
                processing_speed=50,
                accuracy_consistency=50,
                memory_retention=50,
                learning_style='visual',
                confidence_score=0.3,
                total_interactions=0
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "id": str(profile.id),
        "student_id": str(profile.student_id),
        "processing_speed": profile.processing_speed,
        "accuracy_consistency": profile.accuracy_consistency,
        "memory_retention": profile.memory_retention,
        "learning_style": profile.learning_style,
        "confidence_score": profile.confidence_score,
        "total_interactions": profile.total_interactions,
        "last_profile_update": profile.last_profile_update.isoformat() if profile.last_profile_update else None
    }
