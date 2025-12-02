import os
import jwt
from fastapi import HTTPException, Request
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

def verify_token(token: str) -> dict:
    """Verify JWT token from Phase 1 auth service"""
    try:
        # Decode JWT (same secret as Phase 1)
        payload = jwt.decode(
            token, 
            JWT_SECRET, 
            algorithms=[JWT_ALGORITHM]
        )
        return payload  # Contains {"id": 123, ...}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user_id(request: Request) -> int:
    """Extract user_id from JWT token in Authorization header"""
    authorization = request.headers.get("Authorization") or request.headers.get("authorization")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Extract token from "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]  # Remove "Bearer " prefix
    else:
        token = authorization
    
    payload = verify_token(token)
    user_id = payload.get("id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    return user_id
