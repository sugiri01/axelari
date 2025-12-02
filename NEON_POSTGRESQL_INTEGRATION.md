# UPDATED: Frontend-Backend Integration with Neon PostgreSQL
## Axelari Phase 2 - Using Neon Serverless PostgreSQL Pattern

**Date:** December 01, 2025 (Updated)  
**Critical Update:** Backend will use **Neon Serverless PostgreSQL** following Phase 1 auth-service pattern

---

## 🔴 CRITICAL UPDATE: NEON POSTGRESQL PATTERN

### Current Implementation (Phase 1 Auth Service)

**Location:** `auth-service/src/db/index.ts`

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
```

### Environment Configuration

**File:** `.env`
```env
DATABASE_URL="postgresql://neondb_owner:npg_TRYBdl1XtJ4v@ep-late-math-a1kby6oq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
PORT=3000
JWT_SECRET="axelari_secret_key_2024"
```

---

## 📋 BACKEND DATABASE PATTERN TO FOLLOW

The FastAPI backend **MUST** follow the same Neon PostgreSQL connection pattern established in Phase 1.

### For FastAPI Backend

**File:** `backend/app/core/db.py`

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import urllib.parse

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse and modify for SQLAlchemy if needed
# Neon URLs work directly with SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    # SQLAlchemy 2.0+ requires postgresql+psycopg2:// or postgresql+asyncpg://
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

# Create engine with SSL support for Neon
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Neon manages connections, don't pool
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
    },
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connection
def test_connection():
    """Test database connection on startup"""
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
```

### Backend Environment File

**File:** `backend/.env`
```env
# Use the SAME Neon database URL from Phase 1
DATABASE_URL=postgresql://neondb_owner:npg_TRYBdl1XtJ4v@ep-late-math-a1kby6oq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Redis for session management
REDIS_URL=redis://localhost:6379

# JWT Secret (use same as Phase 1 for compatibility)
JWT_SECRET=axelari_secret_key_2024

# Server config
PORT=8000
ENVIRONMENT=development
```

---

## 🔐 AUTHENTICATION ARCHITECTURE (UPDATED)

### Phase 1 + Phase 2 Integration

```
┌─────────────────┐
│   React Frontend │
│   (Port 5173)   │
└────────┬─────────┘
         │
         │ Login/Register
         ↓
┌─────────────────────┐
│  Phase 1 Auth       │
│  Node/Express       │  ← KEEP THIS
│  (Port 3000)        │
│  ✓ /auth/register   │
│  ✓ /auth/login      │
│  ✓ /auth/me         │
└──────────┬──────────┘
           │
           │ Returns JWT with user_id
           ↓
┌──────────────────────┐
│  Phase 2 FastAPI     │
│  (Port 8000)         │
│  All other endpoints │
│  Validates JWT       │
│  Uses student_id     │
└──────────┬───────────┘
           │
           │ Both access same DB
           ↓
    ┌──────────────┐
    │  Neon        │
    │  PostgreSQL  │
    │  (Serverless)│
    └──────────────┘
```

### Key Points:

1. **Phase 1 Auth Service STAYS** - No changes needed
2. **FastAPI validates JWT** - Decodes token from Phase 1
3. **Both use same Neon DB** - Shared database, different tables
4. **student_id from JWT** - FastAPI extracts from token

---

## 📊 DATABASE SCHEMA ORGANIZATION

### Same Neon Database, Different Tables

**Database Name:** `neondb`

**Phase 1 Tables (Auth Service):**
- `users` - User authentication records

**Phase 2 Tables (FastAPI):**
- `students` - Student profile information
- `student_profiles` - Cognitive profiles
- `topics` - Learning topics
- `questions` - Question bank
- `question_attempts` - Quiz history
- `mastery_state` - Topic mastery tracking
- `learning_paths` - Student learning paths
- `pattern_metrics` - Performance patterns
- `analytics_snapshots` - Analytics history

### Table Relationship

```sql
-- Phase 1 users table (existing)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2 students table (new - links to users)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,  -- Same as users.email
  name VARCHAR(255) NOT NULL,
  grade INT DEFAULT 8,
  board VARCHAR(50) DEFAULT 'CBSE',
  school_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Link: students.email = users.email
-- JWT contains users.id, lookup student by email
```

---

## 🔧 JWT TOKEN STRUCTURE

### Phase 1 Auth Service Generates:

```javascript
// auth-service/src/controllers/authController.ts
const generateToken = (userId: number) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30m' }
    );
};
```

**JWT Payload:**
```json
{
  "id": 123,
  "iat": 1638360000,
  "exp": 1638361800
}
```

### Phase 2 FastAPI Must Decode:

```python
# backend/app/core/security.py
import jwt
from fastapi import HTTPException, Header
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify JWT token from Phase 1 auth service"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        
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

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Extract user_id from JWT token"""
    payload = verify_token(authorization)
    return payload.get("id")

async def get_current_student_id(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> str:
    """Get student UUID from user_id in JWT"""
    user_id = await get_current_user_id(authorization)
    
    # Lookup student by user_id or email
    # You need to decide how to link users table to students table
    # Option 1: Add user_id column to students
    # Option 2: Link by email
    
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return str(student.id)
```

---

## 🔗 LINKING USERS TO STUDENTS

### Option 1: Add user_id Column (RECOMMENDED)

```sql
-- Add user_id to students table
ALTER TABLE students ADD COLUMN user_id INTEGER REFERENCES users(id);

-- When student profile created, store both
INSERT INTO students (email, name, grade, board, user_id)
VALUES ('user@example.com', 'John Doe', 8, 'CBSE', 123);
```

```python
# FastAPI can now directly lookup
def get_student_by_user_id(db: Session, user_id: int):
    return db.query(Student).filter(Student.user_id == user_id).first()
```

### Option 2: Link by Email

```python
# Lookup by email (requires getting email from users table)
def get_student_by_email(db: Session, email: str):
    return db.query(Student).filter(Student.email == email).first()
```

**Recommended:** Use Option 1 (user_id column) for direct linkage.

---

## 📝 UPDATED FRONTEND CHANGES

### Store Both user_id and student_id

**File:** `src/context/AuthContext.tsx`

```typescript
const login = async (email: string, password: string) => {
    // Call Phase 1 auth service (no change)
    const data = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    
    // NEW: Decode token to get user_id
    const decoded: any = jwtDecode(data.token);
    const userId = decoded.id;  // From Phase 1 JWT
    
    // NEW: Call FastAPI to get/create student profile
    const studentProfile = await getOrCreateStudentProfile(userId, email, data.user.name);
    localStorage.setItem('student_id', studentProfile.id);
    
    setToken(data.token);
    setUser(data.user);
};
```

### New Profile Service Function

**File:** `src/services/profileService.ts`

```typescript
import api from './api';

export const getOrCreateStudentProfile = async (
    userId: number, 
    email: string, 
    name: string
): Promise<{ id: string }> => {
    try {
        // Try to get existing profile
        const response = await api.get(`/api/v1/profile/by-user/${userId}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            // Profile doesn't exist, create it
            const createResponse = await api.post('/api/v1/profile/create', {
                user_id: userId,
                email: email,
                name: name,
                grade: 8,
                board: 'CBSE'
            });
            return createResponse.data;
        }
        throw error;
    }
};
```

---

## 🔌 BACKEND ENDPOINTS TO IMPLEMENT

### Authentication & Profile Endpoints

```python
# backend/app/api/v1/profiles.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/profile/by-user/{user_id}")
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

@router.post("/profile/create")
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
```

---

## 📦 BACKEND DEPENDENCIES

**File:** `backend/requirements.txt`

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9  # For Neon PostgreSQL
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
redis==5.0.1
pyjwt==2.8.0  # For JWT validation
bcrypt==4.1.1
```

---

## ✅ IMPLEMENTATION CHECKLIST FOR AI ASSISTANT

### Backend (FastAPI)

#### Week 1: Database Setup
- [ ] Create `backend/app/core/db.py` with Neon connection pattern
- [ ] Add `sslmode=require` for Neon
- [ ] Use `NullPool` for connection pooling
- [ ] Test connection on startup
- [ ] Create all Phase 2 database tables
- [ ] Add `user_id` column to `students` table
- [ ] Create indexes

#### Week 1: Authentication Integration
- [ ] Create `backend/app/core/security.py`
- [ ] Implement `verify_token()` function
- [ ] Implement `get_current_user_id()` dependency
- [ ] Implement `get_current_student_id()` dependency
- [ ] Use same JWT_SECRET as Phase 1
- [ ] Test JWT decoding

#### Week 1-2: Profile Endpoints
- [ ] `GET /api/v1/profile/by-user/{user_id}` - Get profile by user_id
- [ ] `POST /api/v1/profile/create` - Create student profile
- [ ] `GET /api/v1/profile/{student_id}` - Get profile by student_id
- [ ] `PUT /api/v1/profile/{student_id}` - Update profile

#### Week 2: Session Endpoints
- [ ] `POST /api/v1/session/start` - Start quiz session
- [ ] `GET /api/v1/session/{session_id}/next-question` - Get next question
- [ ] `POST /api/v1/session/{session_id}/submit-answer` - Submit answer
- [ ] Store sessions in Redis

### Frontend

#### Week 1: Auth Context Update
- [ ] Update `login()` to call `getOrCreateStudentProfile()`
- [ ] Update `register()` to call `getOrCreateStudentProfile()`
- [ ] Store both `user_id` and `student_id` in localStorage
- [ ] Update API interceptor to use correct base URL

#### Week 1: Service Layer
- [ ] Create `profileService.ts` with `getOrCreateStudentProfile()`
- [ ] Create `sessionService.ts` for quiz flow
- [ ] Update `api.ts` to point to FastAPI (port 8000)

---

## 🗄️ DATABASE MIGRATION SCRIPT

**File:** `backend/scripts/migrate_from_phase1.sql`

```sql
-- Run this on Neon database to add Phase 2 tables

-- Add user_id to students table (links to Phase 1 users)
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE students ADD CONSTRAINT fk_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update students table to use UUID primary keys
-- (Only if not already using UUID)
```

---

## 🚀 DEPLOYMENT CONFIGURATION

### Environment Variables

**Phase 1 Auth Service (.env):**
```env
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_TRYBdl1XtJ4v@ep-late-math-a1kby6oq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=axelari_secret_key_2024
```

**Phase 2 FastAPI (.env):**
```env
PORT=8000
DATABASE_URL=postgresql://neondb_owner:npg_TRYBdl1XtJ4v@ep-late-math-a1kby6oq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=axelari_secret_key_2024  # MUST match Phase 1
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development
```

**Frontend (.env):**
```env
VITE_AUTH_URL=http://localhost:3000  # Phase 1 auth service
VITE_FASTAPI_URL=http://localhost:8000  # Phase 2 backend
```

---

## 🔍 TESTING THE INTEGRATION

### Test Sequence

1. **Start Neon PostgreSQL** (already running - serverless)

2. **Start Phase 1 Auth Service:**
   ```bash
   cd auth-service
   npm install
   npm run dev  # Port 3000
   ```

3. **Start Phase 2 FastAPI:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

4. **Start Frontend:**
   ```bash
   cd axelari1-main
   npm install
   npm run dev  # Port 5173
   ```

5. **Test Flow:**
   - Register new user → Phase 1 creates user record
   - Frontend calls FastAPI → Creates student profile linked to user_id
   - Start quiz → FastAPI validates JWT from Phase 1
   - Submit answers → FastAPI stores in Phase 2 tables

---

## 📊 SUCCESS CRITERIA

- [ ] Phase 1 auth service running on port 3000
- [ ] Phase 2 FastAPI running on port 8000
- [ ] Both services connect to same Neon database
- [ ] JWT from Phase 1 validated by Phase 2
- [ ] Student profile created after first login
- [ ] Quiz session starts successfully
- [ ] Answers saved to Phase 2 tables
- [ ] No duplicate user/student records

---

## 🔐 SECURITY CONSIDERATIONS

### Critical Points:

1. **Same JWT_SECRET** - Both services MUST use identical secret
2. **SSL Required** - Neon requires `sslmode=require`
3. **Token Validation** - FastAPI must verify token from Phase 1
4. **User Isolation** - Users can only access their own data
5. **Connection Security** - Use connection pooling appropriately

### FastAPI Security Dependencies

```python
from fastapi import Security, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> Student:
    """Verify JWT and return current student"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        
        # Look up student by user_id
        student = db.query(Student).filter(Student.user_id == user_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return student
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 📝 SUMMARY FOR AI ASSISTANT

### Critical Requirements:

1. ✅ **Use Neon PostgreSQL** - Same database as Phase 1
2. ✅ **Keep Phase 1 Auth Service** - Don't rebuild authentication
3. ✅ **Validate Phase 1 JWT** - FastAPI decodes tokens from Node service
4. ✅ **Link Users to Students** - Add user_id column to students table
5. ✅ **Same JWT_SECRET** - Both services must share secret key
6. ✅ **SSL Mode Required** - Neon requires SSL connections
7. ✅ **Connection Pooling** - Use NullPool for Neon serverless

### Implementation Order:

**Week 1:**
1. Setup Neon connection in FastAPI
2. Add user_id to students table
3. Implement JWT validation
4. Create profile endpoints

**Week 2:**
5. Implement session endpoints
6. Update frontend to use both services
7. Test complete authentication flow

---

**Document Status:** Ready for Implementation with Neon PostgreSQL  
**Last Updated:** December 01, 2025  
**Version:** 2.0 (Neon Integration)
