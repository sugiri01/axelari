from fastapi import APIRouter, HTTPException, Request
from app.core.ai_client import get_ai_client
from pydantic import BaseModel
from typing import List, Optional
import traceback

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    topic_id: Optional[str] = None

@router.post("/chat")
async def ai_tutor_chat(request: ChatRequest, http_request: Request):
    """AI Tutor chat endpoint using OpenRouter"""
    try:
        # Get AI client
        client = get_ai_client()
        
        if not client:
            return {
                "response": "AI service is currently unavailable. Please contact support.",
                "status": "error"
            }
        
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are an AI learning assistant helping students with their studies. 
You should:
- Explain concepts clearly and provide examples
- Adapt your explanations to the student's level
- Encourage critical thinking
- Be patient and supportive
- Keep responses concise and focused"""
            }
        ]
        
        # Add history
        for msg in request.history[-5:]:  # Only last 5 messages for context
            role = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role, "content": msg.content})
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Generate response using OpenRouter
        response = client.chat.completions.create(
            model="anthropic/claude-3-haiku",  # Switching to Claude 3 Haiku as requested
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            "response": ai_response,
            "status": "success"
        }
        
    except Exception as e:
        error_msg = str(e)
        traceback.print_exc()
        print(f"AI Tutor error: {error_msg}")
        
        return {
            "response": "I'm having trouble processing your request right now. Please try rephrasing your question or try again later.",
            "status": "error",
            "error_detail": error_msg
        }
