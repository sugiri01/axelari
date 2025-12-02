from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user_id
from pydantic import BaseModel
from typing import Optional, List
import random

router = APIRouter()

class QuestionOption(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: str
    text: str
    options: List[QuestionOption]
    difficulty: str
    topic_id: str
    topic_name: str

# Sample questions database
SAMPLE_QUESTIONS = [
    {
        "id": "q1",
        "text": "What is the solution to the equation 2x + 5 = 13?",
        "options": [
            {"id": "a", "text": "x = 3"},
            {"id": "b", "text": "x = 4"},
            {"id": "c", "text": "x = 5"},
            {"id": "d", "text": "x = 6"}
        ],
        "correct_answer": "b",
        "difficulty": "easy",
        "topic_id": "topic_1",
        "topic_name": "Linear Equations"
    },
    {
        "id": "q2",
        "text": "Simplify: (3x + 2) + (5x - 7)",
        "options": [
            {"id": "a", "text": "8x - 5"},
            {"id": "b", "text": "8x + 5"},
            {"id": "c", "text": "2x - 5"},
            {"id": "d", "text": "2x + 5"}
        ],
        "correct_answer": "a",
        "difficulty": "easy",
        "topic_id": "topic_1",
        "topic_name": "Algebra Basics"
    },
    {
        "id": "q3",
        "text": "What is the area of a circle with radius 5 cm? (Use π ≈ 3.14)",
        "options": [
            {"id": "a", "text": "15.7 cm²"},
            {"id": "b", "text": "31.4 cm²"},
            {"id": "c", "text": "78.5 cm²"},
            {"id": "d", "text": "157 cm²"}
        ],
        "correct_answer": "c",
        "difficulty": "medium",
        "topic_id": "topic_5",
        "topic_name": "Circle Theorems"
    },
    {
        "id": "q4",
        "text": "In a right triangle, if one angle is 90° and another is 45°, what is the third angle?",
        "options": [
            {"id": "a", "text": "30°"},
            {"id": "b", "text": "45°"},
            {"id": "c", "text": "60°"},
            {"id": "d", "text": "90°"}
        ],
        "correct_answer": "b",
        "difficulty": "easy",
        "topic_id": "topic_4",
        "topic_name": "Triangles and Properties"
    },
    {
        "id": "q5",
        "text": "Solve for x: x² - 9 = 0",
        "options": [
            {"id": "a", "text": "x = 3 only"},
            {"id": "b", "text": "x = -3 only"},
            {"id": "c", "text": "x = ±3"},
            {"id": "d", "text": "No solution"}
        ],
        "correct_answer": "c",
        "difficulty": "medium",
        "topic_id": "topic_3",
        "topic_name": "Quadratic Equations"
    },
]

@router.get("/select")
async def select_questions(
    student_id: str,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 5,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Select questions for student based on criteria"""
    try:
        # Filter questions based on criteria
        filtered_questions = SAMPLE_QUESTIONS.copy()
        
        if topic_id:
            filtered_questions = [q for q in filtered_questions if q["topic_id"] == topic_id]
        
        if difficulty:
            filtered_questions = [q for q in filtered_questions if q["difficulty"] == difficulty]
        
        # Randomly select questions (in production, use intelligent selection)
        selected = random.sample(
            filtered_questions, 
            min(limit, len(filtered_questions))
        ) if filtered_questions else []
        
        # Remove correct_answer from response (security)
        result = []
        for q in selected:
            q_copy = q.copy()
            q_copy.pop('correct_answer', None)
            result.append(q_copy)
        
        return result
        
    except Exception as e:
        print(f"Error selecting questions: {str(e)}")
        return []

@router.get("/{question_id}")
async def get_question(
    question_id: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get specific question by ID"""
    try:
        # Find question
        question = next((q for q in SAMPLE_QUESTIONS if q["id"] == question_id), None)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Return without correct answer
        q_copy = question.copy()
        q_copy.pop('correct_answer', None)
        
        return q_copy
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting question: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve question")

@router.post("/{question_id}/validate")
async def validate_answer(
    question_id: str,
    answer: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Validate student's answer to a question"""
    try:
        # Find question
        question = next((q for q in SAMPLE_QUESTIONS if q["id"] == question_id), None)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        is_correct = question["correct_answer"] == answer
        
        return {
            "correct": is_correct,
            "correct_answer": question["correct_answer"],
            "explanation": f"The correct answer is {question['correct_answer']}."
        }
        
    except Exception as e:
        print(f"Error validating answer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate answer")
